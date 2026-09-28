# CulturHist

Daily history facts app (French UI): users pick preferences, validate facts of the day, take quizzes, earn points, streaks and grades. Premium ("CulturHist +") is a Stripe subscription.

Originally generated with Lovable, now maintained as a regular Vite project.

## Stack

- **Frontend:** Vite + React 18 + TypeScript, Tailwind + shadcn/ui, React Router, TanStack Query
- **Backend:** Supabase (Postgres with RLS, Auth, Storage, Edge Functions), project `cobswvfohgdcwrlkyspm`
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
| `supabase/migrations/` | Database schema, RLS policies, triggers, seed facts |
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

Deploy with the Supabase CLI:

```sh
supabase link --project-ref cobswvfohgdcwrlkyspm
supabase db push
supabase functions deploy <name>
```

Admins are rows in `public.user_roles` with role `admin`.
