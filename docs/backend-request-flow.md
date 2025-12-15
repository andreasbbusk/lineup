# Backend Request Flow Documentation

This document describes how requests flow through the LineUp backend architecture, from initial HTTP request to final response. The backend uses an entity-based architecture with TSOA for route generation, Supabase for database operations, and a layered approach (Controller → Service → Database → Mapper → Response).

## Architecture Overview

The backend follows a **layered architecture** with clear separation of concerns:

```
HTTP Request
    ↓
Express Server (server.ts)
    ↓
TSOA Routes (auto-generated from controllers)
    ↓
Authentication Middleware (if required)
    ↓
Controller (handles HTTP layer, validation, delegates to service)
    ↓
Service (business logic, database operations)
    ↓
Supabase Client (database queries)
    ↓
Mapper (transforms database format to API format)
    ↓
Response (JSON sent to client)
```

## General Request Flow

### 1. **Server Initialization** (`server.ts`)
- Express server starts and applies middleware (CORS, JSON parsing)
- TSOA routes are registered via `RegisterRoutes()` from `tsoa-routes.ts`
- Global error handler middleware catches all errors

### 2. **Route Matching** (`tsoa-routes.ts`)
- Auto-generated file that maps HTTP methods and paths to controller methods
- Applies authentication middleware if route has `@Security("bearerAuth")` decorator
- Extracts and validates request parameters (path, query, body) using DTOs

### 3. **Authentication** (`authentication.ts`)
- `expressAuthentication` function validates JWT tokens
- Extracts user ID from token using Supabase Auth
- Returns `AuthenticatedUser` object or throws 401 if invalid
- Some endpoints allow optional authentication (returns public data if no token)

### 4. **Controller** (`entities/{entity}/{entity}.controller.ts`)
- Receives validated request data
- Uses `handleControllerRequest()` for error handling
- Extracts user ID if authenticated
- Delegates business logic to service layer
- Returns service result as HTTP response

### 5. **Service** (`entities/{entity}/{entity}.service.ts`)
- Contains business logic and database operations
- Uses Supabase client for queries (with RLS for security)
- Handles transactions, multiple queries, data validation
- Returns database results (raw or transformed)

### 6. **Mapper** (`entities/{entity}/{entity}.mapper.ts`)
- Transforms database format (snake_case) to API format (camelCase)
- Flattens nested relations
- Adds computed fields (e.g., engagement counts, user interaction state)
- Ensures consistent API response structure

### 7. **Error Handling**
- Errors are caught by `handleControllerRequest()` or global error handler
- `createHttpError()` creates standardized error responses
- Errors include status code, message, and error code
- Global handler formats errors as JSON responses

---

## Example 1: Simple Endpoint

### `GET /api/users/:username`

**Complexity:** Simple  
**Authentication:** Optional  
**Database Operations:** 1 query  
**Response Transformation:** Basic mapping

#### Flow Diagram

```
Client Request
    ↓
GET /api/users/johndoe
    ↓
TSOA Routes → UsersController.getUser()
    ↓
Authentication Middleware (optional - allows anonymous)
    ↓
Controller extracts username from path
    ↓
UsersService.getUserByUsername()
    ↓
Supabase: SELECT * FROM profiles WHERE username = 'johndoe'
    ↓
UsersMapper.mapProfileToAPI() (snake_case → camelCase)
    ↓
Response: UserProfile JSON
```

#### Step-by-Step

1. **Request Arrives**
   ```http
   GET /api/users/johndoe
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional)
   ```

2. **TSOA Route Matching** (`tsoa-routes.ts`)
   - Matches route pattern `/users/:username`
   - Extracts `username = "johndoe"` from path
   - Calls `UsersController.getUser(username, request)`

3. **Authentication** (`authentication.ts`)
   - If token present: validates and extracts user ID
   - If no token: allows request (optional auth endpoint)
   - Returns `AuthenticatedUser` or `undefined`

