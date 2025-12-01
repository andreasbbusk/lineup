# Postman Testing Guide for LineUp API

This guide will walk you through testing the new endpoints in Postman.

## Prerequisites

You'll need:

- Your Supabase project URL (from `.env` file: `SUPABASE_URL`)
- Your Supabase anon key (from `.env` file: `SUPABASE_ANON_KEY`)
- Backend server running on `http://localhost:3001` (or your configured port)

## Step 1: Sign Up (Create Account)

### Request Setup

- **Method**: `POST`
- **URL**: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/signup`
  - Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project ID
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
  **Note**: Supabase uses `apikey` (not `x-api-key` or `X-API-Key`) as the header name
- **Body** (raw JSON):
  ```json
  {
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "data": {
      "username": "testuser"
    }
  }
  ```

### Expected Response

You'll get back a response with `access_token` and `user` object. **Save the `access_token`** - you'll need it for all authenticated requests!

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "testuser@example.com"
  }
}
```

### Postman Setup

1. Create a new request called "1. Sign Up"
2. Set method to POST
3. Enter the Supabase signup URL
4. Go to Headers tab, add:
   - Key: `apikey`, Value: `YOUR_SUPABASE_ANON_KEY`
   - Key: `Content-Type`, Value: `application/json`
5. Go to Body tab, select "raw" and "JSON", paste the JSON above
6. Click Send
7. Copy the `access_token` from the response

---

## Step 2: Login (Alternative - if you already have an account)

### Request Setup

- **Method**: `POST`
- **URL**: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/token?grant_type=password`
- **Headers**:
  ```
  apikey: YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
  **Note**: Supabase uses `apikey` (not `x-api-key` or `X-API-Key`) as the header name
- **Body** (raw JSON):
  ```json
  {
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }
  ```

### Expected Response

Same as signup - you'll get an `access_token`. Save it!

---

## Step 3: Set Up Environment Variable in Postman

To make testing easier, save your access token as a Postman variable:

1. Click the eye icon (👁️) in the top right of Postman
2. Click "Add" next to Variables
3. Add variable:
   - **Variable**: `access_token`
   - **Initial Value**: (paste your token from Step 1 or 2)
4. Click "Save"

Now you can use `{{access_token}}` in your requests!

---

## Step 4: Test GET /api/posts (List Posts)

### Request Setup

- **Method**: `GET`
- **URL**: `http://localhost:3001/api/posts`
- **Headers**:
  ```
  Authorization: Bearer {{access_token}}
  ```
- **Query Parameters** (optional):
  - `type`: `note` | `request` | `story`
  - `limit`: `20` (default)
  - `cursor`: (for pagination, use `next_cursor` from previous response)
  - `authorId`: (filter by author)
  - `location`: (filter by location)
  - `paidOnly`: `true` | `false`
  - `includeEngagement`: `true` | `false`
  - `includeMedia`: `true` | `false`

### Example URLs

- Get all posts: `http://localhost:3001/api/posts`
- Get only notes: `http://localhost:3001/api/posts?type=note`
- Get requests with pagination: `http://localhost:3001/api/posts?type=request&limit=10`

### Expected Response

```json
{
  "data": [
    {
      "id": "post-id",
      "type": "note",
      "title": "Post title",
      "description": "Post description",
      "author": {
        "id": "user-id",
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User"
      },
      "metadata": [],
      "media": [],
      "tagged_users": []
    }
  ],
  "pagination": {
    "next_cursor": "2024-01-01T00:00:00Z",
    "has_more": true
  }
}
```

---

## Step 5: Test GET /api/posts/:id (Get Single Post)

### Request Setup

- **Method**: `GET`
- **URL**: `http://localhost:3001/api/posts/POST_ID_HERE`
  - Replace `POST_ID_HERE` with an actual post ID from Step 4
- **Headers**:
  ```
  Authorization: Bearer {{access_token}}
  ```
- **Query Parameters** (optional):
  - `includeComments`: `true` | `false` (default: false)
  - `commentsLimit`: `10` (default: 10)

### Example URL

- Get post with comments: `http://localhost:3001/api/posts/abc123?includeComments=true&commentsLimit=5`

### Expected Response

