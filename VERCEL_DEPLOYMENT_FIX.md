# Vercel deployment fix

## Root cause
The repository tracked `node_modules` and `dist`. In particular, Git stored
`node_modules/.bin/vite` with mode `100644` (not executable), so the Linux
Vercel builder failed with `vite: Permission denied` (exit code 126).

## What changed
- Added `.gitignore` entries for `node_modules/`, `dist/`, and `.dist/`.
- The clean source archive intentionally excludes dependencies, build output, and Git metadata.
- Application source and package manifests are otherwise unchanged.

## Apply the fix to the existing GitHub repository
1. Copy these project files into your existing repository folder (do not overwrite/delete its `.git` directory).
2. Delete `node_modules` and `dist` from that repository folder if present.
3. From the repository root, run:
   ```bash
   npm ci
   npm run build
   ```
4. Commit the source and the removals of tracked generated files:
   ```bash
   git add -A
   git commit -m "Fix Vercel build permissions"
   git push origin master
   ```
5. Vercel should deploy the new commit. Keep Build Command as `npm run build` and Output Directory as `dist`.

If `npm ci` reports a lockfile mismatch, do not delete the lockfile immediately; share the exact error first.
