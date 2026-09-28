# Presentation mockup review — 25 September 2026

## Build and source checks

- `node node_modules/typescript/bin/tsc --noEmit` passed.
- `node node_modules/next/dist/bin/next build` passed and generated 101 static pages/endpoints, including Thai/English routes and all 36 product details in both languages.
- Catalog checks passed: unique IDs, SKUs and slugs; positive source prices; localized names/descriptions; category references; existing local image paths.
- All 67 copied legacy assets passed full image decoding. Optimization reduced them from 21.14 MiB to 9.28 MiB; the supplied logo and generated hero were handled separately.
- The localization refactor preserved all 238 original translation pairs. UI messages, editorial content and language settings are centralized; future language fields in the management preview follow configuration.

## HTTP checks

- 32 public localized/sample product routes returned valid status, document language, self-canonical and three alternate language entries (Thai, English and x-default).
- 91 discovered internal links and 65 image references resolved successfully.
- `/` redirects to `/th`; invalid locale, page and product paths return 404.
- Robots and sitemap respond successfully. Indexing remains deliberately disabled for this presentation build.
- One initial development compilation request returned a transient 500 and passed on retry; the production build and subsequent route checks passed.

## Browser review

Used the Codex browser against the actual local application.

- Visually reviewed Thai and English storefronts, product catalog, product detail, cart, catalogs, brand page, and management preview.
- Inspected page widths at 320, 390, 768 and 1440 pixels. Rechecked 320px home, product, contact and management routes after corrections; document width equals viewport content width with no page overflow. The management table intentionally scrolls inside its own container on mobile.
- Product category filtering and ascending price sorting returned the correct items/order.
- Search for Bordeaux returned one product. Clearing filters and returning through the main navigation restored all 36 items, with 12 per page; submitting the empty field did not restore the old query.
- Saved a product, navigated to its detail page, and confirmed it remained in the wishlist after reload and language changes.
- Added one glass, added two more from the detail page, and verified the cart had three pieces at ฿170 each, totaling ฿510.
- Cart persisted after reload. Switching to Thai preserved the cart route and quantities.
- Empty checkout submission showed localized required-field errors. Valid fictitious details completed the demo, displayed the correct total, and cleared the cart without sending any order or payment.
- Catalog search filtered to the requested publication.
- Management search found a SKU. Editing its price from ฿65 to ฿80 updated the preview; reset restored ฿65.
- Contact form produced a local inquiry preview and explicitly confirmed that no message was sent.
- Search dialog opens with an accessible name and closes with Escape. Mobile navigation closes with Escape, and underlying content is inert while it is open.

## Corrections made during review

- Removed search state that could differ from the displayed field after navigation.
- Disabled add actions when the 99-piece demonstration limit is reached; detail selection respects remaining capacity.
- Contained a hidden table heading that caused mobile horizontal overflow.
- Adjusted header and brand spacing for 320px screens.
- Preserved complete brand logos instead of cropping them.
- Added route scroll handling, search dialog/button labels and Next.js smooth-scroll metadata.

## Scope limits

This is a frontend presentation. No live order, payment, stock, account, database, media upload, email or authenticated administration integration is implemented. Contact and catalog links retain source destinations; external publication availability was not comprehensively tested. Old-source prices and conflicting telephone details need business confirmation before a production launch. No deployment was performed.
