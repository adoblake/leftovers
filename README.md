# LEFTOVERS — Finding Value Everywhere

LEFTOVERS is a work-first social enterprise aimed at ending homelessness, starting in Phoenix. Surplus food from local businesses becomes paid same-day Day Crew work, fair-price groceries at the Leftovers Market, and rooms members pay rent on. Phase 2 adds Ambrose Hall for recovery, basic health care and job training with licensed partners; Phase 3 takes the model to other cities. Nothing is operating yet. The public site uses a bold gold-and-green style with Archivo (self-hosted through `next/font`). The palette is forest green `#1F5E4B`, deep green `#12392D`, warm gold `#E8A83A`, and cream `#F7F4EE`. The header and favicon reuse the owner's leaf-L vector. See [branding provenance](docs/branding.md).

The current software budget is **$0**. The prepared launch path uses Netlify Free, Supabase Free, and Cloudflare Turnstile Free within their limits, with a provider subdomain and no payment processing or paid upgrades. Read the [zero-cost launch guide](docs/zero-cost-launch.md) for account setup, plan-verification limits, credentials, and deployment steps. The owner-provided site address is [theleftovers.netlify.app](https://theleftovers.netlify.app/). Its deployed revision and live database configuration could not be verified from this workspace.

[Deploy a separate copy on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/adoblake/leftovers). Sign in with the account that owns the repository, select the Free plan, and keep the included build settings. The first deployment is a clearly labeled public demo. Netlify supplies the actual HTTPS website address after a successful deployment. This launch link is not the website URL; real intake and private staff access require the database and spam-check setup below.

The live site builds from this repository's `main` branch. Pull requests get a Netlify Deploy Preview link in their checks, so changes can be reviewed before merging. Build settings live in `netlify.toml` (`npm run build`, publish `.next`), which overrides the build fields in the Netlify UI.

## Local setup

Use the existing isolated checkout; no Git worktree is needed. Requires Node 24 and npm 11.

```sh
cd /workspace/leftovers
npm ci
cp .env.example .env.local
npm run dev
```

The server uses port 3000. Keep `APP_ORIGIN` equal to the exact browser origin when using another port. Do not overwrite an existing local environment file when refreshing setup.

Public pages: `/`, `/mission`, `/how-it-works`, `/partners`, `/get-involved`, `/crew`, `/register`, `/survey`, `/pickup`, `/sponsors`, `/contact`, `/privacy`, and `/accessibility`. The homepage has FAQs and a proposed-phase roadmap. `/crew` collects Day Crew interest through the contact form (topic `crew`); `/contact?topic=employer` collects work-contract interest. Both are stored as contact interests with a topic label, so no migration is needed. The keyboard-accessible mobile menu closes with Escape, navigation, or focus leaving the menu. `/register` is the QR-friendly registration path; its copy-link control uses the real hosting origin. Encode that deployed URL in QR materials after a live host is available.

`/demo` uses clearly labeled fictional organizations and data. `/dashboard` is the private staff workspace. There is no default password or authentication bypass.

## Three operating modes

| `DATA_MODE` | Behavior |
| --- | --- |
| `demo` | Development only. Validated responses are saved privately in ignored `.data/interest.jsonl`; no team is notified. Use fictional details. Explicit demo storage is rejected in production. |
| `preview` | Public demonstration. Responses are validated but not saved or sent. Staff sign-in is disabled. The banner and forms make this explicit. |
| `supabase` | Real interest collection and staff records after database, authentication, origin, and spam-check configuration. Requests are still pending approval, not pickup bookings. |

With no mode set, development defaults to local demo and production defaults to preview. A validated preview trial is not a real registration. Files in `.data` can contain personal information and must never be committed, uploaded, or included in public archives.

## Database and private access

Apply `supabase/migrations/001_initial.sql`, `002_optional_contact_zip.sql`, and `003_sponsorship.sql` in order to a new Supabase project. For an existing database, apply only unapplied migrations; do not rerun migration 001.

Use `.env.example` as the names-only template. Live intake requires:

- `DATA_MODE=supabase` and the exact HTTPS `APP_ORIGIN`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Public `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and server-only `TURNSTILE_SECRET_KEY`.

Enter private values in secure environment settings, never in chat, source, or logs. The only public-prefixed key here is Turnstile's intentionally public widget key. Configure hosting values before building. The app also recognizes exact trusted Netlify deployment URLs; an incoming Host or forwarded-host header never authorizes a write.

Provision staff users in Supabase Authentication, disable public signup, then assign profiles through trusted SQL/admin tooling:

```sql
insert into public.profiles(id,role)
values ('ACTUAL-AUTH-USER-UUID','admin');
```

`admin` reviews private interests, manages planning records and costs, and controls public sponsor acknowledgments. `coordinator` reviews private interests and manages recipient/pickup planning but cannot publish sponsors or write costs. `analyst` reads non-contact operational data. Users cannot assign their own roles. Row-level security protects every base table; anonymous users cannot access contact records. Public submissions use the service key only on the validated server route. Staff queries and mutations use the user's JWT and RLS, not the service key.

Sessions use HTTP-only SameSite Strict cookies, secure in production, for at most one hour. Authentication is verified with Supabase on dashboard requests. A warning appears within two minutes of expiry, and staff can renew through a keyboard-accessible sign-in dialog without clearing unsaved fields. Renewal still requires valid credentials and an authorized role; there is no fixed extension count. Sign-out clears the browser session. Staff provisioning can be handled administratively without adding an email/SMS subscription. Account-role checks still need verification against the hosted project.

## Intake and sponsorship

Donor registrations, surveys, pickup interest, contact messages, and sponsor inquiries are stored in private `interests`. Food-related forms require an organization and Phoenix-area ZIP. Contact inquiries can omit organization and location; sponsor inquiries require an organization but can omit location. Contact and sponsor messages require meaningful text. Empty contact organizations are labeled “Individual inquiry”; no location is invented.

`/sponsors` presents opportunities for funding, transport, storage/food safety, professional skills, and connections. It collects **no payments**, promises no tax benefits or advertising results, and creates no sponsorship contract. Optional recognition permission is separate from permission to contact the submitter.

The administrator workflow requires a reviewed sponsor inquiry, explicit recognition permission, and confirmation that an actual agreement exists. Only then can an organization-only acknowledgment be published through `sponsors` and its safe `sponsor_directory` view. Personal names, emails, phone numbers, and inquiry notes are not copied to the public directory. Staff must keep personal data out of acknowledgment text. Consent changes are restricted; withdrawal or decline automatically unpublishes the acknowledgment. Administrators can also remove it directly. Without confirmed sponsors, the site displays clearly labeled open spaces, never invented partners or logos.

`recipient_partners` stores organization-level records; `partner_contacts` separately protects personal recipient contacts. Pickup planning cannot be created from a sponsorship or general inquiry. Scheduling and completion remain disabled in the UI before operational launch.

## Impact reporting

Recovery totals count completed pickups with actual weights, separately from estimated surplus. Operating costs are recorded in USD. No meal-equivalent or emissions claims are made without a methodology. Demo expenses and organizations are fictional. Zero verified recovery means none recorded, not an impact claim. The private dashboard currently shows the most recent 200 interests; larger pilots need pagination/export. Recipient contact administration, privacy corrections/deletions, and historical operational imports use trusted database administration in this MVP.

## Tests and launch checks

```sh
npm test
npm run typecheck
npm run build
npm run test:a11y
npm run check:launch
```

The tests cover form validation/storage, sponsor consent and publication, server-side challenge verification, wrong-origin rejection, failed writes, role checks, and safe production preview behavior. PostgreSQL policy tests run all three migrations against PGlite and exercise real SQL/RLS behavior for anonymous, administrator, coordinator, and analyst roles. They do not prove a hosted Supabase project is configured correctly.

`test:a11y` builds a production preview and runs free axe/Playwright checks against local public pages and staff screens. Staff records and authentication use an isolated, fictional fixture service; the suite does not access a real database. Install Chromium with `npx playwright install chromium` if a system browser is unavailable, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed compatible Chromium browser. The cloud setup already has `/usr/bin/chromium`. Ports 3150–3152 must be free. Results, failure traces, and screenshots are written to ignored `test-results/`; keep real personal information out of test fixtures and artifacts.

The accessibility target is **WCAG 2.2 AA**. See the [accessibility review](docs/accessibility-review.md) for scope, evidence, fixes, and the remaining live-site, screen-reader, and device checks. Automated results alone are not a WCAG conformance certification. The public accessibility statement is at `/accessibility`.

`check:launch` loads `.env.local` when present, prints missing setting names only, and makes read-only schema, anonymous-isolation, and administrator-provisioning checks. It intentionally exits nonzero until live setup exists. Run the deployed HTTPS forms, real Turnstile challenge, account-role checks, sign-out, and expired sessions before inviting real personal information. A production preview build can be served with `npm start`; it does not collect actual interest.

Live production forms require Turnstile verification of the token, hostname, and `interest` action before a database write. Missing/expired/rejected checks fail closed and can be retried without losing input. Honeypot, form-duration, body-size, origin, and per-process rate checks provide additional defenses. In-memory rate limits depend on a trusted ingress normalizing forwarded addresses and reset on restart; add shared limiting if needed within the selected host's free capabilities. No personal request bodies or credentials are intentionally logged.

## Deployment and handoff

`netlify.toml` configures Node 24 and the normal Next.js build; the native Netlify runtime installs automatically. Confirm the actual account's Free plan, sponsorship/commercial eligibility, quotas, and $0 spending limits before creating a site. The current pricing page is blocked from this workspace, so no current Netlify quota is claimed here. Do not enable paid upgrades, extra credits, or paid add-ons. Use the Netlify launch link above, import the repository, or deploy the source through an authenticated Netlify account; a static drag-and-drop of `.next` does not run the server routes.

```sh
npm run package:deployment
```

This makes a source-only archive in the system temporary directory from an explicit allowlist and rejects symlinks. It excludes credentials, local submissions, Git metadata, installed packages, and generated build outputs. Only the empty `.env.example` template is included. Source configuration files do not create hosting resources or publish the website. Processes must restart after an environment restoration.

See [Zero-cost launch](docs/zero-cost-launch.md) for the complete account-owner steps, spending safeguards, private backup/export routine, and readiness checks. Free plans can pause or suspend within their documented limits; there is no uptime or unlimited-capacity promise.

## Pilot boundaries

Food pickups are **not operational**. Every request is an expression of interest pending approval. No free pickup service, tax benefit, or availability guarantee is promised. Before operations, complete Phoenix/Maricopa County/Arizona food safety and regulatory review, permitted sources, temperature control, allergens and labeling, traceability, transport training, insurance, partner agreements, and incident response. Physical operating costs are separate from the $0 software target and may need sponsorship.

Phase 1 is a proposed Phoenix food recovery pilot. Phase 2 proposes a community market. Phase 3 proposes Ambrose Hall workforce and community services. Resource recovery beyond food is a longer-term vision. Later phases have not launched.
