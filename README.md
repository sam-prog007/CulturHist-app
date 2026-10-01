# CulturHist

Daily history facts app (French UI): users pick preferences, validate facts of the day, take quizzes, earn points, streaks and grades. Premium ("CulturHist +") is a Stripe subscription.

Originally generated with Lovable, now maintained as a regular Vite project.

## Stack

- **Frontend:** Vite + React 18 + TypeScript, Tailwind + shadcn/ui, React Router, TanStack Query
- **Backend:** Supabase (Postgres with RLS, Auth, Storage, Edge Functions)
- **Payments:** Stripe (checkout, customer portal, subscription check via edge functions)
- **Ads:** Google AdSense (`index.html`, `src/components/AdSense.tsx`)

## Getting started

```sh
npm ci
cp .env.example .env   # then fill in the Supabase anon key
npm run dev            # http://localhost:8080
```

Scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run preview`.

## Layout

| Path | Content |
| --- | --- |
| `src/pages/` | Routes: landing, auth, onboarding, `/app` dashboard, facts, quiz, profile, admin image regeneration |
| `src/components/` | App components; `ui/` is stock shadcn/ui |
| `src/contexts/AuthContext.tsx` | Session, premium status (via `check-subscription`), admin role |
| `src/lib/dailyFact.ts` | Fact-of-the-day selection |
| `src/lib/pricing.ts` | Stripe price IDs |
| `supabase/migrations/` | Database schema, RLS policies, triggers, reference data (grades, periods, achievements, streak milestones) |
| `supabase/seed.sql` | 10 demo facts |
| `supabase/functions/` | Edge functions (see below) |

## Edge functions

| Function | Purpose | Secrets |
| --- | --- | --- |
| `create-checkout` | Stripe checkout session | `STRIPE_SECRET_KEY` |
| `check-subscription` | Syncs Stripe subscription into `profiles.is_premium` | `STRIPE_SECRET_KEY` |
| `customer-portal` | Stripe billing portal | `STRIPE_SECRET_KEY` |
| `translate-facts` | Admin: EN→FR translation of facts | `LOVABLE_API_KEY` |
| `generate-fact-images` | Admin: AI image per fact | `LOVABLE_API_KEY` |

The two AI functions call the Lovable AI gateway, which only works while the project has Lovable credits. Switch them to a direct provider API if needed.

## Setting up a Supabase project

The whole schema is one migration, `supabase/migrations/20261001000000_baseline.sql`. On a new, empty project, either:

- **Dashboard:** paste `supabase/migrations/20261001000000_baseline.sql` into the SQL editor and run it, then do the same with `supabase/seed.sql`.
- **CLI:**

  ```sh
  supabase link --project-ref <project-ref>
  supabase db push --include-seed
  ```

Then put the project URL and anon key in `.env`, set the edge function secrets, and deploy them with `supabase functions deploy <name>`.

Value conventions shared with the frontend:

- `historical_facts.region`: `europe`, `asia`, `africa`, `americas`, `oceania`, `middle-east` (onboarding keys)
- `historical_facts.difficulty`: `easy`, `medium`, `hard` (same as `profiles.preferred_difficulty`)
- `historical_facts.image_url`: a key from `src/assets/factsImages.ts` (e.g. `pyramids-egypt`) or a full URL

Admins are rows in `public.user_roles` with role `admin`. To make yourself admin after signing up, run in the SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```
