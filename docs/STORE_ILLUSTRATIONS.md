# Store slider illustrations

Generated with the built-in image generation tool on 28 September 2026.
The exact prompt for each image is in `store-illustration-prompts.json`.

All seven branches have three separate 3:2 illustrations: exterior, interior,
and glassware display. These are imagined cartoon/painterly store concepts for
the presentation, not representations of the actual premises. The stores page
explains this in Thai and English.

Optimized website files are in `public/images/stores/`, named
`{store-id}-{exterior|interior|display}.webp`. Original generated PNGs remain
in the image generation output directory. `store-illustration-assets.json`
records their source paths and website destinations.

The storefront sliders and CMS seed share the gallery mapping in
`src/lib/store-art.ts`. Existing CMS sessions receive the illustrations only
when a store still has its exact original sample gallery. Customized galleries
and media descriptions are preserved.
