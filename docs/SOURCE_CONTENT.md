# Supplied source content

This frontend presentation uses the local legacy website snapshots supplied by the user at `C:\Coding\2026\00-Files\jjglass\infomation from old website`. Prices and product records below reproduce those snapshots; they are presentation data, not a live stock or price feed. No prices, sales counts, reviews, stock counts, delivery promises, certifications, founding dates or guarantees have been invented.

## Scope and translation

- 84 products come from Home.txt, shop.txt, and the five product category snapshots, with source WooCommerce IDs, SKUs and THB prices. The 48 additional records and exact source image URLs are indexed in `src/lib/legacy-products-data.json`; the original 36 are listed below. Brand associations follow each product's source category classes.
- Thai display names are natural translations; model codes and source values are retained. English display names remove redundant leading manufacturer codes and repeated category terms for readability; meaningful capacity, dimensions, color and model distinctions remain. Original source wording and ounce specifications remain in descriptions and the provenance table. Legacy model spellings are preserved. Descriptions deliberately add no material, durability or care claims absent from the snapshot.
- Ten category cards follow Home.txt. Its `steamware` typo is normalized to `stemware`. Categories without supplied product records retain an empty presentation collection.
- Logos and brand names come from brand.txt / Home.txt. Ocean appears in the supplied products' explicit brand taxonomy.
- Seven locations, phone numbers and opening hours come from Store.txt. The general contact phone +66 87 184 1844 and email info@jjglass.com come from contact.txt. That contact phone differs from the Head Office phone 063 661 6194. The Bang Bon number is written as 068 661 6194 in Store.txt and is preserved rather than silently corrected. Validate contact details with the client before launch.
- LINE ID @jjglass comes from Store.txt; its deep link is formed from the supplied ID. Store map links target the exact Google listing IDs found in the supplied map embeds.
- The additional pasted store-page HTML confirms daily 08:30–18:30 hours and supplies a Google Maps listing iframe for each of the seven locations. The `/stores` page embeds those listings directly in the cards; Bang Bon, Section 9, Section 7, and LYNX use newly shared iframe URLs for the same listings to center their pins at a useful zoom. Image sliders remain illustrative collection imagery because the source contains no branch-photo files or Google Places photo references. A live Google Places photo gallery would require a configured API key, fresh photo references, and the required photo attributions.
- The existing source promotes glassware for cafes, homes, florists, weddings and terrariums. It mentions hundreds of vase and drinking-glass designs and over a thousand glassware designs. No company history is supplied.

## Product provenance

The original 36 products are listed below. The 48 additional first-page products from the five category snapshots are recorded in `src/lib/legacy-products-data.json`, including source file, exact product URL, source image URL, source title, SKU, and historical price. Their local photographs are `/images/product-<WooCommerce ID>.jpg`. These archive pages expose one product thumbnail per card; responsive `srcset` entries are resolutions of the same photo, not separate gallery views. Later gallery views use genuine photos from the matching public product page when available.

Product page galleries were checked against the old public site and recorded in `src/lib/existing-product-photos.json` and `src/lib/new-product-photos.json`. Another 114 distinct photos were saved locally. Only 23 of the 84 source galleries contained at least three distinct photographs. Every presentation product shows three or four gallery views; when fewer than three source photos exist, the remaining view is an explicitly labeled CSS detail crop (`#detail` or `#detail-base`) of that product's actual photo. These views are not extra product photography and do not appear as separate files in the CMS media library. Replace them with new client photos before treating the gallery as a complete production asset set.

