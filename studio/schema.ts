import {BillIcon} from '@sanity/icons/Bill'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {ComposeIcon} from '@sanity/icons/Compose'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {InlineElementIcon} from '@sanity/icons/InlineElement'
import {StackIcon} from '@sanity/icons/Stack'
import {StarIcon} from '@sanity/icons/Star'
import {TagIcon} from '@sanity/icons/Tag'
import {TextIcon} from '@sanity/icons/Text'
import {ThListIcon} from '@sanity/icons/ThList'
import {UsersIcon} from '@sanity/icons/Users'
import {defineArrayMember, defineField, defineType, type SlugValidationContext} from 'sanity'
import {product, productCategory, productGrid} from './shop'

// Plain-language labels on purpose: editors are not developers.
// Internal names (type/field `name`) stay the same so existing content keeps working.

const API = {apiVersion: '2025-01-01'}
const baseId = (id = '') => id.replace(/^drafts\./, '')

// ---------- shared ----------

const link = defineType({
  name: 'link',
  title: 'Link / button',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Text on the button or link', type: 'string'}),
    defineField({
      name: 'page',
      title: 'Go to a page on this website',
      type: 'reference',
      to: [{type: 'page'}, {type: 'post'}],
    }),
    defineField({
      name: 'url',
      title: '…or type a web address',
      type: 'url',
      description: 'Only if it is not a page on this site. Example: https://example.com or mailto:hr@aikyanix.com',
      validation: (r) => r.uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}),
    }),
  ],
  preview: {
    select: {title: 'label', page: 'page.title', url: 'url'},
    prepare: ({title, page, url}) => ({title: title || 'Link', subtitle: page ? `→ ${page}` : url}),
  },
})

const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      marks: {annotations: [{name: 'link', type: 'link', title: 'Link'}]},
    }),
    defineArrayMember({
      type: 'image',
      title: 'Picture',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string', title: 'Describe the picture (for blind visitors and Google)', validation: (r) => r.required()})],
    }),
  ],
})

// Must match the icon names in web/components/Icon.tsx
const ICONS = ['check', 'clock', 'database', 'chart', 'target', 'calendar', 'trend', 'cloud', 'layers', 'shield', 'users', 'lock', 'spark', 'flow', 'doc']

const label = defineField({name: 'kicker', title: 'Small label above the heading', type: 'string', description: 'Optional. e.g. "How we work"'})
const heading = defineField({name: 'heading', title: 'Heading', type: 'string'})
const dark = defineField({name: 'dark', title: 'Dark background', type: 'boolean', initialValue: false, description: 'Puts this block on a dark band to break up the page.'})

// Preview shown in the list of blocks on a page.
const blockPreview = (kind: string, field = 'heading') => ({
  select: {title: field},
  prepare: ({title}: {title?: string}) => ({title: title || kind, subtitle: kind}),
})

// ---------- page blocks ("sections") ----------

