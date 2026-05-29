# partner waitlist — backend wiring

The `/developers` page on implexa-website posts the partner waitlist
form to `POST /api/v2/partners/waitlist` on the implexa-backend. The
backend pieces that route depends on live in this folder as deployment
artifacts so the website PR is self-contained:

| file                              | belongs in                                                |
| --------------------------------- | --------------------------------------------------------- |
| `0040_partner_waitlist.sql`       | `implexa-backend/supabase/migrations/`                    |
| `partners-route.js`               | `implexa-backend/src/routes/partners.js`                  |

## Apply order

1. Move `0040_partner_waitlist.sql` into the backend migrations dir and
   apply it (`supabase db push` or whatever the deploy flow is).
2. Move `partners-route.js` to `implexa-backend/src/routes/partners.js`.
3. Mount it in `implexa-backend/server.js`:
   ```js
   const partnersRouter = require('./src/routes/partners');
   app.use('/api/v2/partners', partnersRouter);
   ```
4. Confirm `IMPLEXA_PUBLIC_SEARCH_TOKEN` is set on the backend (it
   already is on production; the route reuses the same token the
   website's `/api/search` and `/scores` use).
5. Deploy the backend.

Until step 4 is live, the `/developers` form will surface a graceful
error message asking the visitor to email `founder@implexa.ai`
directly. No production impact, no fake success state.

## Graceful degradation contract

The website's server action (in `src/app/developers/actions.ts`)
handles three failure modes that matter to the founder:

| upstream status | user-visible result                                  |
| --------------- | ---------------------------------------------------- |
| 404             | "the waitlist endpoint isn't live yet, email us"     |
| 409             | "you're already on the list" (rendered as success)   |
| 5xx / network   | "couldn't reach the waitlist service, email us"      |

That contract is the only thing both sides need to agree on. The route
in `partners-route.js` implements it as written.

## Why these files travel together

The partner-API track is on a separate backend branch
(`feat/partner-api-auth`) that owns the `partner_api_keys` table. The
waitlist is the funnel stage; keys are the activation stage. Keeping
the waitlist migration in this PR keeps the website surface
reviewable end-to-end without forcing a merge of the in-flight
partner-keys branch.

When the partner-keys branch lands, both `partner_waitlist` and
`partner_api_keys` will live in the same backend; the waitlist
funnels into `issued_key` status once a partner gets a key.
