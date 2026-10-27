# Project Hub — Supabase Cloud Sync Setup

This build stores projects in Supabase so the same signed-in account can access them from different devices. The existing GitHub repository import remains available.

## 1. Create a Supabase project

1. Open https://supabase.com/ and create a project.
2. In **Project Settings → API** (or the project's Connect/API keys area), copy the project URL and the publishable/anon client key.
3. In this project folder, copy `.env.example` to `.env.local`.
4. Fill in the values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use the publishable/anon key only. **Never put a service-role key in a Vite frontend.**

## 2. Create the database table and security policies

1. In the Supabase dashboard, open **SQL Editor**.
2. Open `supabase/schema.sql` from this project and copy its complete contents into a new SQL query.
3. Run the query. It creates the `projects` table, enables Row Level Security (RLS), and creates policies so each authenticated user can only access their own records.

## 3. Authentication options

Email/password authentication is implemented by default.

- In Supabase, open **Authentication → Providers** and ensure Email is enabled.
- For development, you can configure email confirmation in **Authentication → URL Configuration / Email provider settings** according to your preference. If confirmation is enabled, new users must confirm their email before signing in.
- For GitHub OAuth login, enable GitHub under Authentication → Providers, create an OAuth app in GitHub, enter its client ID/secret in Supabase, and add your local and deployed app URLs to Supabase's allowed redirect URLs. The GitHub import dialog still fetches public repositories separately.

## 4. Run locally

```bash
npm install
npm run dev
```

Restart `npm run dev` after creating or changing `.env.local`. Vite reads environment variables at startup.

## 5. Deploy

When deploying to Vercel or another Vite host, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project's environment variables and redeploy. In Supabase Authentication URL Configuration, set the production site URL and add the production callback URL to the allowed redirect URLs.

## Existing local projects

After the first successful sign-in for an account, if that account has no cloud projects yet, Project Hub imports the current browser's locally stored project list into that account once. Review the projects after migration. Each account gets its own private list.

## Notes

- Cloud data is the source of truth once signed in. Local storage is retained as a browser cache/migration source, not as the sync mechanism.
- The app loads cloud data on sign-in/page load. Edits and deletes are written to Supabase immediately. Supabase Realtime is not enabled in this starter integration; another already-open device may need a refresh to see a change made elsewhere.
- Public GitHub repository import is still subject to GitHub's unauthenticated API rate limits.
