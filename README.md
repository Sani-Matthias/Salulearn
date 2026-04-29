# SaluLearn

A modern, gamified learning platform built with React, TypeScript, and Supabase. SaluLearn provides an interactive dashboard for tracking course progress, managing daily missions, and personalizing the learning experience.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| State Management | Zustand |
| Backend / Auth | Supabase |
| Routing | React Router v7 |
| Deployment | Vercel |

## Project Structure

```
src/
├── main.tsx              # App entry point — React + router setup
├── App.tsx               # Root layout: sidebar, top bar, route definitions
├── pages/                # One file per route (Home, Learn, Lesson, Profile, Login)
├── components/           # Reusable UI components
├── contexts/
│   └── AuthContext.tsx   # Authentication state and user profile
├── services/             # Progress logic, sync, local storage
├── data/                 # Static course/mission data
└── lib/                  # Supabase client and utility helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema from `supabase/schema.sql`

### Installation

```bash
git clone https://github.com/your-org/salulearn.git
cd salulearn
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview   # optional local preview
```

### Deploy to Vercel

```bash
npx vercel --prod
```

## Key Configuration Points

| File | Purpose |
|---|---|
| `src/App.tsx` — `dailyMissions` | Edit mission text and completion targets |
| `src/App.tsx` — `defaultProgress` | Set initial coins, hearts, and XP values |
| `src/App.tsx` — `<Routes>` | Add or remove application routes |

## Troubleshooting

**TypeScript error `TS6133` (unused variable)**
Remove the unused variable from the `const` assignment in the indicated file.

**Vercel deployment failure**
Inspect the deployment logs:
```bash
npx vercel inspect <deployment-id> --logs
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes and run `npm run build` to verify there are no errors
3. Open a pull request with a clear description of the change

## License

Private — all rights reserved.