4. **Controller** (`users.controller.ts`)
   ```typescript
   @Get("{username}")
   public async getUser(
     @Path() username: string,
     @Request() request: ExpressRequest
   ): Promise<UserProfile> {
     return handleControllerRequest(this, async () => {
       let authenticatedUserId: string | undefined;
       
       // Try to extract user ID (may fail silently if no token)
       if (authHeader) {
         try {
           authenticatedUserId = await extractUserId(request);
         } catch (error) {
           authenticatedUserId = undefined;
         }
       }
       
       return this.usersService.getUserByUsername(username, authenticatedUserId);
     });
   }
   ```

5. **Service** (`users.service.ts`)
   ```typescript
   async getUserByUsername(
     username: string,
     authenticatedUserId?: string
   ): Promise<UserProfile> {
     // Single database query
     const { data: profile, error } = await supabase
       .from("profiles")
       .select("*")
       .eq("username", username)
       .single();
     
     if (error || !profile) {
       throw createHttpError({
         message: "User not found",
         statusCode: 404,
         code: "NOT_FOUND",
       });
     }
     
     // Determine if viewing own profile (for private fields)
     const isOwnProfile = authenticatedUserId === profile.id;
     return mapProfileToAPI(profile as ProfileRow, isOwnProfile);
   }
   ```

6. **Mapper** (`users.mapper.ts`)
   ```typescript
   export function mapProfileToAPI(
     profile: ProfileRow,
     includePrivateFields: boolean
   ): UserProfile {
     return {
       id: profile.id,
       username: profile.username,
       firstName: profile.first_name,  // snake_case → camelCase
       lastName: profile.last_name,
       avatarUrl: profile.avatar_url,
       // ... other fields
       
       // Private fields only if viewing own profile
       ...(includePrivateFields && {
         phoneNumber: profile.phone_number,
         yearOfBirth: profile.year_of_birth,
       }),
     };
   }
   ```

7. **Response**
   ```json
   {
     "id": "123e4567-e89b-12d3-a456-426614174000",
     "username": "johndoe",
     "firstName": "John",
     "lastName": "Doe",
     "avatarUrl": "https://...",
     "bio": "Musician",
     "location": "New York, NY",
     "userType": "artist",
     "onboardingCompleted": true,
     "createdAt": "2024-01-15T10:30:00Z"
   }
   ```

**Key Points:**
- Single database query
- Optional authentication (public vs private data)
- Simple transformation (snake_case to camelCase)
- No complex joins or aggregations

---

## Example 2: Medium Complexity Endpoint

### `POST /api/posts`

**Complexity:** Medium  
**Authentication:** Required  
**Database Operations:** Multiple queries (post + metadata + media + tagged users)  
**Response Transformation:** Complex mapping with nested relations

#### Flow Diagram

```
Client Request
    ↓
POST /api/posts (with body)
    ↓
TSOA Routes → PostsController.createPost()
    ↓
Authentication Middleware (required)
    ↓
DTO Validation (class-validator)
    ↓
Controller extracts user ID
    ↓
PostsService.createPost()
    ↓
Supabase Transaction:
  - INSERT post
  - INSERT/UPDATE metadata (tags)
  - INSERT post_metadata relations
  - INSERT post_media relations
  - INSERT post_tagged_users relations
    ↓
Fetch complete post with relations
    ↓
PostsMapper.mapPostToResponse()
    ↓
Response: PostResponse JSON
```

#### Step-by-Step

1. **Request Arrives**
   ```http
   POST /api/posts
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   
   {
     "type": "note",
     "title": "New Song Release",
     "description": "Check out my latest track!",
     "tags": ["indie", "rock"],
     "media": [{"url": "...", "type": "image"}],
     "taggedUsers": ["user-id-1", "user-id-2"]
   }
   ```

2. **TSOA Route Matching**
   - Matches `POST /posts`
   - Validates request body against `CreatePostBody` DTO
   - Applies authentication middleware (required)

