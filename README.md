# SaluLearn (Easy Guide)

## 🔧 What this project is

SaluLearn is a React + TypeScript + Vite app with Supabase auth and progress tracking. This is the main UI for your learning dashboard.

## 🗂️ Where to find things

- `src/main.tsx` - App bootstrap, sets up React + router + global CSS.
- `src/App.tsx` - Main screen layout, sidebar/top bar/right rail and routes.
- `src/pages/` - Pages for each route (home, learn, profile, lesson, login).
- `src/components/` - Shared reusable UI pieces.
- `src/contexts/AuthContext.tsx` - Login/session state + user profile.
- `src/services/` - progress logic, sync, local storage.

## ✨ How to change the app (non-developer steps)

1. Open `src/App.tsx`.
2. Find the first big comment section with headings:
   - `// TODO: ...` markers show where to update content.
3. To add a new page: create file in `src/pages/MyPage.tsx`, then add route in `App.tsx` inside `<Routes>`.

## 🧹 Rebuild & redeploy

- `npm install`
- `npm run build`
- `npm run dev`
- `npx vercel --prod`

## 🗑️ Clean unnecessary files (safe cleanup)

- `rm -rf node_modules dist .turbo .cache` (optional)
- `git clean -fd` (if you know these are unwanted)

## 🧠 FAQ

- If build fails with TypeScript `TS6133` (unused variable), open the file and remove the unused variable from the `const` assignment.
- If deployment fails on Vercel, run `npx vercel inspect <deployment-id> --logs` and share the error.

---

## 🛠️ Specific areas to edit in `src/App.tsx`

- `const dailyMissions` for mission text & targets.
- `const defaultProgress` for starting points/coins/hearts.
- `Routes` block for pages and navigation.
- `Sidebar` links for menu items.
