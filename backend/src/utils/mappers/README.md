# Entity Mappers

Centralized mapping utilities for transforming database entities to API response formats.

## Structure

Each entity has its own mapper file following the pattern: `{entity}.mapper.ts`

```
mappers/
├── index.ts          # Centralized exports
├── post.mapper.ts    # Post entity mappings
├── profile.mapper.ts # Profile entity mappings
├── metadata.mapper.ts # Metadata entity mappings
└── README.md         # This file
```

## Usage

Import mappers from the centralized index:

```typescript
import {
  mapPostToResponse,
  mapProfileToAPI,
  mapMetadataToAPI,
} from "../../utils/mappers/index.js";
```

## Adding a New Mapper

1. Create a new file: `{entity}.mapper.ts`
2. Export mapping functions following the naming pattern: `map{Entity}To{Target}`
3. Add export to `index.ts`

### Example: Comment Mapper

```typescript
// comment.mapper.ts
import { CommentRow } from "../supabase-helpers.js";

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export function mapCommentToResponse(
  comment: CommentRow & { author?: any }
): CommentResponse {
  return {
    id: comment.id,
    content: comment.content,
    author: comment.author || {},
    createdAt: comment.created_at ?? new Date().toISOString(),
  };
}
```

Then add to `index.ts`:

```typescript
export * from "./comment.mapper.js";
```

## Mapping Patterns

### Snake_case to camelCase

Database uses `snake_case`, API uses `camelCase`:

- `first_name` → `firstName`
- `created_at` → `createdAt`

### Nested Relations

Supabase returns nested relations that need flattening:

- `{ metadata: { metadata: {...} } }` → `metadata: [...]`

### Conditional Fields

Some fields are only included conditionally:

- Private profile fields (phone, yearOfBirth) only for own profile

## Best Practices

1. **Type Safety**: Always use types from `supabase-helpers.ts`
2. **Null Safety**: Handle nullable fields with `??` operator
3. **Consistency**: Follow existing naming patterns
4. **Documentation**: Add JSDoc comments for complex mappings
5. **Testing**: Test mappers with real Supabase responses
