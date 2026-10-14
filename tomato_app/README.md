# TomoScan Flutter App

## Supabase setup

1. Run `tomoscan-web/supabase/schema.sql` in the Supabase SQL Editor. It creates the `scans` table and user-scoped row-level security policies. Existing legacy tables are not deleted.
2. Copy the project URL and publishable key from the Supabase project settings. Never put a service-role key in the Flutter app.
3. Enable Email auth in Supabase. If email confirmation is enabled, users must confirm their address before signing in.

## Vercel classifier

Deploy `tomoscan-web/backend` as the Vercel project root. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the Vercel project environment. The API verifies the user's Supabase session and returns the two model results; it does not connect to PostgreSQL or write scan records. No `DATABASE_URL` or service-role key is needed.

## Run the Flutter app

Pass the project URL, publishable key, and deployed Vercel base URL at build/run time:

```sh
flutter run \
	--dart-define=SUPABASE_URL=https://your-project.supabase.co \
	--dart-define=SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
	--dart-define=CLASSIFIER_API_URL=https://your-vercel-project.vercel.app
```

Flutter uses Supabase Auth and reads/writes `public.scans` directly. Row-level security restricts each account to its own scan history. The classifier URL is only needed for online classification; offline classification remains available.

The old `users` and `scan_records` tables are left in place. Existing records in `scan_records` are not automatically associated with Supabase Auth users; new app history is written to `scans`.
