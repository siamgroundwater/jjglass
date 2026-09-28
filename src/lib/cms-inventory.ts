import type { CmsData, CmsProduct } from './cms-types';

export type StockMode = 'receive' | 'remove' | 'count';
export type StockChange = { id: string; previous: number; mode: StockMode; amount: string; reason: string };
export function stockResult(change: StockChange): number | null {
  if (!['receive', 'remove', 'count'].includes(change.mode) || !Number.isSafeInteger(change.previous) || change.previous < 0) return null;
  if (!change.amount.trim()) return null;
  const amount = Number(change.amount);
  if (!Number.isSafeInteger(amount) || amount < (change.mode === 'count' ? 0 : 1)) return null;
  const next = change.mode === 'count' ? amount : change.previous + (change.mode === 'receive' ? amount : -amount);
  return Number.isSafeInteger(next) && next >= 0 ? next : null;
}

// Validate the complete batch before changing any record.
export function applyStockChanges(data: CmsData, changes: StockChange[]): CmsData | null {
  if (!changes.length || new Set(changes.map(item => item.id)).size !== changes.length) return null;
  const quantities = new Map<string, number>();
  for (const change of changes) {
    const product = data.products.find(item => item.id === change.id);
    const next = stockResult(change);
    if (!product || product.stock !== change.previous || next === null || next === product.stock || !change.reason.trim() || change.reason.length > 200) return null;
    quantities.set(change.id, next);
  }
  return { ...data, products: data.products.map(product => quantities.has(product.id) ? { ...product, stock: quantities.get(product.id)! } : product) };
}

export function matchesStock(product: CmsProduct, filter: string, threshold: number): boolean {
  if (filter === 'attention') return product.status === 'published' && product.stock <= threshold;
  if (filter === 'out') return product.stock === 0;
  if (filter === 'low') return product.stock > 0 && product.stock <= threshold;
  if (filter === 'healthy') return product.stock > threshold;
  return true;
}

export function csvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function productCsv(products: CmsProduct[], data: CmsData): string {
  const rows = [['SKU', 'Name (TH)', 'Name (EN)', 'Brand', 'Category (TH)', 'Category (EN)', 'Price (THB)', 'Stock', 'Status', 'Quantity prices'],
    ...products.map(product => {
      const category = data.categories.find(item => item.id === product.category);
      return [product.sku, product.name.th, product.name.en, product.brand, category?.name.th || '', category?.name.en || '', String(product.price), String(product.stock), product.status, product.priceTiers.map(tier => `${tier.minQuantity}+: ${tier.unitPrice}`).join('; ')];
    })];
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadProductCsv(products: CmsProduct[], data: CmsData) {
  const url = URL.createObjectURL(new Blob([productCsv(products, data)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `jjglass-products-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