const sections = [
  defineType({
    name: 'hero',
    title: 'Big banner (top of home page)',
    icon: StarIcon,
    type: 'object',
    fields: [
      defineField({name: 'eyebrow', title: 'Small label above the headline', type: 'string'}),
      defineField({name: 'heading', title: 'Headline', type: 'string', validation: (r) => r.required()}),
      defineField({name: 'highlight', title: 'Words to colour in Sand', type: 'string', description: 'Copy a few words from the headline exactly, e.g. "the business can use."'}),
      defineField({name: 'lede', title: 'Intro text', type: 'text', rows: 3}),
      defineField({name: 'actions', title: 'Buttons (max 2)', type: 'array', of: [{type: 'link'}], validation: (r) => r.max(2)}),
      defineField({name: 'checks', title: 'Ticks under the buttons', type: 'array', of: [{type: 'string'}], description: 'Short points, e.g. "Senior people only"', validation: (r) => r.max(4)}),
      defineField({name: 'pillars', title: 'Numbered strip at the bottom', type: 'array', of: [{type: 'string'}]}),
    ],
    preview: blockPreview('Big banner'),
  }),
  defineType({
    name: 'textBlock',
    title: 'Text',
    icon: TextIcon,
    type: 'object',
    fields: [heading, defineField({name: 'body', title: 'Text', type: 'richText'}), defineField({name: 'withLogo', title: 'Show the logo beside the text', type: 'boolean', initialValue: false}), dark],
    preview: blockPreview('Text'),
  }),
  defineType({
    name: 'cards',
    title: 'Cards',
    icon: DashboardIcon,
    type: 'object',
    fields: [
      label,
      heading,
      defineField({name: 'intro', title: 'Text under the heading', type: 'text', rows: 2}),
      defineField({name: 'style', title: 'Look', type: 'string', options: {list: [{title: 'Clickable cards', value: 'post'}, {title: 'Announcement boxes', value: 'launch'}], layout: 'radio'}, initialValue: 'post'}),
      defineField({
        name: 'items',
        title: 'Cards',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'card',
            title: 'Card',
            fields: [
              defineField({name: 'kicker', title: 'Small label', type: 'string'}),
              defineField({name: 'title', title: 'Title', type: 'string'}),
              defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
              defineField({name: 'link', title: 'Where it goes when clicked', type: 'link'}),
            ],
          }),
        ],
      }),
      defineField({name: 'link', title: 'Link under the cards', type: 'link', description: 'e.g. View all services'}),
    ],
    preview: blockPreview('Cards'),
  }),
  defineType({
    name: 'techCards',
    title: 'Technology cards',
    icon: StackIcon,
    type: 'object',
    fields: [
      label,
      heading,
      dark,
      defineField({
        name: 'items',
        title: 'Cards',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'techCard',
            title: 'Technology',
            fields: [
              defineField({name: 'mark', title: 'Short name shown big', type: 'string', description: 'Max 4 letters, e.g. SAC', validation: (r) => r.required().max(4)}),
              defineField({name: 'label', title: 'Full product name', type: 'string', description: 'e.g. SAP Analytics Cloud', validation: (r) => r.required()}),
              defineField({name: 'text', title: 'One line about it', type: 'text', rows: 2}),
              defineField({name: 'link', title: 'Where it goes when clicked', type: 'link'}),
              defineField({name: 'tone', title: 'Colour', type: 'string', options: {list: [{title: 'Dark', value: 'dark'}, {title: 'Bronze', value: 'teal'}, {title: 'Sand', value: 'light'}], layout: 'radio'}, initialValue: 'dark'}),
            ],
            preview: {select: {title: 'label', subtitle: 'mark'}},
          }),
        ],
      }),
    ],
    preview: blockPreview('Technology cards'),
  }),
  defineType({
    name: 'process',
    title: 'Steps (how we work)',
    icon: ThListIcon,
    type: 'object',
    fields: [
      label,
      heading,
      defineField({name: 'intro', title: 'Text under the heading', type: 'text', rows: 3}),
      dark,
      defineField({
        name: 'steps',
        title: 'Steps',
        type: 'array',
        validation: (r) => r.min(2).max(6),
        of: [
          defineArrayMember({
            type: 'object',
            name: 'step',
            title: 'Step',
            fields: [
              defineField({name: 'title', title: 'Step name', type: 'string', validation: (r) => r.required()}),
              defineField({name: 'text', title: 'Short explanation', type: 'text', rows: 2}),
            ],
          }),
        ],
      }),
      defineField({name: 'note', title: 'Closing line under the steps', type: 'text', rows: 2}),
    ],
    preview: blockPreview('Steps'),
  }),
  defineType({
    name: 'iconGrid',
    title: 'Points with icons',
    icon: BulbOutlineIcon,
    type: 'object',
    fields: [
      label,
      heading,
      defineField({name: 'lede', title: 'Intro text', type: 'text', rows: 2}),
      defineField({
        name: 'style',
        title: 'Look',
        type: 'string',
        options: {list: [{title: 'Boxes, 2 per row', value: 'tiles'}, {title: 'Columns, 4 per row', value: 'columns'}], layout: 'radio'},
        initialValue: 'tiles',
      }),
      dark,
      defineField({
        name: 'items',
        title: 'Points',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'iconItem',
            title: 'Point',
            fields: [
              defineField({name: 'icon', title: 'Icon', type: 'string', options: {list: ICONS}, initialValue: 'check'}),
              defineField({name: 'title', title: 'Text', type: 'string', validation: (r) => r.required()}),
              defineField({name: 'text', title: 'Extra line (optional)', type: 'text', rows: 2}),
            ],
            preview: {select: {title: 'title', subtitle: 'icon'}},
          }),
        ],
      }),
    ],
    preview: blockPreview('Points with icons'),
  }),
  defineType({
    name: 'pageIndex',
    title: 'List of pages inside',
    icon: DocumentTextIcon,
    type: 'object',
    description: 'Lists the pages that sit inside a page. New pages appear here on their own.',
    fields: [
      label,
      heading,
      defineField({
        name: 'source',
        title: 'Show the pages inside…',
        type: 'reference',
        to: [{type: 'page'}],
        description: 'Leave empty to show the pages inside this page.',
      }),
      defineField({name: 'style', title: 'Look', type: 'string', options: {list: [{title: 'Numbered list', value: 'index'}, {title: 'Cards', value: 'cards'}], layout: 'radio'}, initialValue: 'index'}),
    ],
    preview: {
      select: {title: 'heading', src: 'source.title'},
      prepare: ({title, src}) => ({title: title || `Pages inside ${src || 'this page'}`, subtitle: 'List of pages inside'}),
    },
  }),
  defineType({
    name: 'band',
    title: 'Highlight band',
    icon: InlineElementIcon,
    type: 'object',
    fields: [
      defineField({name: 'eyebrow', title: 'Small label', type: 'string'}),
      heading,
      defineField({name: 'body', title: 'Text', type: 'text', rows: 3}),
      defineField({name: 'link', title: 'Text link', type: 'link'}),
      defineField({name: 'button', title: 'Button', type: 'link'}),
      defineField({name: 'smallPrint', title: 'Small print', type: 'text', rows: 2}),
      defineField({name: 'tone', title: 'Colour', type: 'string', options: {list: [{title: 'Dark', value: 'dark'}, {title: 'Sand', value: 'sand'}], layout: 'radio'}, initialValue: 'dark'}),
    ],
    preview: blockPreview('Highlight band'),
  }),
  defineType({
    name: 'split',
    title: 'Checklist + side box',
    icon: ThListIcon,
    type: 'object',
    fields: [
      defineField({name: 'heading', title: 'Checklist heading', type: 'string', initialValue: 'In scope'}),
      defineField({name: 'items', title: 'Checklist items', type: 'array', of: [{type: 'string'}]}),
      defineField({name: 'asideHeading', title: 'Side box heading', type: 'string', initialValue: 'How it starts'}),
      defineField({name: 'asideText', title: 'Side box text', type: 'text', rows: 3}),
      defineField({name: 'asideLink', title: 'Side box button', type: 'link'}),
    ],
    preview: blockPreview('Checklist + side box'),
  }),
  defineType({
    name: 'logos',
    title: 'Client names strip',
    icon: TagIcon,
    type: 'object',
    fields: [
      defineField({name: 'note', title: 'Small line above', type: 'string'}),
      defineField({name: 'items', title: 'Names', type: 'array', of: [{type: 'string'}]}),
    ],
    preview: {prepare: () => ({title: 'Client names strip', subtitle: 'Client names strip'})},
  }),
  defineType({
    name: 'caseStudyList',
    title: 'Case studies (automatic)',
    icon: CaseIcon,
    type: 'object',
    description: 'Shows the case studies from "Case studies" in the sidebar.',
    fields: [
      label,
      heading,
      defineField({name: 'display', title: 'Look', type: 'string', options: {list: [{title: 'Short cards', value: 'cards'}, {title: 'Full stories', value: 'full'}], layout: 'radio'}, initialValue: 'cards'}),
      defineField({name: 'limit', title: 'How many to show', type: 'number', description: 'Empty = all'}),
      defineField({name: 'link', title: 'Where the cards go when clicked', type: 'link'}),
      dark,
    ],
    preview: blockPreview('Case studies (automatic)'),
  }),
  defineType({
    name: 'postList',
    title: 'Insights / blog posts (automatic)',
    icon: ComposeIcon,
    type: 'object',
    description: 'Shows the newest posts from "Insights" in the sidebar.',
    fields: [
      label,
      heading,
      defineField({name: 'limit', title: 'How many to show', type: 'number', description: 'Empty = all'}),
      defineField({name: 'showExcerpt', title: 'Show the short summary', type: 'boolean', initialValue: true}),
      dark,
    ],
    preview: blockPreview('Insights (automatic)'),
  }),
  defineType({
    name: 'people',
    title: 'Team members',
    icon: UsersIcon,
    type: 'object',
    fields: [
      heading,
      defineField({name: 'intro', title: 'Text (shown when there are no profiles yet)', type: 'text', rows: 2}),
      defineField({
        name: 'items',
        title: 'People',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'person',
            title: 'Person',
            fields: [
              defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
              defineField({name: 'role', title: 'Job title', type: 'string'}),
              defineField({name: 'focus', title: 'Areas of focus', type: 'string'}),
              defineField({name: 'bio', title: 'Short bio', type: 'text', rows: 3}),
              defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
              defineField({name: 'linkedin', title: 'LinkedIn link', type: 'url'}),
            ],
          }),
        ],
      }),
    ],
    preview: {prepare: () => ({title: 'Team members', subtitle: 'Team members'})},
  }),
  defineType({
    name: 'jobList',
    title: 'Open jobs (automatic)',
    icon: BillIcon,
    type: 'object',
    description: 'Shows every job from "Jobs" in the sidebar.',
    fields: [defineField({name: 'emptyText', title: 'Text when there are no jobs', type: 'string', initialValue: 'No open roles right now.'})],
    preview: {prepare: () => ({title: 'Open jobs (automatic)', subtitle: 'Open jobs'})},
  }),
  defineType({
    name: 'contact',
    title: 'Contact form',
    icon: EnvelopeIcon,
    type: 'object',
    description: 'Form + contact details. Emails and phone come from Site settings.',
    fields: [
      defineField({name: 'intro', title: 'Text above the form', type: 'text', rows: 2}),
      defineField({name: 'directHeading', title: 'Heading of the contact details box', type: 'string', initialValue: 'Other ways to reach us'}),
      defineField({name: 'success', title: 'Message after sending', type: 'text', rows: 2}),
      defineField({name: 'error', title: 'Message if sending fails', type: 'text', rows: 2}),
      defineField({name: 'consent', title: 'Consent line (the words "Privacy Policy" become a link)', type: 'string'}),
    ],
    preview: {prepare: () => ({title: 'Contact form', subtitle: 'Contact form'})},
  }),
  defineType({
    name: 'listBlock',
    title: 'List',
    icon: ThListIcon,
    type: 'object',
    description: 'A heading and a bullet list, e.g. Common challenges, What we do, Typical deliverables.',
    fields: [
      heading,
      defineField({name: 'intro', title: 'Text above the list', type: 'text', rows: 2}),
      defineField({name: 'items', title: 'Items', type: 'array', of: [{type: 'string'}]}),
      defineField({name: 'columns', title: 'Show in two columns', type: 'boolean', initialValue: false}),
      dark,
    ],
    preview: blockPreview('List'),
  }),
  defineType({
    name: 'faq',
    title: 'Questions & answers',
    icon: BulbOutlineIcon,
    type: 'object',
    description: 'Also tells Google the questions and answers for search results.',
    fields: [
      defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Common questions'}),
      defineField({
        name: 'items',
        title: 'Questions',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'qa',
            title: 'Question',
            fields: [
              defineField({name: 'question', title: 'Question', type: 'string', validation: (r) => r.required()}),
              defineField({name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (r) => r.required()}),
            ],
            preview: {select: {title: 'question'}},
          }),
        ],
      }),
    ],
    preview: blockPreview('Questions & answers'),
  }),
  defineType({
    name: 'illustrative',
    title: 'Illustrative examples',
    icon: CaseIcon,
    type: 'object',
    description: 'Made-up scenarios that explain the work. The label always shows, so they are never mistaken for client case studies.',
    fields: [
      heading,
      defineField({name: 'label', title: 'Label (always shown)', type: 'string', initialValue: 'Illustrative scenario, not a client project.', validation: (r) => r.required()}),
      defineField({name: 'items', title: 'Examples', type: 'array', of: [{type: 'text', rows: 3}]}),
    ],
    preview: blockPreview('Illustrative examples'),
  }),
  defineType({
    name: 'cta',
    title: 'Closing call to action',
    icon: StarIcon,
    type: 'object',
    fields: [
      heading,
      defineField({name: 'body', title: 'Text', type: 'text', rows: 2}),
      defineField({name: 'button', title: 'Button', type: 'link'}),
    ],
    preview: blockPreview('Call to action'),
  }),
  defineType({
    name: 'badges',
    title: 'Text badges',
    icon: TagIcon,
    type: 'object',
    description: 'Plain text badges, e.g. technologies. No logos.',
    fields: [
      heading,
      defineField({name: 'items', title: 'Badges', type: 'array', of: [{type: 'string'}]}),
      defineField({name: 'smallPrint', title: 'Small print', type: 'text', rows: 2}),
    ],
    preview: blockPreview('Text badges'),
  }),
  defineType({
    name: 'smallPrint',
    title: 'Small print',
    icon: TextIcon,
    type: 'object',
    fields: [defineField({name: 'text', title: 'Text', type: 'text', rows: 2})],
    preview: {select: {title: 'text'}, prepare: ({title}) => ({title: title || 'Small print', subtitle: 'Small print'})},
  }),
  productGrid,
]

