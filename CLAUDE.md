@AGENTS.md

# LEFTOVERS

Charity food-recovery site: public pages, interest intake, sponsorships and a private staff dashboard.
Next.js 16 + Supabase + Cloudflare Turnstile. **Budget is $0: free tiers only, no paid upgrades or add-ons.**

## Run
- Node 24 / npm 11. `npm ci`, `cp .env.example .env.local`, then `npm run dev` (port 3000; `APP_ORIGIN` must match the exact origin).
- Use the existing checkout. No worktrees unless asked.

## Verify
- `npm test` · `npm run typecheck` · `npm run build` · `npm run test:a11y` (needs ports 3150–3152 free)
- `npm run check:launch` exits nonzero until live setup exists. That's expected, not a failure to fix.

## Ship
- Production is Netlify, from `main` (theleftovers.netlify.app). PRs get Deploy Previews. Build config lives in `netlify.toml`.
- Migrations `001` → `003` in order. On an existing database, apply only unapplied ones and never rerun `001`.

## Gotchas
- `DATA_MODE`: `demo` (dev, local file), `preview` (public, nothing saved), `supabase` (real). Production defaults to `preview`.
- `.data/` can hold personal information. Never commit, upload or archive it, and keep real personal data out of fixtures.
- If production looks old after a merge, check a cache-free browser first, then Netlify's "Clear cache and deploy", before changing code.
- `vercel.json` is left over from an undecided host choice. Netlify is the host.
