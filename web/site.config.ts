// Site settings that are not secret, in one place, so Cloudflare needs no build variables.
// An environment variable with the same name still wins (e.g. in .env.local for local dev).
// Secrets (RESEND_API_KEY) never go here: this repository is public.

export const config = {
  SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || 'n6d3ezd0',
  SANITY_DATASET: process.env.SANITY_DATASET || 'production',
  SITE_URL: (process.env.SITE_URL || 'https://aikyanix-core.pages.dev').replace(/\/$/, ''),
  // true = preview: every page asks search engines not to list it. Set to false at launch.
  NOINDEX: process.env.NOINDEX ? process.env.NOINDEX === '1' : true,
}