// Groups in the "Add item" menu for page blocks.
const BLOCK_GROUPS = [
  {name: 'basic', title: 'Basic', of: ['textBlock', 'listBlock', 'cards', 'iconGrid', 'faq', 'cta', 'smallPrint', 'split', 'band']},
  {name: 'sales', title: 'Show what we do', of: ['hero', 'pageIndex', 'process', 'illustrative', 'badges', 'techCards', 'logos']},
  {name: 'auto', title: 'Automatic lists', of: ['productGrid', 'caseStudyList', 'postList', 'jobList', 'people']},
  {name: 'forms', title: 'Forms', of: ['contact']},
]

// ---------- page validation ----------

async function slugUniqueUnderParent(slug: string, ctx: SlugValidationContext) {
  const doc = ctx.document
  if (!doc) return true
  const id = baseId(doc._id)
  const parent = (doc.parent as {_ref?: string} | undefined)?._ref ?? ''
  const clash = await ctx.getClient(API).fetch<number>(
    `count(*[_type == "page" && slug.current == $slug && coalesce(parent._ref, "") == $parent && !(_id in [$id, "drafts." + $id])])`,
    {slug, parent, id},
  )
  return clash === 0
}

// Walk up the parent chain; refuse if it comes back to this page.
async function noParentLoop(parent: {_ref?: string} | undefined, ctx: any) {
  if (!parent?._ref) return true
  const self = baseId(ctx.document?._id)
  const client = ctx.getClient(API)
  let ref: string | undefined = parent._ref
  for (let depth = 0; ref && depth < 20; depth++) {
    if (baseId(ref) === self) return 'A page cannot sit inside itself or one of its own sub-pages.'
    ref = await client.fetch(`*[_id == $ref][0].parent._ref`, {ref})
  }
  return true
}

