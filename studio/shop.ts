import {BasketIcon} from '@sanity/icons/Basket'
import {PackageIcon} from '@sanity/icons/Package'
import {TagsIcon} from '@sanity/icons/Tags'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Shop: products are requested (enquiry), not paid online. Prices are shown in Site settings' currency.

export const STOCK = [
  {title: 'In stock', value: 'in'},
  {title: 'Only a few left', value: 'low'},
  {title: 'Made to order', value: 'order'},
  {title: 'Out of stock', value: 'out'},
]

export const productCategory = defineType({
  name: 'productCategory',
  title: 'Product category',
  icon: TagsIcon,
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Category name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Web address', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 2}),
  ],
})

export const product = defineType({
  name: 'product',
  title: 'Product',
  icon: PackageIcon,
  type: 'document',
  groups: [
    {name: 'main', title: 'Product', default: true},
    {name: 'options', title: 'Options & stock'},
    {name: 'details', title: 'Details tabs'},
    {name: 'reviews', title: 'Reviews'},
    {name: 'seo', title: 'Google'},
  ],
  fields: [
    defineField({name: 'title', title: 'Product name', type: 'string', group: 'main', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'Web address', type: 'slug', group: 'main', description: 'Click Generate. The product will be at /products/<this>.', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      group: 'main',
      description: 'First photo is the main one. Square photos on a white background look best.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Describe the photo', type: 'string'})],
        }),
      ],
    }),
    defineField({name: 'price', title: 'Price', type: 'number', group: 'main', description: 'Numbers only, e.g. 20149', validation: (r) => r.min(0)}),
    defineField({name: 'compareAtPrice', title: 'Old price (shown crossed out)', type: 'number', group: 'main', description: 'Optional, for a sale.'}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'productCategory'}], group: 'main'}),
    defineField({name: 'badge', title: 'Badge on the photo', type: 'string', group: 'main', description: 'Optional, e.g. New, Bestseller, Sale, Handmade'}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, group: 'main', description: 'Shown next to the photos.'}),

    defineField({name: 'sku', title: 'SKU / product code', type: 'string', group: 'options'}),
    defineField({name: 'brand', title: 'Brand', type: 'string', group: 'options'}),
    defineField({name: 'stock', title: 'Stock', type: 'string', group: 'options', options: {list: STOCK, layout: 'radio'}, initialValue: 'in'}),
    defineField({
      name: 'dispatch',
      title: 'Dispatch time (working days)',
      type: 'object',
      group: 'options',
      description: 'Shows "Estimated dispatch: <dates>". Leave empty to hide.',
      options: {columns: 2},
      fields: [
        defineField({name: 'min', title: 'From', type: 'number'}),
        defineField({name: 'max', title: 'To', type: 'number'}),
      ],
    }),
    defineField({
      name: 'options',
      title: 'Choices for the customer',
      type: 'array',
      group: 'options',
      description: 'e.g. Colour: Off White / Black, Size: Small / Large.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productOption',
          title: 'Choice',
          fields: [
            defineField({name: 'name', title: 'Choice name', type: 'string', description: 'e.g. Colour', validation: (r) => r.required()}),
            defineField({
              name: 'values',
              title: 'Values',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'optionValue',
                  title: 'Value',
                  fields: [
                    defineField({name: 'label', title: 'Value', type: 'string', description: 'e.g. Off White', validation: (r) => r.required()}),
                    defineField({name: 'swatch', title: 'Colour dot (optional)', type: 'string', description: 'Hex colour, e.g. #F2EEE6', validation: (r) => r.regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, {name: 'hex colour'})}),
                    defineField({name: 'price', title: 'Price for this value (optional)', type: 'number', description: 'Replaces the main price when chosen.'}),
                  ],
                  preview: {select: {title: 'label', subtitle: 'price'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'name'}},
        }),
      ],
    }),

    defineField({
      name: 'tabs',
      title: 'Details tabs',
      type: 'array',
      group: 'details',
      description: 'Expandable sections under the product, e.g. Description, Care, Shipping, Support, Downloads.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'productTab',
          title: 'Tab',
          fields: [
            defineField({name: 'title', title: 'Tab title', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'body', title: 'Text', type: 'richText'}),
            defineField({name: 'file', title: 'Downloadable file (optional)', type: 'file', description: 'e.g. a PDF manual or care guide.'}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),

    defineField({
      name: 'reviews',
      title: 'Customer reviews',
      type: 'array',
      group: 'reviews',
      description: 'Add reviews customers send you. They show with star ratings on the product page.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'review',
          title: 'Review',
          fields: [
            defineField({name: 'name', title: 'Customer name', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'rating', title: 'Stars (1–5)', type: 'number', initialValue: 5, validation: (r) => r.required().min(1).max(5).integer()}),
            defineField({name: 'text', title: 'Review', type: 'text', rows: 3}),
            defineField({name: 'date', title: 'Date', type: 'date'}),
          ],
          preview: {select: {title: 'name', subtitle: 'text'}},
        }),
      ],
    }),
    defineField({name: 'related', title: 'Show these in "You may also like"', type: 'array', group: 'reviews', of: [{type: 'reference', to: [{type: 'product'}]}], description: 'Optional. Empty = other products from the same category.'}),

    defineField({name: 'seoDescription', title: 'Description in Google', type: 'text', rows: 2, group: 'seo', validation: (r) => r.max(160).warning()}),
  ],
  preview: {
    select: {title: 'title', price: 'price', media: 'images.0', category: 'category.title'},
    prepare: ({title, price, media, category}) => ({title, media, subtitle: [category, price != null ? `${price}` : null].filter(Boolean).join(' · ')}),
  },
})

// Page block: grid of products.
export const productGrid = defineType({
  name: 'productGrid',
  title: 'Products (automatic)',
  icon: BasketIcon,
  type: 'object',
  description: 'Shows products. Pick a category to show only that category.',
  fields: [
    defineField({name: 'kicker', title: 'Small label above the heading', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'category', title: 'Only this category', type: 'reference', to: [{type: 'productCategory'}], description: 'Empty = all products.'}),
    defineField({name: 'limit', title: 'How many to show', type: 'number', description: 'Empty = all'}),
  ],
  preview: {
    select: {title: 'heading', cat: 'category.title'},
    prepare: ({title, cat}) => ({title: title || `Products${cat ? `: ${cat}` : ''}`, subtitle: 'Products (automatic)'}),
  },
})