3. **DTO Validation** (`posts.dto.ts`)
   ```typescript
   export class CreatePostBody {
     @IsEnum(["note", "request", "story"])
     type!: PostType;
     
     @IsString()
     @MinLength(1)
     @MaxLength(200)
     title!: string;
     
     @IsString()
     @MinLength(1)
     description!: string;
     
     @IsOptional()
     @IsArray()
     tags?: string[];
     
     // ... other fields
   }
   ```
   - `class-validator` decorators validate request body
   - Invalid data returns 400 Bad Request

4. **Authentication**
   - Validates JWT token
   - Extracts user ID: `"user-123"`

5. **Controller** (`posts.controller.ts`)
   ```typescript
   @Security("bearerAuth")
   @Post("/")
   public async createPost(
     @Body() body: CreatePostBody,
     @Request() req: ExpressRequest
   ): Promise<PostResponse> {
     return handleControllerRequest(
       this,
       async () => {
         const userId = await extractUserId(req);
         return this.postsService.createPost(userId, body);
       },
       201  // Success status code
     );
   }
   ```

6. **Service** (`posts.service.ts`)
   ```typescript
   async createPost(
     userId: string,
     postData: CreatePostBody
   ): Promise<PostResponse> {
     // 1. Insert the post
     const { data: newPost, error: postError } = await supabase
       .from("posts")
       .insert({
         author_id: userId,
         type: postData.type,
         title: postData.title.trim(),
         description: postData.description.trim(),
       })
       .select()
       .single();
     
     if (postError) throw createHttpError({ ... });
     
     const postId = newPost.id;
     
     // 2. Handle tags (find or create metadata)
     if (postData.tags?.length > 0) {
       for (const tagName of postData.tags) {
         // Find existing metadata or create new
         let metadataId = await findOrCreateMetadata(tagName);
         
         // Link post to metadata
         await supabase.from("post_metadata").insert({
           post_id: postId,
           metadata_id: metadataId,
         });
       }
     }
     
     // 3. Handle media
     if (postData.media?.length > 0) {
       for (const [index, mediaItem] of postData.media.entries()) {
         // Find or create media record
         let mediaId = await findOrCreateMedia(mediaItem);
         
         // Link post to media
         await supabase.from("post_media").insert({
           post_id: postId,
           media_id: mediaId,
           display_order: index,
         });
       }
     }
     
     // 4. Handle tagged users
     if (postData.taggedUsers?.length > 0) {
       await supabase.from("post_tagged_users").insert(
         postData.taggedUsers.map(userId => ({
           post_id: postId,
           user_id: userId,
         }))
       );
     }
     
     // 5. Fetch complete post with all relations
     const { data: completePost } = await supabase
       .from("posts")
       .select(`
         *,
         author:profiles!posts_author_id_fkey(*),
         metadata:post_metadata(metadata:metadata(*)),
         media:post_media(media:media(*)),
         tagged_users:post_tagged_users(user:profiles(*))
       `)
       .eq("id", postId)
       .single();
     
     return mapPostToResponse(completePost);
   }
   ```

7. **Mapper** (`posts.mapper.ts`)
   ```typescript
   export function mapPostToResponse(post: PostRowWithRelations): PostResponse {
     return {
       // Flatten post fields (snake_case → camelCase)
       id: post.id,
       authorId: post.author_id,
       type: post.type,
       title: post.title,
       description: post.description,
       createdAt: post.created_at,
       
       // Transform nested author relation
       author: {
         id: post.author.id,
         username: post.author.username,
         firstName: post.author.first_name,
         lastName: post.author.last_name,
         avatarUrl: post.author.avatar_url,
       },
       
       // Transform metadata array
       metadata: post.metadata.map(pm => ({
         id: pm.metadata.id,
         name: pm.metadata.name,
         type: pm.metadata.type,
       })),
       
       // Transform media array (sorted by display_order)
       media: post.media
         .sort((a, b) => a.display_order - b.display_order)
         .map(pm => ({
           id: pm.media.id,
           url: pm.media.url,
           thumbnailUrl: pm.media.thumbnail_url,
           type: pm.media.type,
         })),
       
       // Transform tagged users array
       taggedUsers: post.tagged_users.map(ptu => ({
         id: ptu.user.id,
         username: ptu.user.username,
         firstName: ptu.user.first_name,
         lastName: ptu.user.last_name,
       })),
     };
   }
   ```

