'use client';

import Link from 'next/link';
import type { Product } from '@/lib/catalog';
import { copy, Locale, money, t, storefrontPrefix } from '@/lib/i18n';
import { getLowestUnitPrice, MAX_PRODUCT_QUANTITY } from '@/lib/pricing';
import { useShop } from './ShopProvider';
import Icon from './Icon';
import s from './ProductCard.module.css';
export default function ProductCard({
  product,
  locale
}: {
  product: Product;
  locale: Locale;
}) {
  const c = copy[locale];
  const shop = useShop();
  const saved = shop.saved.includes(product.id);
  const lowestUnitPrice = getLowestUnitPrice(product);
  const atLimit = (shop.cart.find(item => item.id === product.id)?.quantity ?? 0) >= MAX_PRODUCT_QUANTITY;
  const unavailable = product.available === false;
  const needsOptions = product.hasOptions === true;
  const hasQuantityPrice = !unavailable && !needsOptions && lowestUnitPrice < product.price;
  const productUrl = `${storefrontPrefix(locale)}/products/${product.slug}`;
  const addLabel = unavailable
    ? (locale === 'th' ? 'สินค้าหมด' : 'Out of stock')
    : atLimit ? t(locale, 'Maximum quantity in bag') : t(locale, 'Buy');
  function addToBag() {
    if (!shop.ready || atLimit || unavailable || needsOptions) return;
    shop.add(product.id);
    shop.notify(c.added);
  }
  return <article className={s.card}>
    <div className={s.visual}>
      <Link href={productUrl} tabIndex={-1} aria-hidden="true">
        <img src={product.thumbnail || product.image} alt="" width="600" height="600" loading="lazy" />
      </Link>
      {product.brand && <span className={s.brand}>{product.brand}</span>}
      <button className={`${s.heart} ${saved ? s.selected : ''}`} disabled={!shop.ready} onClick={() => shop.toggleSaved(product.id)} aria-label={`${saved ? c.remove : c.save}: ${product.name[locale]}`} aria-pressed={saved}>
        <Icon name="heart" size={18} />
      </button>
    </div>
    <div className={s.info}>
      {product.sku && <span className={s.sku}>{product.sku}</span>}
      <h3>
        <Link href={productUrl}>{product.name[locale]}</Link>
      </h3>
      <div className={s.bottom}>
        <div className={s.pricing}>
          <p>{needsOptions && `${c.from} `}{money(product.price)}<span> / {t(locale, 'piece')}</span></p>
          {hasQuantityPrice && <span className={s.quantityPrice}>{locale === 'th' ? `ราคาตามจำนวน เริ่มต้น ${money(lowestUnitPrice)}` : `Quantity price from ${money(lowestUnitPrice)}`}</span>}
        </div>
        {needsOptions && !unavailable
          ? <Link className={s.buy} href={productUrl} aria-label={`${locale === 'th' ? 'ดูตัวเลือก' : 'View options'}: ${product.name[locale]}`}>{locale === 'th' ? 'ดูตัวเลือก' : 'View options'}</Link>
          : <button className={`${s.buy} ${unavailable ? s.unavailable : ''}`} onClick={addToBag} disabled={!shop.ready || atLimit || unavailable} aria-label={`${addLabel}: ${product.name[locale]}`}>
              {addLabel}
            </button>}
      </div>
    </div>
  </article>;
}