```json
{
  "id": "post-id",
  "type": "note",
  "title": "Post title",
  "description": "Post description",
  "author": {
    "id": "user-id",
    "username": "testuser"
  },
  "metadata": [],
  "media": [],
  "tagged_users": [],
  "comments": [] // Only if includeComments=true
}
```

---

## Step 6: Test POST /api/upload (Upload Media)

### Request Setup

- **Method**: `POST`
- **URL**: `http://localhost:3001/api/upload`
- **Headers**:
  ```
  Authorization: Bearer {{access_token}}
  ```
  **Note**: Don't set `Content-Type` header - Postman will set it automatically for multipart/form-data
- **Body**:
  - Select "form-data" tab
  - Key: `files` (make sure type is "File", not "Text")
  - Value: Click "Select Files" and choose an image or video file
  - You can add up to 4 files by adding more `files` keys

### Postman Setup

1. Create new request "6. Upload Media"
2. Set method to POST
3. Enter URL: `http://localhost:3001/api/upload`
4. Go to Headers tab, add:
   - Key: `Authorization`, Value: `Bearer {{access_token}}`
5. Go to Body tab:
   - Select "form-data"
   - Add key: `files` (dropdown should say "File")
   - Click "Select Files" and choose a test image (JPG, PNG) or video (MP4)
   - To upload multiple files, click "+" and add another `files` key
6. Click Send

### Expected Response

```json
{
  "files": [
    {
      "url": "https://your-supabase-project.supabase.co/storage/v1/object/public/posts/user-id/timestamp-random.jpg",
      "type": "image",
      "size": 123456
    }
  ]
}
```

### Tips

- Max file size: 50MB per file
- Max files: 4 files per request
- Supported: Images (JPG, PNG, GIF, etc.) and Videos (MP4, etc.)
- The URL returned can be used when creating posts

---

## Step 7: Test POST /api/posts (Create Post - Bonus!)

Now that you have uploaded media, you can create a post with it:

### Request Setup

- **Method**: `POST`
- **URL**: `http://localhost:3001/api/posts`
- **Headers**:
  ```
  Authorization: Bearer {{access_token}}
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "note",
    "title": "My Test Post",
    "description": "This is a test post created from Postman to verify everything works!",
    "tags": ["test", "postman"],
    "media": [
      {
        "url": "PASTE_URL_FROM_STEP_6_HERE",
        "type": "image"
      }
    ]
  }
  ```

### For Request Type Post:

```json
{
  "type": "request",
  "title": "Looking for a drummer",
  "description": "Need a drummer for our band, must be available weekends",
  "genres": ["rock", "alternative"],
  "location": "New York, USA",
  "paid_opportunity": true
}
```

---

## Quick Reference: All Endpoints

| Endpoint         | Method | Auth Required | Description             |
| ---------------- | ------ | ------------- | ----------------------- |
| `/api/posts`     | GET    | Yes           | List posts with filters |
| `/api/posts/:id` | GET    | Yes           | Get single post         |
| `/api/upload`    | POST   | Yes           | Upload media files      |
| `/api/posts`     | POST   | Yes           | Create new post         |

---

## Troubleshooting

### "Unauthorized" or 401 Error

- Make sure you're using `Bearer` token format: `Bearer {{access_token}}`
- Check that your token hasn't expired (Supabase tokens expire after 1 hour)
- Re-login to get a fresh token

### "No files provided" Error (Upload)

- Make sure you selected "form-data" in Body tab
- Key must be exactly `files` (plural)
- Type must be "File", not "Text"

### "Post not found" Error

- Make sure you're using a valid post ID
- Try getting the post ID from the list posts endpoint first

### Connection Refused

- Make sure your backend server is running: `npm run dev` in the backend folder
- Check the port matches (default is 3001)

---

## Postman Collection Setup (Optional)

You can create a Postman Collection with all these requests:

1. Click "New" → "Collection"
2. Name it "LineUp API"
3. Add all the requests above as items
4. Set collection variables:
   - `base_url`: `http://localhost:3001`
   - `supabase_url`: `https://YOUR_PROJECT.supabase.co`
   - `supabase_key`: `YOUR_ANON_KEY`
   - `access_token`: (set after login)

Then use `{{base_url}}/api/posts` in your requests!
