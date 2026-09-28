# JJGLASS full public product source

Collected from [JJGLASS Shop](https://jjglass.com/shop/) on **28 September 2026**. The public WooCommerce Store API provides full product details; every shop page was independently checked for product IDs and SKUs.

## Coverage

| Data | Collected |
| --- | ---: |
| Shop pages | 92 of 92 |
| Unique products | 1,464 |
| Products additional to the project's existing 84 | 1,380 |
| Products with descriptions | 1,464 |
| Products with specification-related text | 1,462 |
| Products with prices and images | 1,464 |
| Gallery image references | 2,924 |
| Distinct original image URLs | 2,904 |
| Category records, including brand categories | 105 |
| Attribute definitions | 2 |
| Attribute terms | 11 (3 colors, 8 sizes) |
| Variable products / complete variation records | 1 / 8 |

All shop IDs match the API collection exactly. No missing pages, duplicate product IDs, or failed requests remain. All 84 existing presentation products are present in the collected source.

The storefront imports a compact derivative at `src/lib/source-products-data.json` for the additional 1,380 products. Product identity and URLs use source IDs (`source-<ID>`), because source SKUs and slugs are not unique. The existing 84 presentation URLs and local photographs remain intact. The additional products now use locally stored full-size photos and thumbnails in `public/images/source/`; their source URLs remain in this dataset as provenance. `image-manifest.json` records the checksum and local path for every imported original, thumbnail, and category photo, and `product-image-map.json` links them to product IDs. To repeat the import from the backup, run `node scripts/import-backed-up-images.mjs ABSOLUTE_BACKUP_DIRECTORY`, then `node scripts/build-source-catalog.mjs` after changing the source collection or its language mapping. The builder refuses to emit product paths when a referenced local image is missing.

## Files

- `PRODUCT_INDEX.md`: browsable table of every product, SKU, price, source link, brand category, and gallery count.
- `products.json`: normalized product records with original names, SKUs, descriptions (text and original HTML), specification-related source lines, prices and currency precision, taxonomy, images and responsive sizes, variations, stock flags, ratings, and source shop-page URLs.
- `images.json`: deduplicated source URL manifest with product associations, thumbnails, responsive candidates, names, and alt text. Original photos and thumbnails are now stored under `public/images/source/`; extra responsive resize variants remain recorded as URLs only.
- `categories.json`: original category records, parent IDs, descriptions, category images where supplied, and source counts.
- `attributes.json` and `attribute-terms.json`: source attribute definitions and all public terms, including unused colors.
- `variations.json`: all eight variation records, including prices, descriptions, stock flags, and fetch provenance.
- `shop-pages.json`: evidence for all 92 pages and their product IDs, SKUs, and taxonomy classes.
- `report.json`: coverage counts, missing fields, duplicate SKUs, and source warnings.
- `snapshot.json`: complete source API product/taxonomy/variation objects plus shop evidence, used for offline regeneration.
- `raw/`: individual API response records with fetch URLs, UTC timestamps, pagination headers, and SHA-256 hashes of original HTTP response bodies. Records are reserialized as readable JSON; hashes refer to the original response bodies, not the saved wrapper files.
- `requests.json`: request provenance and source warnings. Repeated entries document supplementary enrichment requests.

## Source issues to retain during import

- Products **27670** and **27671** have no source SKU. The existing presentation uses their product IDs as SKUs; this dataset retains `null` rather than inventing source SKUs.
- SKU **37216** belongs to IDs **10221** and **24390**; **040230** to **19738** and **24507**; **041312** to **19740** and **24499**. Use source product ID as the import identity, not SKU alone. Leading zeros remain intact.
- Category pagination reports **104** in its header but returns **105 distinct records**. All returned categories are preserved; all product category references resolve.
- Products **15755** and **27549** have descriptions but no recognized specification lines. `specificationLines` is a convenience extraction of source text, not a validated dimensional schema.
- Product **27549** is titled as having a silver lid, but its description says gold. Original text is preserved for editorial review.
- The variable Mason bottle **27565** exposes eight source size options, including several height labels. These source options are preserved without inferring that their measurements agree with its description.

## Interpretation and use

This is a dated source collection, not a live inventory feed. `lowStockRemaining: null` means unavailable, not zero; the source purchase limit of 9999 is not an inventory count. Price amounts use the API's `currency_minor_unit` (0 in this snapshot), not an assumed two-decimal conversion. Source sale-price fields may equal regular price when `onSale` is false.

The source files retain original names and descriptions as evidence. A separate derived file supplies bilingual display copy for the presentation storefront; that copy needs editorial review before public launch. Preserve original HTML as source evidence and sanitize it before any future rendering. Brand categories and source tags are preserved separately, without inferring brands from filenames. Related simple products remain distinct; only the source's explicit variable relationship is represented as variations.

## Reproduce and verify

From the repository root, using the existing Node runtime (no added dependencies):

```powershell
node scripts/collect-products.mjs
node scripts/collect-products.mjs --resume
node scripts/collect-products.mjs --offline --date=2026-09-28
node scripts/check-product-source.mjs 2026-09-28
```

The default run fetches a new dated snapshot. `--resume` reuses saved API pages for that date after interruption; omit it for a fresh fetch. `--enrich --date=YYYY-MM-DD` refreshes terms and variation details for an existing snapshot. `--offline` regenerates derived JSON, the product index, and the report without network requests. Source requests are public GETs; shop checks use at most two concurrent requests and retry transient failures. No storefront data, database, or Cloudinary records are changed.