| SKU | Legacy product | Price (THB) | Snapshot |
| --- | --- | ---: | --- |
| 300389 | 1501B15 Lexngtion Beer 14 3/4 oz. (420 ml.) | 65 | product/drinkware.txt |
| 300648 | B00109 Drinkware Tumbler Stack 9 oz. ( 245 ml.) | 25 | product/drinkware.txt |
| 300655 | B00208 Drinkware Tumbler Long Cool 9 oz. ( 245 ml.) | 25 | product/drinkware.txt |
| 300662 | B00209 Drinkware Tumbler Rock 9 oz. ( 245 ml.) | 25 | product/drinkware.txt |
| 300730 | B00322 Drinkware Tumbler Top Drink 22oz. ( 625 ml.) | 40 | product/drinkware.txt |
| 300747 | B00406 Drinkware Tumbler San Marino 6 oz. ( 175 ml.) | 25 | product/drinkware.txt |
| 300228 | 1015A21 Bordeaux 21oz. (600ml.) | 170 | product/stemware.txt |
| 300235 | 1015C10 Cocktail 10oz. (285ml.) | 170 | product/stemware.txt |
| 300242 | 1015D22 Madison Burgundy 22 3/4 oz. (650 ml.) | 170 | product/stemware.txt |
| 300259 | 1015F07 Flute Champagne 7 1/4oz. (210ml.) | 160 | product/stemware.txt |
| 300266 | 1015G15 Water Goblet 15oz. (425ml.) | 150 | product/stemware.txt |
| 300273 | 1015M12 Margarita 12oz. (345ml.) | 170 | product/stemware.txt |
| 300297 | 1015R15 Red Wine 15oz. (425ml.) | 150 | product/stemware.txt |
| 300303 | 1015W12 White Wine 12 1/4oz. (350ml.) | 150 | product/stemware.txt |
| 061075 | Apothecary Bottle WC 1,100ml. | 120 | product/vase.txt |
| 061099 | Apothecary Bottle WC 280ml. | 75 | product/vase.txt |
| 76529 | BALL VASE 783/12 Black | 380 | product/vase.txt |
| 046546 | Ballon 64/14cm. RB | 180 | product/vase.txt |
| 046379 | Big Cone 15cm. | 180 | product/vase.txt |
| 048939 | BOHEMIA 20685/B1 | 680 | product/vase.txt |
| 054152 | BORO 1013 | 120 | product/vase.txt |
| 302048 | B02511G0000 Pop Jar (325ml.) | 55 | product/jar.txt |
| 302109 | B02517G0001 Pop Jar (500ml.) | 95 | product/jar.txt |
| 302154 | B02523G0001 Pop Jar (650ml.) | 105 | product/jar.txt |
| 302222 | B02536G0001 Pop Jar (1,000 ml.) | 125 | product/jar.txt |
| 061013 | BORO 1008WC | 120 | product/jar.txt |
| 061051 | BORO BT WC 330ml. | 180 | product/jar.txt |
| 075409 | Candle Stand 13356A-1 | 680 | product/candle-stand.txt |
| 075515 | Candle Stand 13620-1 | 150 | product/candle-stand.txt |
| 075461 | Candle Stand 14287-1 | 250 | product/candle-stand.txt |
| 075362 | Candle Stand 14737-1 | 250 | product/candle-stand.txt |
| 075324 | Candle Stand 3909-1 | 180 | product/candle-stand.txt |
| 27671 | เมสัน จาร์ 450 ฝาเงิน | 35 | Home.txt |
| 27670 | เมสัน จาร์ 450 ฝาขาว | 35 | Home.txt |
| 045525 | ขวด Mason เหลี่ยม 750ML. ฝาทอง | 75 | Home.txt |
| 047079 | ขวด Mason เหลี่ยม 300ML. Homemade ฝาทอง | 45 | Home.txt |

## Asset provenance

Images are downloaded from exact image URLs embedded in the user-supplied snapshots. Product images use a responsive 600px-or-larger candidate where available. Category imagery uses the original homepage category cards. Lifestyle assets below are the legacy site's existing editorial images; do not interpret them as photographs of the business's own premises.

