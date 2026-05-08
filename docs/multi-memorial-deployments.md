# Multi-Memorial Deployment Guide

This app is designed to run as one shared codebase with multiple memorial-specific deployments.

## Recommended architecture

- One GitHub repo
- One Supabase project
- One shared Supabase storage bucket
- One Vercel account/team
- One Vercel project per memorial

Each Vercel project points to the same repo and branch, but uses different environment variables.

## Shared environment variables

Use the same values across all memorial deployments:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=memorial-media`
- `CEREBRAS_API_KEY`
- `CEREBRAS_BASE_URL`
- `CEREBRAS_MODERATION_MODEL`

## Memorial-specific environment variables

These should be unique per deployment:

- `MEMORIAL_KEY`
- `MEMORIAL_NAME`
- `MEMORIAL_DATES`
- `MEMORIAL_MESSAGE`
- `MEMORIAL_PORTRAIT_URL`
- `ADMIN_ACCESS_KEY`
- `MEMORIAL_THEME`

## Theme presets

Available presets:

- `rose`
- `sky`
- `lilac`
- `sage`

You can also override individual theme colors with:

- `THEME_BACKGROUND_IMAGE`
- `THEME_BG`
- `THEME_BG_SOFT`
- `THEME_PANEL`
- `THEME_PANEL_STRONG`
- `THEME_LINE`
- `THEME_TEXT`
- `THEME_MUTED`
- `THEME_WARM`
- `THEME_PRIMARY`
- `THEME_TINT_STRONG`
- `THEME_TINT_SOFT`

## Suggested memorial projects

### Jaylyn

- `MEMORIAL_KEY=jaylyn-reese-fehr`
- `MEMORIAL_NAME=Jaylyn Reese Fehr`
- `MEMORIAL_THEME=rose`

### Jackson

- `MEMORIAL_KEY=jackson-mobley`
- `MEMORIAL_NAME=Jackson Mobley`
- `MEMORIAL_THEME=sky`

### Charlotte

- `MEMORIAL_KEY=charlotte-martin`
- `MEMORIAL_NAME=Charlotte Martin`
- `MEMORIAL_THEME=rose`

## Vercel setup

Create a separate Vercel project for each memorial:

1. Import the same GitHub repo.
2. Keep the root directory at the repo root.
3. Point production at `main`.
4. Add the shared variables.
5. Add the memorial-specific variables.
6. Attach the memorial's domain.

## Data isolation

All content is scoped by `MEMORIAL_KEY`.

That means:

- Jaylyn content only shows on the Jaylyn deployment
- Jackson content only shows on the Jackson deployment
- Charlotte content only shows on the Charlotte deployment

## Storage paths

Uploads are already namespaced by memorial key:

- `${MEMORIAL_KEY}/images/...`
- `${MEMORIAL_KEY}/thumbs/...`
- `${MEMORIAL_KEY}/videos/...`

## Admin recommendation

Use a different `ADMIN_ACCESS_KEY` for each memorial deployment.

That keeps family/admin access separate even though the codebase and backend are shared.