// ---------- documents ----------

const page = defineType({
  name: 'page',
  title: 'Page',
  icon: DocumentTextIcon,
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'Google'},
    {name: 'more', title: 'More options'},
  ],
  fields: [
    defineField({name: 'title', title: 'Page name', type: 'string', group: 'content', description: 'Used in the menu, lists and the browser tab.', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'content',
      description: 'The end of the link, e.g. "about-us". Click Generate to make it from the page name.',
      options: {source: 'title', isUnique: slugUniqueUnderParent},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Sits inside (optional)',
      type: 'reference',
      to: [{type: 'page'}],
      group: 'content',
      description: 'Pick a page to put this one inside it. Example: inside "Services" with address "ai" → /services/ai. It also appears in that menu dropdown.',
      options: {
        filter: ({document}) => ({
          filter: '!(_id in [$id, "drafts." + $id])',
          params: {id: baseId(document._id)},
        }),
      },
      validation: (r) => r.custom(noParentLoop),
    }),
    defineField({name: 'heading', title: 'Big heading on the page', type: 'string', group: 'content', description: 'Leave empty to use the page name.'}),
    defineField({name: 'lede', title: 'Intro text under the heading', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'heroButton', title: 'Button under the intro', type: 'link', group: 'content'}),
    defineField({
      name: 'sections',
      title: 'Page content',
      description: 'The blocks that make up the page, top to bottom. Click "Add item" to add one, drag ⋮⋮ to reorder.',
      type: 'array',
      group: 'content',
      of: sections.map((s) => defineArrayMember({type: s.name})),
      options: {insertMenu: {filter: true, groups: BLOCK_GROUPS.map(({name, title, of}) => ({name, title, of}))}},
    }),

    defineField({name: 'seoTitle', title: 'Title in Google', type: 'string', group: 'seo', description: 'Leave empty to use the page name.', validation: (r) => r.max(60).warning('Google cuts titles near 60 characters.')}),
    defineField({name: 'seoDescription', title: 'Description in Google', type: 'text', rows: 2, group: 'seo', description: 'One or two sentences shown under the title in search results.', validation: (r) => r.max(160).warning('Google cuts descriptions near 160 characters.')}),
    defineField({name: 'noindex', title: 'Hide this page from Google', type: 'boolean', group: 'seo', initialValue: false}),

    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 2, group: 'more', description: 'One line shown when this page appears in a list (e.g. on its parent page).'}),
    defineField({name: 'bestFor', title: '"Best for" line', type: 'string', group: 'more', description: 'Shown on this page\'s card in a list, e.g. "leaders planning a modernization".'}),
    defineField({name: 'eyebrow', title: 'Small label above the heading', type: 'string', group: 'more'}),
    defineField({name: 'order', title: 'Position among its sibling pages', type: 'number', group: 'more', description: '1 = first. Controls the order in menus and lists.'}),
    defineField({
      name: 'layout',
      title: 'Page style',
      type: 'string',
      group: 'more',
      options: {list: [{title: 'Normal page (heading at the top)', value: 'standard'}, {title: 'Full-width (like the home page)', value: 'landing'}], layout: 'radio'},
      initialValue: 'standard',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', parent: 'parent.slug.current', grand: 'parent.parent.slug.current'},
    prepare: ({title, slug, parent, grand}) => ({title, subtitle: '/' + [grand, parent, slug].filter(Boolean).join('/')}),
  },
  orderings: [{title: 'Name A–Z', name: 'title', by: [{field: 'title', direction: 'asc'}]}],
})