- `/images/product-13181.jpg` — https://jjglass.com/wp-content/uploads/2021/09/501B15-1-600x789.jpg
- `/images/product-13214.jpg` — https://jjglass.com/wp-content/uploads/2021/09/B00109-1-600x789.jpg
- `/images/product-13215.jpg` — https://jjglass.com/wp-content/uploads/2021/09/B00208-1-600x789.jpg
- `/images/product-13216.jpg` — https://jjglass.com/wp-content/uploads/2021/09/B00209-1-600x789.jpg
- `/images/product-13222.jpg` — https://jjglass.com/wp-content/uploads/2021/09/B00322-1-600x789.jpg
- `/images/product-13223.jpg` — https://jjglass.com/wp-content/uploads/2021/09/B00406-600x789.jpg
- `/images/product-13156.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015A21-1-600x789.jpg
- `/images/product-13157.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015C10-1-600x789.jpg
- `/images/product-13158.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015D22-600x789.jpg
- `/images/product-13159.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015F07-1-600x789.jpg
- `/images/product-13160.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015G15-1-600x789.jpg
- `/images/product-13162.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015M12-1-600x789.jpg
- `/images/product-13165.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015R15-1-600x789.jpg
- `/images/product-13166.jpg` — https://jjglass.com/wp-content/uploads/2021/09/015W12-1-600x789.jpg
- `/images/product-19817.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0031_Apothecary-Bottle-WC-1100ml.-2-600x789.jpg
- `/images/product-19813.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0042_Apothecary-Bottle-WC-280ml.-3-600x789.jpg
- `/images/product-12988.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0102_BALL-VASE-783_12-Black-2-600x789.jpg
- `/images/product-19833.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0001_Ballon-64_14cm.-RB-2-600x789.jpg
- `/images/product-19834.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0004_Big-Cone-15cm.-600x789.jpg
- `/images/product-19924.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0013_BOHEMIA-20685_B1-พานมีขาคริสตัล-2-600x789.jpg
- `/images/product-19836.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0006_BORO-1013-2-600x789.jpg
- `/images/product-15270.jpg` — https://jjglass.com/wp-content/uploads/2021/09/Ocean_0040_B02511G00000-600x789.jpg
- `/images/product-15276.jpg` — https://jjglass.com/wp-content/uploads/2021/09/Ocean_0027_B02517G0001-600x789.jpg
- `/images/product-15277.jpg` — https://jjglass.com/wp-content/uploads/2021/09/Ocean_0023_B02523G0001-600x789.jpg
- `/images/product-15279.jpg` — https://jjglass.com/wp-content/uploads/2021/09/Ocean_0014_B02536G0001-600x789.jpg
- `/images/product-19707.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0083_BORO-1008WC-2-600x789.jpg
- `/images/product-19727.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0067_BORO-BT-WC-330ml.-2-600x789.jpg
- `/images/product-13134.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0037_IMG_0039-600x789.jpg
- `/images/product-13146.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0009_Candle-Stand-13620-1-2-600x789.jpg
- `/images/product-13141.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0023_Candle-Stand-14287-1-2-600x789.jpg
- `/images/product-13130.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0045_Candle-Stand-14737-1-2-600x789.jpg
- `/images/product-13126.jpg` — https://jjglass.com/wp-content/uploads/2022/01/LYNX_0053_Candle-Stand-3909-1-2-600x789.jpg
- `/images/product-27671.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0001_เมสัน-จาร์-450-ฝาเงิน-2-600x789.jpg
- `/images/product-27670.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0003_เมสัน-จาร์-450-ฝาขาว-2-600x789.jpg
- `/images/product-27567.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0001_ขวด-Mason-เหลี่ยม-750ml.-ทอง-2-600x789.jpg
- `/images/product-27557.jpg` — https://jjglass.com/wp-content/uploads/2022/01/AMORN_0011_ขวด-Mason-เหลี่ยม-300ML.-Homemade-ฝาทอง-2-600x789.jpg
- `/images/category-drinkware.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-01.jpg
- `/images/category-stemware.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-02.jpg
- `/images/category-vase.jpeg` — https://jjglass.com/wp-content/uploads/2021/03/jjGlass-Categories-SQR.005.jpeg
- `/images/category-jar.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-03.jpg
- `/images/category-tableware.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-07.jpg
- `/images/category-base.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-05.jpg
- `/images/category-cover.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-06.jpg
- `/images/category-bottle.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-04.jpg
- `/images/category-candle-stand.jpg` — https://jjglass.com/wp-content/uploads/2022/07/Untitled-3-08.jpg
- `/images/category-others.jpg` — https://jjglass.com/wp-content/uploads/2022/07/dispenser-scaled.jpg
- `/images/lifestyle-cafe.jpg` — https://jjglass.com/wp-content/uploads/2021/03/shutterstock_1842506605.jpg
- `/images/lifestyle-living.jpg` — https://jjglass.com/wp-content/uploads/2021/04/white-and-green-interior.jpg
- `/images/lifestyle-florist.jpg` — https://jjglass.com/wp-content/uploads/2021/04/shutterstock_410745061.jpg
- `/images/lifestyle-wedding.jpg` — https://jjglass.com/wp-content/uploads/2021/03/shutterstock_1913022301.jpg
- `/images/lifestyle-garden.jpg` — https://jjglass.com/wp-content/uploads/2021/04/shutterstock_1672514989.jpg
- `/images/collection-glassware.jpg` — https://jjglass.com/wp-content/uploads/2022/07/IMG_0621-scaled.jpg
- `/images/brand-lynx.jpg` — https://jjglass.com/wp-content/uploads/2021/08/รวมโลโก้ทุกแบรนด์ลูก-09-scaled.jpg
- `/images/brand-amorn.jpg` — https://jjglass.com/wp-content/uploads/2024/08/LOGO-JJGLASS-n-More_Amorn.jpg
- `/images/brand-nuk.jpg` — https://jjglass.com/wp-content/uploads/2024/08/LOGO-JJGLASS-n-More_NUK.jpg
- `/images/brand-luce.jpg` — https://jjglass.com/wp-content/uploads/2024/08/LOGO-JJGLASS-n-More_LUCE.jpg
- `/images/brand-fawles.png` — https://jjglass.com/wp-content/uploads/2024/08/1.png
- `/images/brand-stone-island.png` — https://jjglass.com/wp-content/uploads/2024/08/6.png
- `/images/brand-green-apple.png` — https://jjglass.com/wp-content/uploads/2024/08/5.png
- `/images/brand-idelita.jpg` — https://jjglass.com/wp-content/uploads/2025/04/admin-Logo-Idelita.jpg
- `/images/brand-king-crystal.png` — https://jjglass.com/wp-content/uploads/2024/08/3.png
- `/images/brand-kling-dealay.png` — https://jjglass.com/wp-content/uploads/2024/08/2.png
- `/images/catalog-polycarbonate.png` — https://jjglass.com/wp-content/uploads/2024/08/824shots_so.png
- `/images/catalog-wooden-base.png` — https://jjglass.com/wp-content/uploads/2024/10/Catalog-JJGLASS-lynx.png
- `/images/catalog-cake-cover.png` — https://jjglass.com/wp-content/uploads/2024/08/427shots_so.png
- `/images/catalog-fancy.png` — https://jjglass.com/wp-content/uploads/2024/08/502shots_so.png