8. **Response** (201 Created)
   ```json
   {
     "id": "post-123",
     "authorId": "user-123",
     "type": "note",
     "title": "New Song Release",
     "description": "Check out my latest track!",
     "createdAt": "2024-01-20T15:30:00Z",
     "author": {
       "id": "user-123",
       "username": "johndoe",
       "firstName": "John",
       "lastName": "Doe",
       "avatarUrl": "https://..."
     },
     "metadata": [
       {"id": "meta-1", "name": "indie", "type": "tag"},
       {"id": "meta-2", "name": "rock", "type": "tag"}
     ],
     "media": [
       {"id": "media-1", "url": "https://...", "type": "image"}
     ],
     "taggedUsers": [
       {"id": "user-1", "username": "friend1", "firstName": "Friend", "lastName": "One"}
     ]
   }
   ```

**Key Points:**
- Multiple database operations (post + relations)
- Transaction-like behavior (all or nothing)
- Complex nested data transformation
- DTO validation ensures data integrity

---

## Example 3: Complex Endpoint

### `GET /api/feed?component=posts&cursor=2024-01-20T10:00:00Z&limit=20`

**Complexity:** Complex  
**Authentication:** Required  
**Database Operations:** Multiple queries, joins, aggregations, pagination  
**Response Transformation:** Complex mapping with engagement data

#### Flow Diagram

```
Client Request
    ↓
GET /api/feed?component=posts&cursor=...&limit=20
    ↓
TSOA Routes → FeedController.getFeed()
    ↓
Authentication Middleware (required)
    ↓
Controller extracts query params
    ↓
FeedService.getPostsFeed()
    ↓
Multiple Supabase Queries:
  1. Get user's connections (requester)
  2. Get user's connections (recipient)
  3. Get posts from connected users (with joins)
  4. Get likes count (aggregation)
  5. Get comments count (aggregation)
  6. Get bookmarks count (aggregation)
  7. Get user's likes (filter)
  8. Get user's bookmarks (filter)
    ↓
FeedMapper.mapPostsToFeedResponse() (adds engagement data)
    ↓
Response: { posts: [...], nextCursor: "..." }
```

#### Step-by-Step

