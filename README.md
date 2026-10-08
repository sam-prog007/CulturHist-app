# CulturHist

Daily history facts app (French UI, English planned): users pick preferences, validate facts of the day, take quizzes, earn points, streaks and grades. Premium ("CulturHist +", Stripe) exists in the code but is switched off for now: the free version is complete (`PREMIUM_ENABLED` in `src/lib/pricing.ts`).

Originally generated with Lovable, now maintained as a regular Vite project.

## Stack

- **Frontend:** Vite + React 18 + TypeScript, Tailwind + shadcn/ui, React Router, TanStack Query
- **Backend:** Supabase (Postgres with RLS, Auth, Storage, Edge Functions)
- **Payments:** Stripe (checkout, customer portal, subscription check via edge functions)
- **Ads:** Google AdSense (`index.html`, `src/components/AdSense.tsx`)

## Getting started

```sh
npm ci
npm run dev   # http://localhost:8080
```

`.env` holds the Supabase project URL and publishable (anon) key, which are safe to expose; edit it to use another project.

Scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run preview`.

## Layout

| Path | Content |
| --- | --- |
| `src/pages/` | Routes: landing, auth, onboarding, `/app` home, facts, learned facts, quiz, `/cartes` (world map and era timeline), profile, `/settings` (username, email, password, difficulty, sign out, account deletion) |
| `src/components/BottomNav.tsx` | Bottom tab bar of the signed-in app (Accueil, Quiz, Cartes, Profil) |
| `src/lib/dailyFacts.ts` | The day's 5 facts and their validation (server functions `get_daily_facts`, `validate_daily_fact`) |
| `src/components/WorldMap.tsx`, `src/lib/countryRegions.ts` | World map (Natural Earth outlines from `world-atlas`, projected with `d3-geo`); countries turn gold as their facts are learned, tap one to add its region to the preferences |
| `src/components/EraTimeline.tsx`, `src/lib/progress.ts` | Era timeline filling with learned facts; tap an era to add it to the preferences |
| `src/lib/quiz.ts` | Quiz questions for a chosen region, era and difficulty; points via `complete_quiz` |
| `src/lib/onThisDay.ts` | "Ce jour-là": our facts dated today, else Wikipedia's selection |
| `src/lib/quoteOfTheDay.ts` | Quote of the day, same for everyone, cycling through `quotes` |
| `src/components/` | App components; `ui/` is stock shadcn/ui |
| `src/contexts/AuthContext.tsx` | Session, premium status (via `check-subscription`), admin role |
| `src/lib/dailyFact.ts` | Fact-of-the-day selection |
| `src/lib/pricing.ts` | Premium switch and Stripe price IDs |
| `src/lib/difficulty.ts` | Difficulty levels (1 to 3 stars) |
| `src/components/FactImage.tsx` | Fact image with its credit, or a placeholder |
| `supabase/migrations/` | Database schema, RLS policies, triggers, reference data (grades, periods, achievements, streak milestones) |
| `supabase/content/` | Content files (facts, quotes of the day), rerunnable upserts |
| `supabase/functions/` | Edge functions (see below) |

## Edge functions

| Function | Purpose | Secrets |
| --- | --- | --- |
| `create-checkout` | Stripe checkout session | `STRIPE_SECRET_KEY` |
| `check-subscription` | Syncs Stripe subscription into `profiles.is_premium` | `STRIPE_SECRET_KEY` |
| `customer-portal` | Stripe billing portal | `STRIPE_SECRET_KEY` |
| `translate-facts` | Admin: EN→FR translation of facts | `LOVABLE_API_KEY` |
| `send-notifications` | Push notifications ("Ce jour-là", daily facts reminder), called every 15 min by cron | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` |

`translate-facts` calls the Lovable AI gateway, which only works while the project has Lovable credits. The Stripe functions are only needed once premium is switched back on.

## Setting up a Supabase project

Run the migrations in `supabase/migrations/` in file-name order, then the content files in `supabase/content/` in file-name order. Either:

- **Dashboard:** paste each file into its own SQL editor tab and run it.
  Content files are upserts keyed on `slug`: running one again updates its rows without duplicates and keeps users' progress.
- **CLI:**

  ```sh
  supabase link --project-ref <project-ref>
  supabase db push --include-seed
  ```

Then put the project URL and anon key in `.env`, set the edge function secrets, and deploy them with `supabase functions deploy <name>`.

Daily facts: each day the server picks 5 facts on one theme (a region and an era from the user's preferences), topping up with facts from the same region, then the same era, when the theme has fewer than 5. The streak only grows when all of the day's facts are validated; quizzes only give points. Days are the user's local date.

Value conventions shared with the frontend:

- `historical_facts.region`: `europe`, `asia`, `africa`, `americas`, `oceania`, `middle-east` (onboarding keys)
- `historical_facts.difficulty`: `easy`, `medium`, `hard` (same as `profiles.preferred_difficulty`)
- `historical_facts.year`: negative for BCE (`-44` = 44 av. J.-C.), no year 0; `month`/`day` only when the exact date is known (they feed "On this day")
- `historical_facts.countries`: present-day ISO 3166-1 alpha-2 codes (`{FR}`, `{ML,EG}`), used by the world map
- Images: real photos, paintings or illustrations only, never AI-generated. `image_url` is the full image URL, `image_credit` the author and license shown under it, `image_source_url` the page stating them (e.g. Wikimedia Commons)
- Languages: base columns hold English and `_fr` columns French (`title` / `title_fr`, `text` / `text_fr`)

Admins are rows in `public.user_roles` with role `admin`. To make yourself admin after signing up, run in the SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```

## Deployment (Vercel)

`vercel.json` sends every app route to `index.html` and keeps the service worker uncached. Import the GitHub repository in Vercel (framework: Vite); the build reads `.env`. Then, in Supabase → Authentication → URL Configuration, set the Site URL to the Vercel address and add it to the Redirect URLs, so confirmation and email-change links point to the live app.

## Push notifications

The app is an installable PWA (`public/manifest.webmanifest`, `public/sw.js`). On iPhone, notifications only work once it is added to the home screen (iOS 16.4+). Users pick which notifications they want, and when, in Réglages.

Setup, once:

1. Generate VAPID keys: `npx web-push generate-vapid-keys`.
2. Put the public key in `.env` as `VITE_VAPID_PUBLIC_KEY`.
3. Set the function secrets and deploy it:

   ```sh
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com CRON_SECRET=<random string>
   npx supabase functions deploy send-notifications
   ```

4. Enable the `pg_cron` and `pg_net` extensions (Database → Extensions), then schedule the function:

   ```sql
   select cron.schedule('send-notifications', '*/15 * * * *', $$
     select net.http_post(
       url := 'https://<project-ref>.supabase.co/functions/v1/send-notifications',
       headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
       body := '{}'::jsonb
     );
   $$);
   ```
