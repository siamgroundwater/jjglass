# CMS presentation walkthrough

Open `/cms` for Thai or `/cms/en` for English. Use the navigation drawer to move between sections.

## Suggested five-minute demonstration

1. **Overview:** show published products and stock alerts. Open a product from the stock attention list to go straight to its stock workspace.
2. **Products:** search by SKU or either language, filter by brand/category/status/stock, and sort by price or stock. The summary cards also filter the catalog. Export the matching saved products to CSV for a spreadsheet.
3. **Edit:** edit opens in a new tab. Show the single-column form, device image preview, quantity pricing, and visible save controls. Required-field errors receive focus. New duplicate products start as drafts with zero stock.
4. **Stock management:** find a product, choose **Adjust stock**, then receive, remove, or set counted stock. Enter a quantity and reason. Stage a second product, use **Pending adjustments** to see the selection, and **Review changes** before saving the complete batch.
5. **History and recovery:** show the saved stock quantities and reasons, then the Trash page and its 30-day restoration flow.

## Useful paths

- `/cms/products` and `/cms/en/products`
- `/cms/inventory` and `/cms/en/inventory`
- `/cms/products/new` and `/cms/en/products/new`
- `/cms/trash` and `/cms/en/trash`

## Presentation boundaries

This remains a frontend presentation workspace. CMS records and uploaded previews persist in browser storage for the same origin. They are not a shared production database and do not publish changes to the static storefront catalog. The storefront checkout does not decrement CMS stock.

Stock adjustments are saved together, reject negative/fractional quantities and stale stock, and preserve historical orders. Recent stock history uses the existing activity log, which retains the latest 30 workspace activity entries; it is not a permanent inventory ledger. CSV export contains saved data, not pending adjustments.

CMS navigation, Cancel/Back buttons, and language switching ask before discarding pending product or stock edits. Closing or reloading an edited page uses the browser's own unsaved-change warning when supported. Save edits before using browser history navigation.

Use Settings → Export demo data to download the current browser snapshot before a presentation. Reset demo replaces local edits and should only be used intentionally.