const post = defineType({
  name: 'post',
  title: 'Insight (blog post)',
  icon: ComposeIcon,
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'Google'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Web address', type: 'slug', group: 'content', description: 'Click Generate. The post will be at /insights/<this>.', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'kicker', title: 'Topic label', type: 'string', group: 'content', description: 'e.g. Planning'}),
    defineField({name: 'excerpt', title: 'Short summary', type: 'text', rows: 2, group: 'content', description: 'Shown on the cards that link to this post.'}),
    defineField({name: 'body', title: 'Article', type: 'richText', group: 'content'}),
    defineField({name: 'publishedAt', title: 'Date', type: 'datetime', group: 'content', initialValue: () => new Date().toISOString()}),
    defineField({name: 'seoDescription', title: 'Description in Google', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(160).warning()}),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'kicker'}},
})

const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  icon: CaseIcon,
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'kicker', title: 'Label', type: 'string', description: 'e.g. Manufacturing'}),
    defineField({name: 'summary', title: 'One-line summary', type: 'text', rows: 2}),
    defineField({name: 'challenge', title: 'The challenge', type: 'text', rows: 2}),
    defineField({name: 'approach', title: 'What we did', type: 'text', rows: 2}),
    defineField({name: 'result', title: 'The result', type: 'text', rows: 2}),
    defineField({name: 'order', title: 'Position in the list', type: 'number', description: '1 = first'}),
  ],
  preview: {select: {title: 'title', subtitle: 'kicker'}},
})

