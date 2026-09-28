'use client';

import Link from 'next/link';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { products } from '@/lib/catalog';
import { type Locale, copy, t, money, storefrontPrefix } from '@/lib/i18n';
import { getLineTotal, getNextPriceTier, getUnitPrice, MAX_PRODUCT_QUANTITY, roundCurrency } from '@/lib/pricing';
import { useShop } from './ShopProvider';
import Icon from './Icon';
import QuantityInput from './QuantityInput';
import styles from './Commerce.module.css';
type FieldName = 'name' | 'email' | 'phone' | 'address' | 'postcode';
const initialFields: Record<FieldName, string> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  postcode: ''
};
const priceCopy = {
  th: {
    each: 'ต่อชิ้น',
    quantityPrice: 'ราคาตามจำนวน',
    quantitySavings: 'ส่วนลดตามจำนวน',
    saved: 'ประหยัดแล้ว',
    nextPrice: (count: number, price: string) => `เพิ่มอีก ${count} ชิ้น รับราคา ${price} / ชิ้น`,
  },
  en: {
    each: 'each',
    quantityPrice: 'Quantity price',
    quantitySavings: 'Quantity savings',
    saved: 'You save',
    nextPrice: (count: number, price: string) => `Add ${count} more for ${price} each`,
  },
} as const;
export function Commerce({
  locale,
  mode
}: {
  locale: Locale;
  mode: 'cart' | 'checkout';
}) {
  const c = copy[locale];
  const pc = priceCopy[locale];
  const shop = useShop();
  const [fields, setFields] = useState(initialFields);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [delivery, setDelivery] = useState('delivery');
  const [completed, setCompleted] = useState<{
    count: number;
    subtotal: number;
    savings: number;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const items = shop.cart.flatMap(item => {
    const product = products.find(product => product.id === item.id);
    if (!product || product.available === false || product.hasOptions) return [];
    const unitPrice = getUnitPrice(product, item.quantity);
    const lineTotal = getLineTotal(product, item.quantity);
    const nextTier = getNextPriceTier(product, item.quantity);
    return [{
      ...item,
      product,
      unitPrice,
      lineTotal,
      savings: roundCurrency(Math.max(0, product.price * item.quantity - lineTotal)),
      nextTier,
    }];
  });
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const savings = roundCurrency(items.reduce((sum, item) => sum + item.savings, 0));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<FieldName, string>> = {};
    if (!fields.name.trim()) next.name = t(locale, "Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = t(locale, "Please enter a valid email address.");
    if (!/^[+\d\s().-]+$/.test(fields.phone.trim()) || fields.phone.replace(/\D/g, '').length < 7 || fields.phone.replace(/\D/g, '').length > 15) next.phone = t(locale, "Please enter a valid phone number.");
    if (!fields.address.trim()) next.address = t(locale, "Please enter your address.");
    if (!/^\d{5}$/.test(fields.postcode.trim())) next.postcode = t(locale, "Please enter a 5-digit postal code.");
    setErrors(next);
    const firstError = Object.keys(next)[0];
    if (firstError) {
      formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstError}"]`)?.focus();
      return;
    }
    if (!items.length) return;
    setCompleted({
      count: itemCount,
      subtotal,
      savings,
    });
    setFields(initialFields);
    shop.clear();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  const fieldLabels: Record<FieldName, string> = {
    name: t(locale, "Full name"),
    email: t(locale, "Email address"),
    phone: t(locale, "Phone number"),
    address: t(locale, "Address"),
    postcode: t(locale, "Postal code")
  };
  function field(name: FieldName, wide = false) {
    const props = {
      id: `checkout-${name}`,
      name,
      value: fields[name],
      required: true,
      'aria-invalid': !!errors[name],
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFields(previous => ({
          ...previous,
          [name]: event.target.value
        }));
        if (errors[name]) setErrors(previous => ({
          ...previous,
          [name]: undefined
        }));
      }
    };
    return <div className={`${styles.field} ${wide ? styles.wide : ''}`} key={name}>
      <label htmlFor={`checkout-${name}`}>
        {fieldLabels[name]}
        <span aria-hidden="true">*</span>
      </label>
      {name === 'address' ? <textarea {...props} rows={3} autoComplete="street-address" maxLength={500} placeholder={t(locale, "Street address, district, city, province")} /> : <input {...props} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} inputMode={name === 'postcode' ? 'numeric' : undefined} autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'postal-code'} maxLength={name === 'postcode' ? 5 : name === 'phone' ? 25 : 150} placeholder={name === 'postcode' ? '10100' : name === 'email' ? 'you@example.com' : undefined} />}
      {errors[name] && <p className={styles.error} id={`${name}-error`}>{errors[name]}</p>}
    </div>;
  }
  if (completed) return <div className={styles.page}>
    <section className={styles.complete} aria-labelledby="complete-title">
      <span className={styles.completeIcon}>
        <Icon name="check" size={31} />
      </span>
      <p className={styles.eyebrow}>{t(locale, "THANK YOU FOR TRYING IT OUT")}</p>
      <h1 id="complete-title">{t(locale, "Your order preview is ready")}</h1>
      <p>{t(locale, "This was a demonstration of the checkout experience. No order was sent, no payment was taken, and your contact details were not saved.")}</p>
      <div className={styles.completeSummary}>
        <span>{completed.count} {c.pieces}</span>
        <strong>{money(completed.subtotal)}</strong>
      </div>
      {completed.savings > 0 && <p className={styles.completedSavings}>{pc.saved} {money(completed.savings)}</p>}
      <p className={styles.completeNote}>{t(locale, "To place an actual order, please get in touch with JJGLASS.")}</p>
      <div className={styles.completeActions}>
        <Link className={styles.primary} href={`${storefrontPrefix(locale)}/contact`}>
          {c.contactTeam}
          <Icon name="arrow" size={18} />
        </Link>
        <Link className={styles.secondary} href={`${storefrontPrefix(locale)}/products`}>{c.continue}</Link>
      </div>
    </section>
  </div>;
  if (!shop.ready) return <div className={styles.page}>
    <div className={styles.loading} role="status">{t(locale, "Preparing your bag…")}</div>
  </div>;
  const hero = <>
    <nav className={styles.breadcrumb} aria-label={t(locale, "Breadcrumb")}>
      <Link href={storefrontPrefix(locale) || '/'}>{c.home}</Link>
      <span>/</span>
      {mode === 'checkout' ? <>
        <Link href={`${storefrontPrefix(locale)}/cart`}>{c.cart}</Link>
        <span>/</span>
        <span>{t(locale, "Checkout")}</span>
      </> : <span>{c.cart}</span>}
    </nav>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>{mode === 'cart' ? t(locale, "Review Before Checkout") : t(locale, "GOOD THINGS, BROUGHT TOGETHER")}</p>
      <h1>{mode === 'cart' ? t(locale, "Your Shopping Cart") : t(locale, "Almost ready for your table")}</h1>
      <p>{mode === 'cart' ? <>
        {t(locale, "Review your items, quantities, and total")}
        <br />
        {t(locale, "before proceeding to checkout.")}
      </> : t(locale, "A preview of the JJGLASS checkout experience.")}</p>
    </header>
  </>;
  if (!items.length) return <div className={styles.page}>
    {hero}
    <section className={styles.empty}>
      <span className={styles.emptyIcon}>
        <Icon name="bag" size={40} />
      </span>
      <p className={styles.eyebrow}>{t(locale, "YOUR EVERYDAY, BEAUTIFULLY SERVED")}</p>
      <h2>{c.emptyCart}</h2>
      <p>{t(locale, "Discover your next favourite glass and pieces that make every meal feel special.")}</p>
      <Link className={styles.primary} href={`${storefrontPrefix(locale)}/products`}>
        {c.explore}
        <Icon name="arrow" size={18} />
      </Link>
    </section>
  </div>;
  return <div className={styles.page}>
    {hero}
    <div className={styles.layout}>
      {mode === 'cart' ? <section aria-label={c.cart} className={styles.cartItems}>
        <div className={styles.tableHeader}>
          <span>{c.products}</span>
          <span>{c.quantity}</span>
          <span>{c.total}</span>
        </div>
        {items.map(({
          product,
          quantity,
          unitPrice,
          lineTotal,
          savings: lineSavings,
          nextTier,
        }) => <article className={styles.cartItem} key={product.id}>
          <Link className={styles.itemImage} href={`${storefrontPrefix(locale)}/products/${product.slug}`}>
            <img src={product.thumbnail || product.image} alt={product.name[locale]} width={160} height={160} />
          </Link>
          <div className={styles.itemInfo}>
            {product.brand && <span>{product.brand}</span>}
            <Link href={`${storefrontPrefix(locale)}/products/${product.slug}`}>
              <h2>{product.name[locale]}</h2>
            </Link>
            {product.sku && <p>{c.sku} {product.sku}</p>}
            <div className={styles.itemPrice}>
              <strong>{money(unitPrice)} / {pc.each}</strong>
              {lineSavings > 0 && <><del>{money(product.price)}</del><span>{pc.quantityPrice}</span></>}
              {nextTier && <small>{pc.nextPrice(nextTier.minQuantity - quantity, money(nextTier.unitPrice))}</small>}
            </div>
            <button className={styles.remove} onClick={() => shop.remove(product.id)} aria-label={`${c.remove}: ${product.name[locale]}`}>{c.remove}</button>
          </div>
          <div className={styles.quantity} role="group" aria-label={`${c.quantity}: ${product.name[locale]}`}>
            <button onClick={() => shop.setQuantity(product.id, quantity - 1)} disabled={quantity <= 1} aria-label={`${t(locale, "Decrease quantity")}: ${product.name[locale]}`}>
              <Icon name="minus" size={14} />
            </button>
            <QuantityInput value={quantity} onChange={value => shop.setQuantity(product.id, value)} label={`${c.quantity}: ${product.name[locale]}`} />
            <button onClick={() => shop.setQuantity(product.id, quantity + 1)} disabled={quantity >= MAX_PRODUCT_QUANTITY} aria-label={`${t(locale, "Increase quantity")}: ${product.name[locale]}`}>
              <Icon name="plus" size={14} />
            </button>
          </div>
          <strong className={styles.lineTotal}>{money(lineTotal)}</strong>
        </article>)}
        <Link className={styles.continue} href={`${storefrontPrefix(locale)}/products`}>
          <Icon name="arrow" size={17} />
          {c.continue}
        </Link>
      </section> : <form className={styles.checkoutForm} id="demo-checkout" ref={formRef} onSubmit={submit} noValidate>
        <div className={styles.demoNotice}>
          <Icon name="shield" size={21} />
          <p>{t(locale, "Demo mode — use sample details to try it. Form information is never sent or saved.")}</p>
        </div>
        <section className={styles.formSection}>
          <h2>
            <span>01</span>
            {t(locale, "Your details")}
          </h2>
          <div className={styles.fields}>{field('name', true)}{field('email')}{field('phone')}</div>
        </section>
        <section className={styles.formSection}>
          <h2>
            <span>02</span>
            {t(locale, "Address & delivery")}
          </h2>
          <div className={styles.fields}>{field('address', true)}{field('postcode')}</div>
          <fieldset className={styles.options}>
            <legend>{t(locale, "Delivery preference (demo)")}</legend>
            <label className={delivery === 'delivery' ? styles.selectedOption : ''}>
              <input type="radio" name="delivery" value="delivery" checked={delivery === 'delivery'} onChange={event => setDelivery(event.target.value)} />
              <Icon name="truck" size={22} />
              <span>
                <strong>{t(locale, "Delivery to your address")}</strong>
                <small>{c.shippingNote}</small>
              </span>
            </label>
            <label className={delivery === 'pickup' ? styles.selectedOption : ''}>
              <input type="radio" name="delivery" value="pickup" checked={delivery === 'pickup'} onChange={event => setDelivery(event.target.value)} />
              <Icon name="pin" size={22} />
              <span>
                <strong>{t(locale, "Arrange collection")}</strong>
                <small>{t(locale, "Contact our team to confirm location and timing")}</small>
              </span>
            </label>
          </fieldset>
        </section>
        <section className={styles.formSection}>
          <h2><span>03</span>{t(locale, "Next steps")}</h2>
          <div className={styles.nextStep}>
            <Icon name="shield" size={22} />
            <span><strong>{t(locale, "Discuss payment with our team")}</strong><small>{t(locale, "No payments are collected on this demonstration site")}</small></span>
          </div>
        </section>
      </form>}
      <aside className={styles.summary}>
        <h2>{t(locale, "Your order summary")}</h2>
        {mode === 'checkout' && <div className={styles.miniItems}>{items.map(({
            product,
            quantity,
            unitPrice,
            lineTotal,
          }) => <div className={styles.miniItem} key={product.id}>
            <div>
              <img src={product.thumbnail || product.image} alt={product.name[locale]} width={60} height={60} />
              <span>{quantity}</span>
            </div>
            <p>{product.name[locale]}<small>{money(unitPrice)} / {pc.each}</small></p>
            <strong>{money(lineTotal)}</strong>
          </div>)}</div>}
        <div className={styles.summaryLine}>
          <span>{c.subtotal} ({itemCount} {c.pieces})</span>
          <strong>{money(subtotal)}</strong>
        </div>
        {savings > 0 && <div className={styles.savingsLine}><span>{pc.quantitySavings}</span><strong>−{money(savings)}</strong></div>}
        <div className={`${styles.summaryLine} ${styles.shipping}`}>
          <span>{c.shipping}</span>
          <span>{delivery === 'pickup' && mode === 'checkout' ? t(locale, "Arrange with our team") : t(locale, "Confirmed by our team")}</span>
        </div>
        <div className={styles.total}>
          <span>{c.total}</span>
          <strong>{money(subtotal)}</strong>
        </div>
        <p className={styles.totalNote}>{t(locale, "Product total excludes delivery costs.")}</p>
        {mode === 'cart' ? <Link className={styles.primary} href={`${storefrontPrefix(locale)}/checkout`}>
          {c.checkout}
          <Icon name="arrow" size={18} />
        </Link> : <button form="demo-checkout" type="submit" className={styles.primary}>
          {t(locale, "Complete demo checkout")}
          <Icon name="arrow" size={18} />
        </button>}
        <p className={styles.summaryDemo}>
          <Icon name="shield" size={15} />
          {t(locale, "For demonstration only. No actual payment.")}
        </p>
      </aside>
    </div>
    <p className={styles.sourceNote}>{c.demoPrices}</p>
  </div>;
}
