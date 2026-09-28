export type PriceTier = {
  minQuantity: number;
  unitPrice: number;
};

export type PricedProduct = {
  price: number;
  priceTiers: readonly PriceTier[];
};

export type PriceBand = PriceTier & {
  maxQuantity?: number;
};

export const MAX_PRODUCT_QUANTITY = 9999;

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function requireQuantity(quantity: number): number {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_PRODUCT_QUANTITY) {
    throw new RangeError(`Quantity must be a whole number from 1 to ${MAX_PRODUCT_QUANTITY}.`);
  }
  return quantity;
}

function orderedTiers(product: PricedProduct): PriceTier[] {
  return [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
}

export function getUnitPrice(product: PricedProduct, quantity: number): number {
  const safeQuantity = requireQuantity(quantity);
  let unitPrice = product.price;
  for (const tier of orderedTiers(product)) {
    if (tier.minQuantity > safeQuantity) break;
    unitPrice = tier.unitPrice;
  }
  return roundCurrency(unitPrice);
}

export function getLineTotal(product: PricedProduct, quantity: number): number {
  return roundCurrency(getUnitPrice(product, quantity) * requireQuantity(quantity));
}

export function getLowestUnitPrice(product: PricedProduct): number {
  return roundCurrency(Math.min(product.price, ...product.priceTiers.map(tier => tier.unitPrice)));
}

export function getNextPriceTier(product: PricedProduct, quantity: number): PriceTier | undefined {
  const safeQuantity = requireQuantity(quantity);
  return orderedTiers(product).find(tier => tier.minQuantity > safeQuantity);
}

export function getPriceBands(product: PricedProduct): PriceBand[] {
  const tiers = orderedTiers(product);
  const starts: PriceTier[] = [{ minQuantity: 1, unitPrice: product.price }, ...tiers];
  return starts.map((tier, index) => ({
    ...tier,
    ...(starts[index + 1] ? { maxQuantity: starts[index + 1].minQuantity - 1 } : {})
  }));
}

// Presentation defaults. Every product can be given its own thresholds and prices in the CMS.
export function createDemoPriceTiers(basePrice: number): PriceTier[] {
  const candidates = [
    { minQuantity: 6, unitPrice: roundCurrency(basePrice * 0.95) },
    { minQuantity: 12, unitPrice: roundCurrency(basePrice * 0.9) }
  ];
  const tiers: PriceTier[] = [];
  let previousPrice = basePrice;
  for (const tier of candidates) {
    if (tier.unitPrice <= 0 || tier.unitPrice >= previousPrice) continue;
    tiers.push(tier);
    previousPrice = tier.unitPrice;
  }
  return tiers;
}