## Existing catalogs

- LYNX polycarbonate: https://flipbooklets.com/pdfflipbooklets/lynx-polycarbonate#page1
- Wooden base: https://flipbooklets.com/pdfflipbooklets/wooden-base#page1
- Polycarbonate: https://flipbooklets.com/pdfflipbooklets/polycarbonate-theme-orange
- Cake cover: https://flipbooklets.com/pdfflipbooklets/cake-cover-copy#page1
- Fancy: https://flipbooklets.com/pdfflipbooklets/fancy-double-page#page1

These external links are recorded from catalog.txt and have not been relied on for additional product facts.

Additional source catalog image: `/images/catalog-additional.png` — https://jjglass.com/wp-content/uploads/2024/08/999shots_so.png

Brand spelling note: the legacy URL `kling-dealay` is misspelled; the supplied linked logo visibly reads KING DEALAY and the displayed brand list follows the logo.

## Presentation asset use and optimization

These images were referenced by the user-supplied old website snapshots and copied for this private client presentation. Their presence in the old site does not itself establish a transferable license. Confirm the client owns or has permission to reuse product photography, brand marks and editorial/stock photos before any public launch. The files retain their source attribution above. No licensing or endorsement claim is made in the interface.

The existing Next.js Sharp dependency decoded and inspected all 67 copied assets. Product images are capped at 800 pixels on the longest edge, lifestyle/category/catalog images at 1,600 pixels, and logos at 800 pixels; no upscaling is performed. JPEG assets that needed resizing use quality 92 with 4:4:4 chroma sampling; PNG assets remain lossless. Existing smaller files were left unchanged. Hero assets and the user-supplied main logo were excluded.

