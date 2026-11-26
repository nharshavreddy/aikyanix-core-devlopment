import {BillIcon} from '@sanity/icons/Bill'
import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {ComposeIcon} from '@sanity/icons/Compose'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {EditIcon} from '@sanity/icons/Edit'
import {FolderIcon} from '@sanity/icons/Folder'
import {PackageIcon} from '@sanity/icons/Package'
import {TagsIcon} from '@sanity/icons/Tags'
import {createElement} from 'react'
import {defineConfig} from 'sanity'
import {structureTool, type ListBuilder, type StructureBuilder} from 'sanity/structure'
import {schemaTypes} from './schema'
import {ViewOnSite} from './viewOnSite'

const SINGLETON = 'siteSettings'
const PAGE_INSIDE = 'page-inside'
const baseId = (id: string) => id.replace(/^drafts\./, '')

// "Pages by section": main pages → open one → edit it, or see/add the pages inside it.
function pageTree(S: StructureBuilder) {
  const insideOf = (parentId: string, title: string): ListBuilder =>
    S.list()
      .title(title)
      .items([
        S.listItem().title(`Edit "${title}"`).icon(EditIcon).child(S.document().schemaType('page').documentId(parentId)),
        S.listItem()
          .title(`Pages inside "${title}"`)
          .icon(FolderIcon)
          .child(
            S.documentList()
              .title(`Inside "${title}"`)
              .schemaType('page')
              .filter('_type == "page" && parent._ref == $parentId')
              .params({parentId})
              .defaultOrdering([{field: 'order', direction: 'asc'}, {field: 'title', direction: 'asc'}])
              .initialValueTemplates([S.initialValueTemplateItem(PAGE_INSIDE, {parentId})])
              .child((childId) => insideOf(baseId(childId), 'Sub-page')),
          ),
      ])

  return S.documentList()
    .title('Main pages')
    .schemaType('page')
    .filter('_type == "page" && !defined(parent)')
    .defaultOrdering([{field: 'order', direction: 'asc'}, {field: 'title', direction: 'asc'}])
    .child((id) => insideOf(baseId(id), 'Page'))
}

export default defineConfig({
  name: 'default',
  title: 'Aikyanix CORE',
  // Company logo instead of initials in the Studio's top-left corner (file: studio/static/logo.svg).
  icon: () => createElement('img', {src: '/static/logo.svg', alt: '', style: {width: '100%', height: '100%', objectFit: 'contain'}}),
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      title: 'Website',
      structure: (S) =>
        S.list()
          .title('Website')
          .items([
            S.listItem()
              .title('Pages')
              .icon(DocumentsIcon)
              .child(S.documentTypeList('page').title('All pages (address shown under each name)').defaultOrdering([{field: 'title', direction: 'asc'}])),
            S.listItem().title('Pages by section').icon(FolderIcon).child(pageTree(S)),
            S.divider(),
            S.listItem().title('Shop: products').icon(PackageIcon).child(S.documentTypeList('product').title('Products')),
            S.listItem().title('Shop: categories').icon(TagsIcon).child(S.documentTypeList('productCategory').title('Product categories')),
            S.divider(),
            S.listItem().title('Insights (blog posts)').icon(ComposeIcon).child(S.documentTypeList('post').title('Insights')),
            S.listItem().title('Case studies').icon(CaseIcon).child(S.documentTypeList('caseStudy').title('Case studies')),
            S.listItem().title('Jobs').icon(BillIcon).child(S.documentTypeList('job').title('Jobs')),
            S.divider(),
            S.listItem()
              .title('Site settings (menu, footer, contact)')
              .icon(CogIcon)
              .child(S.document().schemaType(SINGLETON).documentId(SINGLETON).title('Site settings')),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter((t) => t.schemaType !== SINGLETON),
      {
        id: PAGE_INSIDE,
        title: 'Page inside another page',
        schemaType: 'page',
        parameters: [{name: 'parentId', type: 'string'}],
        value: ({parentId}: {parentId: string}) => ({parent: {_type: 'reference', _ref: parentId}}),
      },
    ],
  },
  document: {
    // The "page inside" template only makes sense from the "Pages by section" tree.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global' ? prev.filter((t) => t.templateId !== PAGE_INSIDE) : prev,
    actions: (actions, {schemaType}) => {
      if (schemaType === SINGLETON) return actions.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
      return [...actions, ViewOnSite]
    },
  },
})
