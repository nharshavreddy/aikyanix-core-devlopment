import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Studio URL becomes https://<studioHost>.sanity.studio after `npm run deploy`.
  studioHost: process.env.SANITY_STUDIO_HOST,
  // Ties `npm run deploy` to the existing aikyanix.sanity.studio app.
  deployment: {appId: 'bhtk1wqz8wpinxf3v5f9qb5y'},
})