- Copied asset size before optimization: 21.14 MiB (22165515 bytes).
- Copied asset size after optimization: 9.28 MiB (9734153 bytes).
- Reduction: 56.1%.
- All 67 files passed a full pixel decode and metadata inspection after optimization.

| Asset | Display dimensions | Before (KiB) | After (KiB) |
| --- | --- | ---: | ---: |
| brand-amorn.jpg | 800 × 800 | 92.1 | 15.4 |
| brand-luce.jpg | 800 × 800 | 111.9 | 17.2 |
| brand-lynx.jpg | 800 × 800 | 33.8 | 13.4 |
| brand-nuk.jpg | 800 × 800 | 121.3 | 19.1 |
| catalog-additional.png | 1067 × 1600 | 714.3 | 751.4 |
| catalog-cake-cover.png | 1067 × 1600 | 571.7 | 634.8 |
| catalog-fancy.png | 1067 × 1600 | 64.9 | 77.3 |
| catalog-polycarbonate.png | 1067 × 1600 | 595.3 | 240.3 |
| catalog-wooden-base.png | 1067 × 1600 | 1225.8 | 451.6 |
| category-base.jpg | 1599 × 1600 | 3205.8 | 1152.9 |
| category-bottle.jpg | 1600 × 1599 | 2161.4 | 685.3 |
| category-candle-stand.jpg | 1600 × 1600 | 2060.3 | 614.9 |
| category-cover.jpg | 1600 × 1600 | 2141.0 | 676.4 |
| category-drinkware.jpg | 1600 × 1600 | 1417.4 | 370.3 |
| category-jar.jpg | 1600 × 1600 | 1461.0 | 400.6 |
| category-others.jpg | 1600 × 1600 | 407.2 | 427.8 |
| category-stemware.jpg | 1600 × 1599 | 963.4 | 180.5 |
| category-tableware.jpg | 1600 × 1599 | 2378.3 | 774.6 |
| collection-glassware.jpg | 1600 × 1066 | 210.9 | 243.9 |
| lifestyle-living.jpg | 1600 × 1067 | 149.7 | 199.7 |

## Centralized localization

UI messages are stored in `src/lib/messages.ts` with typed stable keys. The existing shared `copy` dictionary remains in `src/lib/i18n.ts`. Editorial stories, page introductions and catalog descriptions live in `src/lib/content.ts`; business/product translations live in `src/lib/catalog.ts`. All use the Locale derived from the central language configuration. Language switching, Open Graph locales and the mock product-name editor read that configuration. Display order can change without changing locale URL codes or the explicit Thai default.

The AST refactor preserved all 238 extracted Thai/English translation pairs, resolving one duplicate English phrase with different Thai wording using a stable key suffix. It also translated previously English-only decorative labels. Checks confirmed matching dictionary keys, interpolation, equivalent-path language switching and no remaining two-language conditional branches in components.
