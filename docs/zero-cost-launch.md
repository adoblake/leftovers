# LEFTOVERS: a $0 software launch target

Prepare a small Phoenix pilot site using Free plans and provider subdomains. Do not enable paid upgrades, automatic top-ups, a paid database organization, purchased domains, premium add-ons, or payment processing. Free services have limits and can pause or suspend; this is not an unlimited or guaranteed-uptime promise. Stay within each provider's current allowances.

## Services and limits

| Need | Intended service | Cost target | Relevant boundaries |
| --- | --- | --- | --- |
| Public Next.js website and server routes | Netlify Free, `netlify.app` address | $0 | Confirm the Free plan's current credits, commercial/sponsorship terms, and hard spending limits in the owning account before creating the site. The pricing page is blocked from this workspace, so its current quota is not independently verified here. Do not choose a paid plan or enable extra credits. |
| PostgreSQL, private records, staff sign-in | Supabase Free | $0 | Official docs list two free projects, 500 MB database per project, 5 GB egress, and 50,000 monthly active users. Free projects may pause; review the account's current quotas and pause policy. No public user signup or email service is required by this MVP. |
| Bot protection | Cloudflare Turnstile Free | $0 | Official docs list unlimited challenges, up to 20 widgets, and 10 hostnames per widget. It can be used without other Cloudflare services. Server verification is required. |
| Address and HTTPS | Provider subdomains and certificates | $0 | Use Netlify and Supabase addresses. A custom domain is optional and excluded from this budget. |
| Sponsor conversations | Private inquiry form and staff dashboard | $0 additional software | No payment processor, donation checkout, paid CRM, or email automation. Staff review inquiries in the dashboard. |
| Public acknowledgment | Text-based approved sponsor directory | $0 additional software | Permission, staff review, and a confirmed agreement are required. No uploaded logos or large files. |
| Backup | Private manual exports to storage the operator already controls | $0 additional subscription | Establish an export and restore routine. Keep personal information and database exports out of Git and public hosting. Free database hosting is not a backup guarantee. |

Official references, checked from available source documentation on November 5, 2026:

