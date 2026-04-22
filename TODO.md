# SaluLearn To-Do List

## 🚀 Top priority (must implement first)
- [ ] Complete mission progress flow in `src/pages/LearnPage.tsx`
  - When lesson finished, increment `progress.points` and `progress.completion`
  - Add `completedLessons` update
- [ ] Add a new page and route for mission detail (example: `/mission/1`)
  - `src/pages/MissionPage.tsx`
  - route in `src/App.tsx`
- [ ] Add achievement badges logic in `src/services/progressService.ts`
  - 10 OP, 5-day streak, first lesson
- [ ] Add a “Sync now” button to `ProfilePage` calling `saveCloudProgress` or `syncProgress`

## 🎨 UI/UX polish
- [ ] Add dark/light theme toggle in `src/App.tsx`
- [ ] Add `framer-motion` animation in status card components
- [ ] Simplify sidebar by creating `src/components/layout/Sidebar.tsx`
- [ ] Add success confetti to milestone (e.g., 100 XP)

## 🧩 Code quality
- [ ] Add ESLint + Prettier config and setup editor hooks
- [ ] Write tests for:
  - `calculateStreak` (existing service)
  - `progressService` calc functions
  - `AuthContext` signUp/signIn flows (mock Supabase)

## 🗂️ Optional cleanup
- [ ] Remove or archive unused helper modules and old branches
- [ ] Recheck component duplication in `src/App.tsx`
- [ ] Move data constants to `src/data/missions.ts` and import in App

## ✅ Deployment pipeline
- [ ] Confirm `npm run build` passes locally
- [ ] Confirm `npx vercel --prod` succeeds
- [ ] Add GitHub Actions workflow (optional) for CI + build on every PR
