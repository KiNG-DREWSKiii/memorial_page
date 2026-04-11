## Supabase Setup

This app can run locally with JSON/files, but production should use Supabase.

### 1. Run the SQL

Open the Supabase SQL editor and run:

- [schema.sql](/Users/drewgoldman/memorial-site/supabase/schema.sql)

That creates:

- `site_settings`
- `submissions`
- `photos`
- `stories`
- public bucket `memorial-media`

### 2. Set Railway variables

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=memorial-media`
- `MEMORIAL_KEY=jaylyn-reese-fehr`

Also keep:

- `CEREBRAS_API_KEY`
- `CEREBRAS_BASE_URL`
- `CEREBRAS_MODERATION_MODEL`
- `ADMIN_ACCESS_KEY`
- memorial copy vars (`MEMORIAL_NAME`, `MEMORIAL_DATES`, `MEMORIAL_MESSAGE`)

### 3. How multi-family support works

Every record is scoped by `memorial_key`.

For future sibling/family sites, deploy the same backend code with different:

- `MEMORIAL_KEY`
- `MEMORIAL_NAME`
- `MEMORIAL_DATES`
- `MEMORIAL_MESSAGE`

Examples:

- `jaylyn-reese-fehr`
- `jackson-mobley`
- `charlotte-martin`

Each site can share one Supabase project while keeping content separated.

### 4. Media behavior

- Images are optimized with `sharp`
- Full image resized to max width `2000px`
- Thumbnail generated at `700px`
- Stored as `webp`
- Files are uploaded to `${MEMORIAL_KEY}/images` and `${MEMORIAL_KEY}/thumbs`
