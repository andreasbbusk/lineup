# Database Communication Guide

This guide explains how our backend communicates with the Supabase database, how types are generated, and how to use them effectively in our API.

## Table of Contents

1. [Overview](#overview)
2. [Supabase Client Setup](#supabase-client-setup)
3. [Type Generation](#type-generation)
4. [Understanding Generated Types](#understanding-generated-types)
5. [Using Supabase Helpers](#using-supabase-helpers)
6. [Database Operations](#database-operations)
7. [Authentication & RLS](#authentication--rls)
8. [Best Practices](#best-practices)
9. [Examples](#examples)

---

## Overview

Our backend uses **Supabase** as the database and authentication provider. Supabase is built on PostgreSQL and provides:

- **PostgreSQL Database** - Full-featured relational database
- **Row Level Security (RLS)** - Database-level security policies
- **TypeScript Types** - Auto-generated types from database schema
- **Real-time Subscriptions** - (Not used in our current implementation)

### Architecture Flow

```
API Controller → Service → Supabase Client → PostgreSQL Database
                      ↓
                  Type Safety
                  (Generated Types)
```

---

## Supabase Client Setup

### Configuration

The Supabase client is configured in `src/config/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Key Points:**
- The client is typed with `Database` type from generated types
- Uses environment variables: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- This is the **default client** - uses anonymous key (for public operations)

### Environment Variables

Required in your `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # Optional, for admin operations
```

---

## Type Generation

### How Types Are Generated

TypeScript types are automatically generated from your Supabase database schema using the Supabase CLI.

### Generating Types

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   # OR use npx (recommended)
   npx supabase login
   ```

2. **Generate Types**:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
   ```

   Or if you have a local Supabase setup:
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

3. **When to Regenerate**:
   - After any database schema changes (new tables, columns, enums)
   - After adding/modifying database constraints
   - When you pull changes that include schema updates

### Important Notes

- **Never manually edit `src/types/supabase.ts`** - It's auto-generated
- **Commit the generated file** - So the team stays in sync
- **Regenerate after schema changes** - Keep types in sync with database

---

## Understanding Generated Types

The generated `supabase.ts` file contains a `Database` type that represents your entire database schema.

### Structure Overview

```typescript
export type Database = {
  public: {
    Tables: {
      [tableName]: {
        Row: { ... }      // What you get when reading
        Insert: { ... }   // What you need to insert
        Update: { ... }   // What you can update
        Relationships: [ ... ]  // Foreign key relationships
      }
    }
    Enums: {
      [enumName]: "value1" | "value2" | ...
    }
  }
}
```

### Type Categories

#### 1. **Row Types** - What you get from the database

```typescript
// Example: posts table
Row: {
  id: string
  author_id: string
  title: string
  description: string
  type: "note" | "request" | "story"
  created_at: string | null
  updated_at: string | null
  // ... all columns with their actual types
}
```

**Usage:** When you query data, you get `Row` types.

#### 2. **Insert Types** - What you need to create records

```typescript
Insert: {
  id?: string              // Optional (auto-generated)
  author_id: string        // Required
  title: string           // Required
  description: string     // Required
  created_at?: string | null  // Optional (has default)
  // ... only required fields + optional fields
}
```

**Usage:** When inserting new records, use `Insert` types.

#### 3. **Update Types** - What you can modify

```typescript
Update: {
  id?: string             // Optional (usually can't update)
  title?: string          // All fields optional
  description?: string
  // ... all fields are optional
}
```

**Usage:** When updating records, use `Update` types.

#### 4. **Enums** - Database enum types

```typescript
Enums: {
  post_type: "note" | "request" | "story"
  media_type: "image" | "video"
  metadata_type: "tag" | "genre" | "artist"
}
```

**Usage:** Type-safe enum values from your database.

### Accessing Types

**Direct access (verbose):**
```typescript
import { Database } from "../types/supabase.js";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostType = Database["public"]["Enums"]["post_type"];
```

**Using helpers (recommended):**
```typescript
import { PostRow, PostInsert, PostType } from "../utils/supabase-helpers.js";
```

---

## Using Supabase Helpers

### Purpose

The `supabase-helpers.ts` file provides **convenient type aliases** for commonly used database types, making imports cleaner and easier to maintain.

### Location

`src/utils/supabase-helpers.ts`

### Current Helpers

```typescript
// Posts table types
export type PostRow = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

// Profiles table types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Enums
export type PostType = Database["public"]["Enums"]["post_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];
```

### Adding New Helpers

When you start using a new table, add its types to `supabase-helpers.ts`:

```typescript
// New table: notifications
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];
```

### Benefits

1. **Cleaner imports** - `PostRow` instead of `Database["public"]["Tables"]["posts"]["Row"]`
2. **Easier refactoring** - Change in one place if structure changes
3. **Better IDE support** - Autocomplete works better with shorter names
4. **Team consistency** - Everyone uses the same type names

---

## Database Operations

### Basic CRUD Operations

#### 1. **SELECT (Read)**

```typescript
import { supabase } from "../../config/supabase.js";
import { PostRow } from "../../utils/supabase-helpers.js";

// Get all posts
const { data: posts, error } = await supabase
  .from("posts")
  .select("*");

// Get single post by ID
const { data: post, error } = await supabase
  .from("posts")
  .select("*")
  .eq("id", postId)
  .single();

// Get posts with filters
const { data: posts, error } = await supabase
  .from("posts")
  .select("*")
  .eq("type", "note")
  .order("created_at", { ascending: false })
  .limit(10);
```

**Type Safety:**
- `data` is typed as `PostRow[]` or `PostRow | null`
- `error` is typed as `PostgrestError | null`

#### 2. **INSERT (Create)**

```typescript
import { supabase } from "../../config/supabase.js";
import { PostInsert } from "../../utils/supabase-helpers.js";

const newPost: PostInsert = {
  author_id: userId,
  type: "note",
  title: "My Post",
  description: "Post content",
  location: null,
  paid_opportunity: null,
};

const { data: post, error } = await supabase
  .from("posts")
  .insert(newPost)
  .select()
  .single();

if (error) {
  throw new Error(`Failed to create post: ${error.message}`);
}
```

**Key Points:**
- Use `PostInsert` type for type safety
- `.select()` returns the inserted data
- `.single()` returns a single object instead of an array

#### 3. **UPDATE**

```typescript
import { supabase } from "../../config/supabase.js";
import { PostUpdate } from "../../utils/supabase-helpers.js";

const updateData: PostUpdate = {
  title: "Updated Title",
  description: "Updated content",
};

const { data: post, error } = await supabase
  .from("posts")
  .update(updateData)
  .eq("id", postId)
  .select()
  .single();
```

#### 4. **DELETE**

```typescript
const { error } = await supabase
  .from("posts")
  .delete()
  .eq("id", postId);

if (error) {
  throw new Error(`Failed to delete post: ${error.message}`);
}
```

### Advanced Queries

#### Joins (Relationships)

```typescript
// Get post with author and comments
const { data: post, error } = await supabase
  .from("posts")
  .select(`
    *,
    author:profiles!posts_author_id_fkey(
      id,
      username,
      first_name,
      last_name,
      avatar_url
    ),
    comments:comments(
      id,
      content,
      author:profiles!comments_author_id_fkey(
        id,
        username
      )
    )
  `)
  .eq("id", postId)
  .single();
```

**Syntax Explanation:**
- `author:profiles!posts_author_id_fkey` - Join profiles table via foreign key
- `comments:comments` - Get related comments
- Nested selects for related data

#### Filtering

```typescript
// Multiple conditions
const { data } = await supabase
  .from("posts")
  .select("*")
  .eq("type", "note")           // equals
  .neq("author_id", userId)     // not equals
  .gt("created_at", date)       // greater than
  .lt("created_at", date)       // less than
  .in("id", [id1, id2])         // in array
  .is("deleted_at", null)       // is null
  .or("type.eq.note,type.eq.story")  // OR condition
  .order("created_at", { ascending: false })
  .limit(20)
  .range(0, 19);                // pagination
```

---

## Authentication & RLS

### Row Level Security (RLS)

Supabase uses **Row Level Security** to control data access at the database level. This means:

- Users can only access data they're allowed to see
- Policies are enforced in the database, not just in application code
- More secure than application-level checks

### Authenticated Client

For operations that require authentication, create an authenticated client:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../config/supabase.js";

// Create authenticated client
const authedSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// Now queries respect RLS policies
const { data: profile } = await authedSupabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();
```

### When to Use Authenticated Client

- **User-specific data** - Profiles, private posts, etc.
- **RLS-protected tables** - Tables with security policies
- **User operations** - Updates, deletes that require ownership

### When to Use Default Client

- **Public data** - Posts, public profiles
- **Admin operations** - Using service role key
- **No RLS** - Tables without security policies

---

## Best Practices

### 1. Always Use Type-Safe Types

✅ **Good:**
```typescript
import { PostInsert } from "../../utils/supabase-helpers.js";

const newPost: PostInsert = {
  author_id: userId,
  type: "note",
  // TypeScript will error if you miss required fields
};
```

❌ **Bad:**
```typescript
const newPost = {
  author_id: userId,
  type: "note",
  // No type checking - easy to miss fields
};
```

### 2. Always Check for Errors

✅ **Good:**
```typescript
const { data, error } = await supabase.from("posts").select("*");

if (error) {
  throw createHttpError({
    message: `Failed to fetch posts: ${error.message}`,
    statusCode: 500,
    code: "DATABASE_ERROR",
  });
}

if (!data) {
  throw createHttpError({
    message: "No posts found",
    statusCode: 404,
    code: "NOT_FOUND",
  });
}
```

❌ **Bad:**
```typescript
const { data } = await supabase.from("posts").select("*");
// No error handling - will crash if error occurs
```

### 3. Use Helpers for Common Types

✅ **Good:**
```typescript
import { PostRow, PostInsert, PostType } from "../../utils/supabase-helpers.js";
```

❌ **Bad:**
```typescript
import { Database } from "../../types/supabase.js";
type PostRow = Database["public"]["Tables"]["posts"]["Row"];
// Verbose and harder to maintain
```

### 4. Handle Nullable Fields

```typescript
// Database field: location: string | null
const post: PostRow = {
  // ...
  location: null,  // Can be null
};

// Always check before using
if (post.location) {
  console.log(post.location);
}
```

### 5. Use Select to Limit Data

✅ **Good:**
```typescript
// Only select what you need
const { data } = await supabase
  .from("posts")
  .select("id, title, created_at");
```

❌ **Bad:**
```typescript
// Selects everything (wasteful)
const { data } = await supabase
  .from("posts")
  .select("*");
```

### 6. Regenerate Types After Schema Changes

1. Make database changes in Supabase dashboard
2. Run type generation command
3. Commit the updated `supabase.ts` file
4. Update `supabase-helpers.ts` if needed

---

## Examples

### Example 1: Creating a Post (Full Flow)

```typescript
// src/entities/posts/posts.service.ts
import { supabase } from "../../config/supabase.js";
import { PostInsert, PostRow, PostType } from "../../utils/supabase-helpers.js";
import { CreatePostBody } from "./posts.dto.js";

export class PostsService {
  async createPost(userId: string, postData: CreatePostBody): Promise<PostRow> {
    // 1. Prepare insert data with type safety
    const postInsert: PostInsert = {
      author_id: userId,
      type: postData.type as PostType,
      title: postData.title.trim(),
      description: postData.description.trim(),
      location: postData.location ?? null,
      paid_opportunity: postData.paid_opportunity ?? null,
    };

    // 2. Insert with error handling
    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert(postInsert)
      .select()
      .single();

    if (postError || !newPost) {
      throw new Error(`Failed to create post: ${postError?.message}`);
    }

    // 3. Return typed result
    return newPost; // Type: PostRow
  }
}
```

### Example 2: Querying with Relationships

```typescript
import { supabase } from "../../config/supabase.js";
import { PostRow } from "../../utils/supabase-helpers.js";

async function getPostWithRelations(postId: string) {
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        first_name,
        last_name,
        avatar_url
      ),
      comments:comments(
        id,
        content,
        created_at,
        author:profiles!comments_author_id_fkey(
          id,
          username
        )
      )
    `)
    .eq("id", postId)
    .single();

  if (error) throw error;
  return post;
}
```

### Example 3: Using Authenticated Client

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../../config/supabase.js";
import { ProfileUpdate } from "../../utils/supabase-helpers.js";

async function updateUserProfile(
  userId: string,
  token: string,
  updateData: ProfileUpdate
) {
  // Create authenticated client
  const authedSupabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  // Update with RLS enforcement
  const { data: profile, error } = await authedSupabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}
```

### Example 4: Adding a New Table Helper

When you add a new table (e.g., `notifications`):

1. **Add to `supabase-helpers.ts`:**
```typescript
// Notifications table types
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];
```

2. **Use in your service:**
```typescript
import { NotificationInsert, NotificationRow } from "../../utils/supabase-helpers.js";

const notification: NotificationInsert = {
  user_id: userId,
  type: "like",
  message: "Someone liked your post",
};

const { data } = await supabase
  .from("notifications")
  .insert(notification)
  .select()
  .single();
```

---

## Troubleshooting

### Common Issues

#### 1. **Type Errors After Schema Changes**

**Problem:** TypeScript errors after database changes

**Solution:**
```bash
# Regenerate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

#### 2. **RLS Policy Errors**

**Problem:** "new row violates row-level security policy"

**Solution:**
- Use authenticated client with user token
- Check RLS policies in Supabase dashboard
- Ensure user has permission to perform operation

#### 3. **Missing Fields in Insert**

**Problem:** TypeScript error about missing required fields

**Solution:**
- Check `Insert` type for required fields
- Ensure all non-nullable, non-default fields are provided
- Use `PostInsert` type for type safety

#### 4. **Null vs Undefined**

**Problem:** Confusion between `null` and `undefined`

**Solution:**
- Database uses `null` for nullable fields
- Use `?? null` to convert `undefined` to `null`
- Check types: `string | null` means can be null

---

## Summary

1. **Types are auto-generated** from your database schema
2. **Use `supabase-helpers.ts`** for clean, reusable type aliases
3. **Always use typed operations** - `PostInsert`, `PostRow`, etc.
4. **Handle errors** - Check `error` from every Supabase call
5. **Use authenticated clients** for RLS-protected operations
6. **Regenerate types** after any schema changes

This ensures type safety, better developer experience, and fewer runtime errors!

