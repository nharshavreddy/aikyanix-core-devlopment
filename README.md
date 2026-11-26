# Aikyanix CORE website

| Folder    | What it is                                                                 |
|-----------|----------------------------------------------------------------------------|
| `studio/` | Sanity Studio: where the team edits content and adds pages                  |
| `web/`    | Next.js site, exported as static HTML, hosted on Cloudflare Pages           |
| `mock/`   | The original one-file mock, kept as a visual reference                      |

How it works: an editor publishes in Studio. A Sanity webhook calls the Cloudflare deploy hook. Cloudflare runs `npm run build` and the change is live in about 1–2 minutes. Drafts never reach the site.

Everything below runs on free plans. Use Node 22 or newer.

## 1. Sanity (one time)

```bash
cd studio
cp .env.example .env          # put your project ID in it (sanity.io/manage)
npm install
npx sanity login
npm run seed:build && npm run seed:import   # loads the mock content
npm run dev                   # Studio at http://localhost:3333
npm run deploy                # Studio at https://<SANITY_STUDIO_HOST>.sanity.studio
```

If `npm run dev` shows a CORS error, add `http://localhost:3333` under sanity.io/manage → API → CORS origins.

Invite editors in sanity.io/manage → Members.

## 2. Cloudflare Pages (one time)

1. Push this folder to a GitHub repo.
2. In Cloudflare, go to Workers & Pages → Create → Pages → Connect to Git and pick the repo.
   - Root directory: `web`
   - Build command: `npm run build`
   - Output directory: `out`
3. Under Settings → Variables, add:
   - `SITE_URL`: `https://your-domain`
   - `SANITY_PROJECT_ID` and `SANITY_DATASET`
   - `SANITY_READ_TOKEN`: only if the dataset is private (a Viewer token)
   - `RESEND_API_KEY` (mark it Secret), `CONTACT_TO`, `CONTACT_FROM`: for the contact form. Get a free key at resend.com and verify your domain there.
4. Under Settings → Builds → Deploy hooks, create a hook and copy its URL.

## 3. Publish = rebuild (one time)

In sanity.io/manage → API → Webhooks, create a webhook:
- URL: the Cloudflare deploy hook
- Dataset: `production`
- Trigger on: Create, Update, Delete
- Filter: `_type in ["page", "post", "caseStudy", "job", "siteSettings"]`
- HTTP method: POST
- Drafts: off

To check that it works, publish a change, wait about 2 minutes and view the page source. The `data-built` value in the footer shows the time of the latest build.

## Site content (from the content doc)

The page copy comes from *Aikyanix_Core_Website_Content.docx* (v1.0, Nov 2026) and lives in `studio/seed/v2.mjs`.
- `cd studio && npm run content:apply` writes it to the live dataset in one go. It replaces the v2 pages and settings, and unpublishes (keeps as drafts) every other page, insight and product. It stops if someone has unsaved drafts of those pages.
- `npm run seed:build` refreshes `seed/content.ndjson`, which the offline preview uses.
- `npm run seed:import` uses `--replace`. Only use it on an **empty** dataset.

After the first apply, edit the content in Studio. Re-running `content:apply` would overwrite those edits.

## Editing guide

**Shop.** Products go in Studio → *Shop: products*, and categories in *Shop: categories*. Each product page lives at `/products/<address>`.
- To show products on any page, add the block **Products (automatic)**. Pick a category to show only that category.
- Visitors **request** a product; there's no online payment. The request (product, options, quantity, contact details) is emailed to `CONTACT_TO` through `/api/contact`. You then reply with availability, delivery and a payment link.
- Reviews are added by your team in the product's *Reviews* tab.
- The wishlist is saved in each visitor's own browser.
- To check the contact/request function: `cd web && node scripts/contact-check.ts`.

- **Add a page:** Page → Create. Set a title and slug. To put it under another page, pick a **Parent**. Example: parent "Publications" with slug `paper-1` gives `/publications/paper-1`. Add sections, then press Publish.
- **List a page's children automatically:** on the parent page, add a "Child page list" section. New child pages appear in it without any extra work.
- **Menu and footer:** edit them in Site settings. A menu item that links to a page automatically gets a dropdown of that page's published child pages.
- **Floating "Book a call" button:** Site settings → Floating button. Leave it empty to hide the button.
- **Design sections** you can add to any page: Technology cards, Process steps, Icon grid (tiles or columns), plus Trust points under the hero buttons.
- **Moved or renamed a page?** Add the old path and the new path under Site settings → Redirects, so old links and Google keep working.
- **Hide a page:** keep it as a draft, or unpublish it. If it must stay public but out of Google, use SEO → "Hide from search engines".

## Local preview without Sanity

```bash
cd web && npm install && npm run build:offline && npm run preview
```

This builds the site from `studio/seed/content.ndjson`.