- [Netlify Next.js runtime](https://github.com/netlify/next-runtime): native support for Next.js 13.5+ and automatic runtime installation.
- [Netlify pricing](https://www.netlify.com/pricing/): account owner must verify current Free-plan conditions; access from this environment is blocked.
- [Supabase billing and Free quotas](https://supabase.com/docs/guides/platform/billing-on-supabase), verified against the official [documentation source](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/billing-on-supabase.mdx).
- [Turnstile Free plan](https://developers.cloudflare.com/turnstile/plans/), verified against the official [documentation source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/turnstile/plans.mdx).

## One-time account setup

A person must own the hosting/database accounts and accept their terms. No accounts, billing plans, or real credentials have been created by this project.

The browser-based Netlify launch flow does not require a deployment token in this cloud workspace. If delegating CLI deployment to this environment, connect `NETLIFY_AUTH_TOKEN` securely and allow the Netlify API in the environment network settings. The earlier `VERCEL_TOKEN` requirement is not used by this launch path; remove that unused field from the environment draft instead of supplying a Vercel credential.

1. Create or use a **Free** account at [Netlify](https://app.netlify.com/signup). Confirm its current plan permits this sponsorship-supported use and enforces a $0 spend. Keep paid upgrades and extra credits off. If the current Free terms do not fit, stop before deployment and select another genuinely free host; do not silently upgrade.
2. Create a **Free** Supabase organization/project at [Supabase](https://supabase.com/dashboard). Apply migrations 001, 002, and 003 in order. For an existing database, apply only migrations not already applied.
3. In Supabase Authentication, disable public signups. Provision staff accounts and assign `admin`, `coordinator`, or `analyst` profiles using trusted SQL/admin tools. Confirm account emails administratively for these staff accounts; this MVP does not require transactional email or SMS.
4. Create a Free widget in [Cloudflare Turnstile](https://dash.cloudflare.com/). Register the real production Netlify hostname. Use the public site key and server-only secret in hosting environment settings. Don't use test keys in production.
5. Configure the following in the Netlify site's environment settings **before building**:

```text
DATA_MODE=supabase
APP_ORIGIN=https://YOUR-SITE.netlify.app
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=[enter securely]
SUPABASE_SERVICE_ROLE_KEY=[server-only; enter securely]
NEXT_PUBLIC_TURNSTILE_SITE_KEY=[public widget site key]
TURNSTILE_SECRET_KEY=[server-only; enter securely]
```

Never paste private keys into chat, the source tree, build logs, or public variables. The only `NEXT_PUBLIC_` key here is Turnstile's intentionally public site key. Do not copy a localhost `APP_ORIGIN` into the deployed app.

## Deploy and verify

The shortest route to a shareable link is [Launch LEFTOVERS on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/adoblake/leftovers):

1. Sign in with the GitHub account that owns `adoblake/leftovers`, and authorize Netlify's repository access if requested. If the template flow cannot access a private repository, use **Add new project → Import an existing project → GitHub**, then select `adoblake/leftovers`.
2. Select the verified **Free** account/team. Keep the repository's `npm run build` command and `.next` publish directory; the native Next.js runtime handles the server routes.
3. Leave private environment values unset for the first clearly labeled demo deployment. It validates fictional trials without storing responses and needs no database account.
4. After the build succeeds, open the actual `https://…netlify.app` URL shown in the project dashboard. The launch button itself is an account setup link, not a live website address.
5. To open real interest collection, complete the database, staff, Turnstile, and secure environment configuration above, redeploy, and run the hosted checks below. Actual pickups remain pending operational approval.

Alternatively, from the extracted source directory (or this checkout), the account owner can authenticate and create/link the site using:

```sh
npm ci
npx --yes netlify-cli@27.16.2 login
npx --yes netlify-cli@27.16.2 deploy --build --prod
```

Choose the verified Free account/team in the CLI prompts. With no `DATA_MODE` configured, the first deployment is a non-persistent public demo and needs no database credentials. Use the resulting real `netlify.app` hostname when registering the Turnstile widget. After database setup, staff provisioning, and all secure environment values are complete, switch to `DATA_MODE=supabase` and redeploy to open actual intake. Do not label the initial demo as a functioning registration service.

`netlify.toml` selects Node 24 and the normal Next.js build. A local offline build has been verified with Netlify CLI 27.16.2, Netlify Build 37.7.5, and Next.js Runtime 5.16.6, including server-function packaging. Offline mode could not refresh the plugin catalog; these are the versions tested, not a claim about the latest hosted runtime. Netlify installs its native Next.js runtime automatically. Use the source archive if handing the project to another developer. A plain static-file drag-and-drop of `.next` does not deploy this app's server routes.

Run locally before deployment:

```sh
npm ci
npm test
npm run build
npm run check:launch
```

`check:launch` loads `.env.local` when present, checks live configuration without printing values, then makes read-only schema/permission checks and confirms at least one administrator is provisioned. It exits nonzero while any required setup is missing. Its success does not verify a hosting plan, complete a Turnstile challenge, approve food operations, or substitute for the deployed browser checks below.

On the deployed HTTPS site, submit one clearly labeled test donor response and one sponsor inquiry. Confirm both appear only for staff. Test the bot challenge, wrong-origin rejection, failed storage messages, expired sessions, and unauthorized accounts. In the sponsor workflow:

1. An inquiry starts private and pending review, without a payment or commitment.
2. Without optional recognition permission, it cannot be published.
3. Review it and mark it “Approved for planning.”
4. Only an administrator can confirm the actual agreement and publish the organization's acknowledgment.
5. Only organization name, website, approved text, and support area become public. Names, emails, phone numbers, and private notes stay private.
6. Declining a published source or withdrawing its consent automatically removes the acknowledgment. An administrator can also unpublish it directly.

Local database tests execute all migrations against a real PostgreSQL engine embedded through PGlite. They test role separation, publication consent, public-field projection, cost permissions, and pickup-source restrictions. They do not prove the live Supabase project is configured correctly.

Use `DATA_MODE=preview` to share a demonstration before the accounts are connected. It validates fictional trials without saving them, and does not accept real sponsor or donor interest. Do not describe this mode as a working intake service.

## Keep it at $0

Check Netlify and Supabase usage before inviting a large audience. Limit production builds to reviewed releases, disable unnecessary branch/preview builds, avoid file uploads and paid analytics, and use staff dashboard review rather than an email pipeline. Public sponsor content is cached for five minutes and invalidated when staff publish or remove it. If a free quota is reached or a project pauses, restore service within the Free plan or accept the interruption; do not automatically buy capacity.

The $0 target covers this software setup. Physical pickup costs, transport, safe containers, insurance, training, permits, and regulatory review are separate. Sponsorship discussions can help explore those needs, but no operating funding or free pickup service is assumed. Food pickups remain non-operational until the required launch review is complete.
