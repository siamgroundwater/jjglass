'use client';

import Link from 'next/link';
import { useState } from 'react';
import { type Product, products } from '@/lib/catalog';
import { type Locale, copy, t, money, storefrontPrefix } from '@/lib/i18n';
import { getLineTotal, getLowestUnitPrice, getNextPriceTier, getPriceBands, getUnitPrice, MAX_PRODUCT_QUANTITY, roundCurrency } from '@/lib/pricing';
import { useShop } from './ShopProvider';
import Icon from './Icon';
import QuantityInput from './QuantityInput';
import styles from './ProductDetail.module.css';
export function ProductDetail({
  locale,
  product
}: {
  locale: Locale;
  product: Product;
}) {
  const c = copy[locale];
  const shop = useShop();
  const [quantity, setQuantity] = useState(1);
  const cartQuantity = shop.cart.find(item => item.id === product.id)?.quantity ?? 0;
  const availableQuantity = MAX_PRODUCT_QUANTITY - cartQuantity;
  const selectedQuantity = Math.min(quantity, Math.max(1, availableQuantity));
  const pricingQuantity = Math.min(MAX_PRODUCT_QUANTITY, Math.max(1, cartQuantity + (availableQuantity > 0 ? selectedQuantity : 0)));
  const unitPrice = getUnitPrice(product, pricingQuantity);
  const lineTotal = getLineTotal(product, pricingQuantity);
  const savings = roundCurrency(Math.max(0, product.price * pricingQuantity - lineTotal));
  const nextTier = getNextPriceTier(product, pricingQuantity);
  const priceBands = getPriceBands(product);
  const priceCopy = locale === 'th' ? {
    each: 'ต่อชิ้น', quantityPricing: 'ราคาตามจำนวน', quantityHint: 'ยิ่งเลือกหลายชิ้น ราคาต่อชิ้นยิ่งคุ้ม', pieces: 'ชิ้น',
    currentTotal: cartQuantity ? 'ยอดสินค้าในตะกร้าหลังเพิ่ม' : 'ยอดสินค้าที่เลือก', saved: 'ประหยัด',
    next: (count: number, price: string) => `เพิ่มอีก ${count} ชิ้น รับราคา ${price} ต่อชิ้น`,
  } : {
    each: 'each', quantityPricing: 'Quantity pricing', quantityHint: 'The unit price drops as you add more of the same product.', pieces: 'pieces',
    currentTotal: cartQuantity ? 'Bag total after adding' : 'Selected product total', saved: 'You save',
    next: (count: number, price: string) => `Add ${count} more for ${price} each`,
  };
  const saved = shop.saved.includes(product.id);
  const related = [...products.filter(item => item.id !== product.id && item.category === product.category), ...products.filter(item => item.id !== product.id && item.category !== product.category)].slice(0, 4);
  return <div className={styles.page}>
    <nav className={styles.breadcrumb} aria-label={t(locale, "Breadcrumb")}>
      <Link href={storefrontPrefix(locale) || '/'}>{c.home}</Link>
      <span>/</span>
      <Link href={`${storefrontPrefix(locale)}/products`}>{c.products}</Link>
      <span>/</span>
      <span>{product.name[locale]}</span>
    </nav>
    <section className={styles.product}>
      <div className={styles.visual}>
        <span className={styles.imageBrand}>{product.brand}</span>
        <img src={product.image} alt={product.name[locale]} width={800} height={800} fetchPriority="high" />
        <span className={styles.imageCaption}>{t(locale, "Made for your everyday moments")}</span>
      </div>
      <div className={styles.info}>
        <span className={styles.eyebrow}>{product.brand}</span>
        <h1>{product.name[locale]}</h1>
        <p className={styles.code}>{c.sku} {product.sku}</p>
        <div className={styles.priceSummary} aria-live="polite">
          <p className={styles.price}>{money(unitPrice)} <span>/ {priceCopy.each}</span></p>
          {unitPrice < product.price && <del>{money(product.price)}</del>}
          <p className={styles.selectionTotal}><span>{priceCopy.currentTotal} · {pricingQuantity} {priceCopy.pieces}</span><strong>{money(lineTotal)}</strong></p>
          {savings > 0 && <p className={styles.savings}>{priceCopy.saved} {money(savings)}</p>}
        </div>
        <p className={styles.description}>{product.description[locale]}</p>
        <div className={styles.availability}>
          <span />
          {c.availability}
        </div>
        <section className={styles.tierPricing} aria-labelledby="quantity-pricing-title">
          <div className={styles.tierHeading}><div><h2 id="quantity-pricing-title">{priceCopy.quantityPricing}</h2><p>{priceCopy.quantityHint}</p></div>{nextTier && <span>{priceCopy.next(nextTier.minQuantity - pricingQuantity, money(nextTier.unitPrice))}</span>}</div>
          <div className={styles.tierGrid}>{priceBands.map(band => {
            const active = pricingQuantity >= band.minQuantity && (band.maxQuantity === undefined || pricingQuantity <= band.maxQuantity);
            return <div className={active ? styles.activeTier : ''} key={band.minQuantity} aria-current={active ? 'true' : undefined}>
              <span>{band.maxQuantity ? `${band.minQuantity}–${band.maxQuantity}` : `${band.minQuantity}+`} {priceCopy.pieces}</span>
              <strong>{money(band.unitPrice)}</strong>
              <small>/ {priceCopy.each}</small>
            </div>;
          })}</div>
        </section>
        <div className={styles.buyRow}>
          <div className={styles.quantity} role="group" aria-label={c.quantity}>
            <button aria-label={t(locale, "Decrease quantity")} disabled={selectedQuantity <= 1} onClick={() => setQuantity(selectedQuantity - 1)}>
              <Icon name="minus" size={16} />
            </button>
            <QuantityInput value={selectedQuantity} onChange={setQuantity} label={c.quantity} max={Math.max(1, availableQuantity)} disabled={!shop.ready || availableQuantity === 0} />
            <button aria-label={t(locale, "Increase quantity")} disabled={selectedQuantity >= availableQuantity} onClick={() => setQuantity(selectedQuantity + 1)}>
              <Icon name="plus" size={16} />
            </button>
          </div>
          <button className={styles.add} disabled={!shop.ready || availableQuantity === 0} onClick={() => {
            shop.add(product.id, selectedQuantity);
            shop.notify(c.added);
          }}>
            <Icon name="bag" size={19} />
            {availableQuantity === 0 ? t(locale, "Maximum quantity in bag") : c.add}
          </button>
          <button className={`${styles.save} ${saved ? styles.saved : ''}`} aria-label={saved ? t(locale, "Remove from wishlist") : c.save} aria-pressed={saved} disabled={!shop.ready} onClick={() => {
            shop.toggleSaved(product.id);
            shop.notify(saved ? t(locale, "Removed from wishlist") : t(locale, "Saved to your wishlist"));
          }}>
            <Icon name="heart" size={21} />
          </button>
        </div>
        <p className={styles.priceNote}>{c.demoPrices}</p>
        <details className={styles.detail} open>
          <summary>
            {c.details}
            <Icon name="plus" size={16} />
          </summary>
          <dl>
            <div>
              <dt>{c.sku}</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>{c.brand}</dt>
              <dd>{product.brand}</dd>
            </div>
            {product.capacity && <div>
              <dt>{t(locale, "Capacity")}</dt>
              <dd>{product.capacity}</dd>
            </div>}
          </dl>
        </details>
      </div>
    </section>
    <section className={styles.related}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>{t(locale, "COMPLETE YOUR COLLECTION")}</p>
          <h2>{t(locale, "A few more things to love")}</h2>
        </div>
        <Link href={`${storefrontPrefix(locale)}/products`}>
          {c.viewAll}
          <Icon name="arrow" size={19} />
        </Link>
      </div>
      <div className={styles.relatedGrid}>{related.map(item => <Link className={styles.relatedCard} key={item.id} href={`${storefrontPrefix(locale)}/products/${item.slug}`}>
          <div>
            <img src={item.image} alt={item.name[locale]} width={400} height={400} loading="lazy" />
          </div>
          <span>{item.brand}</span>
          <h3>{item.name[locale]}</h3>
          <p>{money(item.price)}{getLowestUnitPrice(item) < item.price && <span>{locale === 'th' ? `ราคาตามจำนวน ${money(getLowestUnitPrice(item))}` : `Quantity price ${money(getLowestUnitPrice(item))}`}</span>}</p>
        </Link>)}</div>
    </section>
  </div>;
}