1. **Request Arrives**
   ```http
   GET /api/feed?component=posts&cursor=2024-01-20T10:00:00Z&limit=20
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **TSOA Route Matching**
   - Matches `GET /feed`
   - Extracts query parameters: `component`, `cursor`, `limit`
   - Applies authentication middleware

3. **Authentication**
   - Validates JWT token
   - Extracts user ID: `"user-123"`

4. **Controller** (`feed.controller.ts`)
   ```typescript
   @Security("bearerAuth")
   @Get("/")
   public async getFeed(
     @Query() component?: "posts" | "recommendations" | "stories",
     @Query() cursor?: string,
     @Query() limit?: number,
     @Request() request?: ExpressRequest
   ): Promise<{ posts: FeedPostResponse[]; nextCursor?: string }> {
     return handleControllerRequest(this, async () => {
       const userId = await extractUserId(request!);
       const token = request!.headers.authorization?.replace("Bearer ", "") || "";
       
       const feedComponent = component || "posts";
       const feedLimit = limit || 20;
       
       if (feedComponent === "posts") {
         return this.feedService.getPostsFeed(userId, token, cursor, feedLimit);
       }
       // ... handle other components
     });
   }
   ```

5. **Service** (`feed.service.ts`)
   ```typescript
   async getPostsFeed(
     userId: string,
     token: string,
     cursor?: string,
     limit: number = 20
   ): Promise<{ posts: FeedPostResponse[]; nextCursor?: string }> {
     const authedSupabase = createAuthenticatedClient(token);
     
     // 1. Get connections where user is requester
     const { data: requesterConnections } = await authedSupabase
       .from("connection_requests")
       .select("recipient_id")
       .eq("requester_id", userId)
       .eq("status", "accepted");
     
     // 2. Get connections where user is recipient
     const { data: recipientConnections } = await authedSupabase
       .from("connection_requests")
       .select("requester_id")
       .eq("recipient_id", userId)
       .eq("status", "accepted");
     
     // 3. Build set of followed user IDs
     const followedUserIds = new Set<string>();
     requesterConnections?.forEach(conn => followedUserIds.add(conn.recipient_id));
     recipientConnections?.forEach(conn => followedUserIds.add(conn.requester_id));
     
     if (followedUserIds.size === 0) {
       return { posts: [] };
     }
     
     // 4. Fetch posts from followed users (with all relations)
     let query = authedSupabase
       .from("posts")
       .select(`
         *,
         author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url),
         metadata:post_metadata(metadata:metadata(id, name, type)),
         media:post_media(display_order, media:media(id, url, thumbnail_url, type)),
         tagged_users:post_tagged_users(user:profiles(id, username, first_name, last_name, avatar_url))
       `)
       .in("author_id", Array.from(followedUserIds))
       .order("created_at", { ascending: false })
       .limit(limit + 1); // Fetch one extra for pagination
     
     // Apply cursor-based pagination
     if (cursor) {
       query = query.lt("created_at", cursor);
     }
     
     const { data: posts, error: postsError } = await query;
     
     if (postsError) throw createHttpError({ ... });
     
     // Determine pagination
     const hasNextPage = posts.length > limit;
     const postsToReturn = hasNextPage ? posts.slice(0, limit) : posts;
     const nextCursor = hasNextPage
       ? postsToReturn[postsToReturn.length - 1].created_at ?? undefined
       : undefined;
     
     // 5. Get engagement counts for all posts (aggregations)
     const postIds = postsToReturn.map(p => p.id);
     
     // Likes count
     const { data: likesData } = await authedSupabase
       .from("post_likes")
       .select("post_id")
       .in("post_id", postIds);
     
     const likesCountMap = new Map<string, number>();
     likesData?.forEach(like => {
       likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1);
     });
     
     // Comments count
     const { data: commentsData } = await authedSupabase
       .from("comments")
       .select("post_id")
       .in("post_id", postIds);
     
     const commentsCountMap = new Map<string, number>();
     commentsData?.forEach(comment => {
       commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1);
     });
     
     // Bookmarks count
     const { data: bookmarksData } = await authedSupabase
       .from("bookmarks")
       .select("post_id")
       .in("post_id", postIds);
     
     const bookmarksCountMap = new Map<string, number>();
     bookmarksData?.forEach(bookmark => {
       bookmarksCountMap.set(bookmark.post_id, (bookmarksCountMap.get(bookmark.post_id) || 0) + 1);
     });
     
     // 6. Get user's interaction state (has liked, has bookmarked)
     const { data: userLikes } = await authedSupabase
       .from("post_likes")
       .select("post_id")
       .eq("user_id", userId)
       .in("post_id", postIds);
     
     const hasLikedMap = new Set(userLikes?.map(l => l.post_id) || []);
     
     const { data: userBookmarks } = await authedSupabase
       .from("bookmarks")
       .select("post_id")
       .eq("user_id", userId)
       .in("post_id", postIds);
     
     const hasBookmarkedMap = new Set(userBookmarks?.map(b => b.post_id) || []);
     
     // 7. Transform posts with engagement data
     const feedPosts = mapPostsToFeedResponse(
       postsToReturn as (PostRow & any)[],
       likesCountMap,
       commentsCountMap,
       bookmarksCountMap,
       hasLikedMap,
       hasBookmarkedMap
     );
     
     return {
       posts: feedPosts,
       nextCursor,
     };
   }
   ```

6. **Mapper** (`feed.mapper.ts`)
   ```typescript
   export function mapPostsToFeedResponse(
     posts: (PostRow & any)[],
     likesCountMap: Map<string, number>,
     commentsCountMap: Map<string, number>,
     bookmarksCountMap: Map<string, number>,
     hasLikedMap: Set<string>,
     hasBookmarkedMap: Set<string>
   ): FeedPostResponse[] {
     return posts.map(post => {
       const basePost = mapPostToResponse(post); // Use posts mapper
       
       return {
         ...basePost,
         // Add engagement data
         engagement: {
           likesCount: likesCountMap.get(post.id) || 0,
           commentsCount: commentsCountMap.get(post.id) || 0,
           bookmarksCount: bookmarksCountMap.get(post.id) || 0,
         },
         // Add user interaction state
         hasLiked: hasLikedMap.has(post.id),
         hasBookmarked: hasBookmarkedMap.has(post.id),
       };
     });
   }
   ```

7. **Response**
   ```json
   {
     "posts": [
       {
         "id": "post-1",
         "authorId": "user-456",
         "type": "note",
         "title": "New Album Out Now",
         "description": "Check it out!",
         "createdAt": "2024-01-20T12:00:00Z",
         "author": {
           "id": "user-456",
           "username": "artist1",
           "firstName": "Artist",
           "lastName": "One",
           "avatarUrl": "https://..."
         },
         "metadata": [...],
         "media": [...],
         "engagement": {
           "likesCount": 42,
           "commentsCount": 8,
           "bookmarksCount": 15
         },
         "hasLiked": true,
         "hasBookmarked": false
       },
       // ... more posts
     ],
     "nextCursor": "2024-01-19T10:00:00Z"
   }
   ```

**Key Points:**
- Multiple sequential queries (connections, posts, aggregations)
- Complex joins with nested relations
- Aggregations (counts) computed separately
- Cursor-based pagination
- User-specific interaction state (hasLiked, hasBookmarked)
- Reuses existing mappers and adds engagement layer

---

## Error Handling Flow

Errors can occur at any layer and are handled consistently:

1. **Validation Errors** (400 Bad Request)
   - DTO validation fails (class-validator)
   - Invalid request parameters

2. **Authentication Errors** (401 Unauthorized)
   - Missing or invalid JWT token
   - Token expired

3. **Authorization Errors** (403 Forbidden)
   - User doesn't have permission to access resource
   - Trying to modify another user's data

4. **Not Found Errors** (404 Not Found)
   - Resource doesn't exist
   - User not found, post not found, etc.

5. **Database Errors** (500 Internal Server Error)
   - Supabase query fails
   - Connection issues
   - Constraint violations

**Error Response Format:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "statusCode": 404
  }
}
```

All errors are caught by:
- `handleControllerRequest()` in controllers
- Global error handler middleware in `server.ts`

---

## Key Architecture Patterns

### 1. **Entity-Based Organization**
Each domain entity has its own folder:
```
entities/
  users/
    users.controller.ts
    users.service.ts
    users.dto.ts
    users.mapper.ts
```

### 2. **DTO Validation**
Request data is validated using `class-validator` decorators before reaching the service layer.

### 3. **Mapper Pattern**
Database results are transformed to API format using mapper functions, ensuring:
- Consistent response structure
- snake_case → camelCase conversion
- Nested relation flattening
- Computed field addition

### 4. **Row Level Security (RLS)**
Supabase RLS policies ensure users can only access/modify data they're authorized for, even if service code has bugs.

### 5. **Type Safety**
TypeScript types from `supabase-helpers.ts` and `api.types.ts` ensure type safety throughout the stack.

---

## Summary

The backend follows a clean, layered architecture:

- **Simple endpoints**: Single query, basic transformation
- **Medium endpoints**: Multiple operations, complex transformations
- **Complex endpoints**: Multiple queries, aggregations, pagination, engagement data

All endpoints share the same flow pattern, making the codebase predictable and maintainable.