const job = defineType({
  name: 'job',
  title: 'Job',
  icon: BillIcon,
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Job title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'kicker', title: 'Type', type: 'string', description: 'e.g. Full time · Remote'}),
    defineField({name: 'summary', title: 'Description', type: 'text', rows: 3}),
    defineField({name: 'email', title: 'Apply by email to', type: 'string', validation: (r) => r.email()}),
    defineField({name: 'order', title: 'Position in the list', type: 'number', description: '1 = first'}),
  ],
  preview: {select: {title: 'title', subtitle: 'kicker'}},
})

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  icon: CogIcon,
  type: 'document',
  groups: [
    {name: 'menu', title: 'Menu & buttons', default: true},
    {name: 'contact', title: 'Contact & footer'},
    {name: 'advanced', title: 'Advanced'},
  ],
  fields: [
    defineField({name: 'nav', title: 'Menu', type: 'array', of: [{type: 'link'}], group: 'menu', description: 'Top menu, left to right. A page with pages inside it gets a dropdown automatically.'}),
    defineField({name: 'headerCta', title: 'Button at the top right', type: 'link', group: 'menu'}),
    defineField({name: 'floatingCta', title: 'Round floating button', type: 'link', group: 'menu', description: 'Stays in the corner while scrolling, e.g. "Book a call". Leave empty to hide.'}),
    defineField({name: 'homePage', title: 'Home page', type: 'reference', to: [{type: 'page'}], group: 'menu', validation: (r) => r.required()}),
    defineField({name: 'shopPage', title: 'Shop page', type: 'reference', to: [{type: 'page'}], group: 'menu', description: 'The page product pages link back to ("Shop / Product name").'}),
    defineField({name: 'currency', title: 'Currency', type: 'string', group: 'menu', options: {list: ['INR', 'USD', 'EUR', 'GBP', 'TRY', 'AED']}, initialValue: 'INR'}),

    defineField({name: 'emails', title: 'Email addresses', type: 'array', of: [{type: 'string'}], group: 'contact'}),
    defineField({name: 'phone', title: 'Phone', type: 'string', group: 'contact'}),
    defineField({name: 'office', title: 'Office address', type: 'string', group: 'contact'}),
    defineField({name: 'contactServices', title: 'Choices in the contact form ("Service interested in")', type: 'array', of: [{type: 'string'}], group: 'contact'}),
    defineField({name: 'tagline', title: 'Footer: one line about the company', type: 'string', group: 'contact'}),
    defineField({name: 'footerNote', title: 'Footer: small note', type: 'string', group: 'contact'}),
    defineField({name: 'linkedin', title: 'LinkedIn page', type: 'string', group: 'contact'}),
    defineField({name: 'companyLinks', title: 'Footer: Company links (About, Partner With Us…)', type: 'array', of: [{type: 'link'}], group: 'contact'}),
    defineField({name: 'footerLinks', title: 'Footer: bottom links (Privacy, Terms…)', type: 'array', of: [{type: 'link'}], group: 'contact'}),
    defineField({name: 'legalName', title: 'Footer: legal company name for the copyright line', type: 'string', group: 'contact', description: 'e.g. Aikyanix Core LLC'}),
    defineField({name: 'footerSmallPrint', title: 'Footer: small print', type: 'text', rows: 2, group: 'contact'}),
    defineField({name: 'notFoundHeading', title: 'Page not found: heading', type: 'string', group: 'advanced'}),
    defineField({name: 'notFoundBody', title: 'Page not found: text', type: 'text', rows: 2, group: 'advanced'}),

    defineField({name: 'siteName', title: 'Company name', type: 'string', group: 'advanced', validation: (r) => r.required()}),
    defineField({name: 'logoSmall', title: 'Small text after the name', type: 'string', group: 'advanced', description: 'e.g. CORE'}),
    defineField({name: 'defaultDescription', title: 'Default description in Google', type: 'text', rows: 2, group: 'advanced', description: 'Used when a page has none of its own.'}),
    defineField({
      name: 'redirects',
      title: 'Old links → new links',
      type: 'array',
      group: 'advanced',
      description: 'Moved or renamed a page? Add the old address and the new one so old links (and Google) still work.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'redirect',
          fields: [
            defineField({name: 'from', title: 'Old address', type: 'string', description: 'e.g. /old-page', validation: (r) => r.required().regex(/^\//, {name: 'address starting with /'})}),
            defineField({name: 'to', title: 'New address', type: 'string', description: 'e.g. /new-page', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'from', subtitle: 'to'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})

export const schemaTypes = [link, richText, ...sections, page, post, caseStudy, job, product, productCategory, siteSettings]
