# JJGLASS presentation website

A responsive Thai-first, English-localized frontend concept built with Next.js App Router, TypeScript, React, and colocated CSS Modules. This is a local presentation mockup, not a connected shop.

## Run locally

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. The root redirects to `/th`; the language control preserves the page and product filters.

On this computer the global PowerShell npm shim points to a missing file. The equivalent commands using the installed Node runtime are:

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' install --cache .npm-cache
node node_modules/next/dist/bin/next dev --port 3000
```

## Presentation walkthrough

1. `/th` — branded storefront, category collections, product picks, and lifestyle stories.
2. `/th/products` — 36 real source products, category/brand filters, search, sorting, and pagination. Open a product for details.
3. Save a product with the heart or add products to your bag. `/th/wishlist` and `/th/cart` persist locally in the browser.
4. `/th/checkout` — use fictitious contact details to demonstrate validation and the order preview. No order, payment, email, or personal information is sent or saved.
5. `/th/brands`, `/th/catalog`, `/th/inspiration`, `/th/about`, `/th/stores`, `/th/contact` — complete supporting pages. Catalogs open source-linked online publications. Store directions, phone, email, and LINE links lead to their real destinations.
6. `/th/studio` — public management interface preview. Search/filter products, edit Thai/English names and prices, and reset changes. Edits are confined to this preview and reset when leaving/reloading; they never change the storefront or source data.
7. Switch to English to show equivalent `/en` pages.

## Scope and content

- Uses the supplied JJGLASS logo and authentic product, category, lifestyle, catalog, and brand assets from the supplied old-site HTML.
- Includes 36 sourced products, ten categories, and seven store locations. Five categories have no priced items in the supplied export; their collection views guide visitors to ask the team rather than inventing products or prices.
- Prices represent the supplied snapshot. Contact and branch details are sourced as provided and need business confirmation before launch. See `docs/SOURCE_CONTENT.md` for provenance and the old site's conflicting contact numbers.
- All shopping is client-side. No MongoDB, Cloudinary uploads, account login, payment gateway, CMS authentication, email service, or live stock integration is configured.
- Crawlable localized routes, metadata, canonicals, hreflang, sitemap, and relevant structured data are included. The mockup deliberately uses `noindex` and disallow-all robots until approved for production. Production requires configuring `NEXT_PUBLIC_SITE_URL` and reviewing indexability and final business data.
- Fonts and page imagery are local, so the storefront does not rely on the legacy site to display its assets. External catalogs/contact destinations require internet access.
- No deployment has been performed.

## Checks

```sh
npm run typecheck
npm run build
```

Or invoke `node node_modules/typescript/bin/tsc --noEmit` and `node node_modules/next/dist/bin/next build` directly when the machine's npm shim is unavailable. Actual review evidence is recorded in `docs/QA.md`.

## Generated hero artwork

The built-in imagegen tool created `public/images/hero-original.png`; `public/images/hero.webp` is the optimized website asset. It is atmospheric concept imagery, not a claim about a specific product or store.

Prompt:

> Use case: photorealistic-natural. Asset type: premium glassware website hero, wide landscape 1536x1024. Primary request: editorial still-life photography of elegant glassware at a beautifully set dining table. Scene: quiet contemporary warm European-influenced dining room, warm taupe textured wall, late afternoon natural sunlight from right casting beautiful shadows. Subject: on RIGHT HALF, a tall exquisite clear wine glass with a small amount of red wine, a cut-glass water tumbler, a delicate clear glass vase with airy olive branches, ivory ceramic plates, natural linen tablecloth. Composition: cinematic and spacious, glassware hero beautifully large on right, LEFT HALF mostly atmospheric darker empty warm room and linen table edge for white overlaid website text. Materials: truly transparent fine glass with beautiful physically believable refractions, tactile linen, light oak. Palette warm caramel, creamy stone, deep olive, amber sunlight. Luxurious understated lifestyle magazine photography, lifelike, 50mm lens. No text, no typography, no logos, no borders, no collage, no website UI. Keep objects to right and lots of dark uncluttered negative space on left.
