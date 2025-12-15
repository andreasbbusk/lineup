# Supabase Seeds

This directory contains seed data files for populating the Supabase database with initial data.

## Purpose

These SQL files are stored in the repository for:
- **Version control**: Track what seed data exists and any changes over time
- **Team reference**: Dan, Magnus, and other team members can see what data is seeded
- **Documentation**: Clear record of initial database state

## How to Use

### Running Seeds

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the seed file you want to run (e.g., `seeds/metadata-seed.sql`)
4. Copy the entire contents of the file
5. Paste into the Supabase SQL Editor
6. Click **Run** to execute

**Note:** If data already exists in your database, running the seed file will not create duplicates (thanks to `ON CONFLICT DO NOTHING`). The seed files are primarily for documentation and reference.

### Files

- `seeds/metadata-seed.sql` - Initial tags, genres, and artists for the metadata table

## Task Requirements Checklist

Based on the ClickUp task, ensure your metadata table contains:

### Required Tags (15)
- ✅ question
- ✅ tutorial  
- ✅ music-theory
- ✅ recording
- ✅ equipment
- ✅ concert
- ✅ collaboration
- ✅ mixing
- ✅ mastering
- ✅ production
- ✅ songwriter
- ✅ vocalist
- ✅ guitarist
- ✅ drummer
- ✅ bassist

### Required Genres (17)
- ✅ Indie
- ✅ Pop
- ✅ Rock
- ✅ Hip-Hop
- ✅ Electronic
- ✅ Jazz
- ✅ Folk
- ✅ R&B
- ✅ Metal
- ✅ Classical
- ✅ Alternative
- ✅ Punk
- ✅ Blues
- ✅ Country
- ✅ Soul
- ✅ Funk
- ✅ Reggae

**Note:** Your table may have additional entries (like saxophone, keys, singing, strings, postman) that aren't in the task requirements. Those are fine to keep, but the above are the minimum required.

## Notes

- All seed files use `ON CONFLICT DO NOTHING` to make them idempotent (safe to run multiple times)
- If you need to update seed data, modify the SQL file in this directory and run it again in the SQL Editor
- The unique constraint on `(type, name)` prevents duplicate entries

## Verification

### Database Verification

After running a seed file, you can verify the data was inserted by running this in the SQL Editor:

```sql
-- Check metadata counts by type
SELECT type, COUNT(*) as count
FROM metadata
GROUP BY type
ORDER BY type;

-- View all metadata
SELECT * FROM metadata ORDER BY type, name;
```

### API Endpoint Verification

Test that the `GET /api/metadata` endpoint returns the data correctly:

```bash
# Test the endpoint (adjust URL/port as needed)
curl http://localhost:3000/api/metadata
```

The response should include populated arrays for `tags`, `genres`, and `artists`:

```json
{
  "tags": [...],
  "genres": [...],
  "artists": [...]
}
```

