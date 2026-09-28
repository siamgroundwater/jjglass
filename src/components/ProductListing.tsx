'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories, products, brands } from '@/lib/catalog';
import { Locale, copy, t, storefrontPrefix } from '@/lib/i18n';
import { useShop } from './ShopProvider';
import ProductCard from './ProductCard';
import Icon from './Icon';
import s from './ProductListing.module.css';
export default function ProductListing({
  locale,
  wishlist = false
}: {
  locale: Locale;
  wishlist?: boolean;
}) {
  const c = copy[locale],
    router = useRouter(),
    query = useSearchParams(),
    shop = useShop();
  const category = query.get('category') || '',
    brand = query.get('brand') || '',
    search = query.get('q') || '',
    sort = query.get('sort') || 'recommended';
  const rawPage = Number(query.get('page') || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedCategory = categories.find(cat => cat.id === category);
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(query.toString());
    if (value) params.set(key, value);else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`${storefrontPrefix(locale)}/${wishlist ? 'wishlist' : 'products'}${params.size ? '?' + params.toString() : ''}`, {
      scroll: false
    });
  };
  const filtered = useMemo(() => {
    const text = search.toLocaleLowerCase().trim();
    let list = products.filter(p => (!wishlist || shop.saved.includes(p.id)) && (!category || p.category === category) && (!brand || p.brand.toLowerCase() === brand.toLowerCase()) && (!text || [...Object.values(p.name), p.sku, p.brand, ...Object.values(p.description)].join(' ').toLocaleLowerCase().includes(text)));
    if (sort === 'low') list = list.toSorted((a, b) => a.price - b.price);
    if (sort === 'high') list = list.toSorted((a, b) => b.price - a.price);
    if (sort === 'name') list = list.toSorted((a, b) => a.name[locale].localeCompare(b.name[locale]));
    return list;
  }, [search, category, brand, sort, wishlist, shop.saved, locale]);
  const totalPages = Math.ceil(filtered.length / 12),
    currentPage = Math.min(page, totalPages || 1),
    visible = filtered.slice((currentPage - 1) * 12, currentPage * 12);
  const reset = () => {
    router.replace(`${storefrontPrefix(locale)}/${wishlist ? 'wishlist' : 'products'}`, {
      scroll: false
    });
  };
  return <>
    <section className={s.banner}>
      <div className={s.bannerCopy}>
        <div className={s.breadcrumb}>
          <Link href={storefrontPrefix(locale) || '/'}>{c.home}</Link>
          <span>/</span>
          {wishlist ? c.saved : c.products}
        </div>
        <p className={s.eyebrow}>{wishlist ? t(locale, "Save Your Favorites") : t(locale, "Glassware for Every Use")}</p>
        <h1>{wishlist ? t(locale, "Keep the Products You Like Here") : selectedCategory ? selectedCategory.name[locale] : t(locale, "Find the Right Glassware for You")}</h1>
        <p>{wishlist ? <>
          {t(locale, "Tap the heart icon to save products")}
          <br />
          {t(locale, "and easily come back to them later.")}
        </> : <>
          {t(locale, "Explore a variety of styles, brands, and collections")}
          <br />
          {t(locale, "for homes, cafés, restaurants, and businesses.")}
        </>}</p>
      </div>
      <img src={selectedCategory?.image || '/images/hero.webp'} alt="" width="500" height="350" />
    </section>
    <div className={s.layout}>
      <aside className={`${s.sidebar} ${filtersOpen ? s.open : ''}`}>
        <div className={s.filterTitle}>
          <h2>{c.category}</h2>
          <button className={s.filterClose} aria-label={c.close} onClick={() => setFiltersOpen(false)}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <button className={!category ? s.active : ''} onClick={() => {
          update('category', '');
          setFiltersOpen(false);
        }}>
          {c.all}
          <span>{products.length}</span>
        </button>
        {categories.map(cat => <button key={cat.id} className={category === cat.id ? s.active : ''} onClick={() => {
          update('category', cat.id);
          setFiltersOpen(false);
        }}>
          {cat.name[locale]}
          <span>{products.filter(p => p.category === cat.id).length || '—'}</span>
        </button>)}
        <div className={s.brandFilter}>
          <h2>{c.brand}</h2>
          <label>
            <input type="radio" name="brand" checked={!brand} onChange={() => update('brand', '')} />
            {t(locale, "All brands")}
          </label>
          {brands.map(b => <label key={b}>
            <input type="radio" name="brand" checked={brand.toLowerCase() === b.toLowerCase()} onChange={() => update('brand', b)} />
            {b}
          </label>)}
        </div>
        <div className={s.help}>
          <Icon name="leaf" size={28} />
          <h3>{t(locale, "Let’s find the right fit.")}</h3>
          <p>{t(locale, "Our team can help you find glassware for your home or business.")}</p>
          <Link href={`${storefrontPrefix(locale)}/contact`}>
            {c.contactTeam}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </aside>
      <section className={s.catalog}>
        <div className={s.toolbar}>
          <form key={search} onSubmit={e => {
            e.preventDefault();
            update('q', String(new FormData(e.currentTarget).get('q') || ''));
          }} className={s.search}>
            <Icon name="search" size={20} />
            <input name="q" defaultValue={search} aria-label={c.search} placeholder={c.searchHint} />
            <button aria-label={c.search} type="submit">
              <Icon name="arrow" size={19} />
            </button>
          </form>
          <button className={s.mobileFilter} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
            <Icon name="filter" size={20} />
            {c.filter}
          </button>
          <label className={s.sort}>
            <span>{c.sort}</span>
            <select value={sort} onChange={e => update('sort', e.target.value)} aria-label={c.sort}>
              <option value="recommended">{c.recommended}</option>
              <option value="low">{c.lowPrice}</option>
              <option value="high">{c.highPrice}</option>
              <option value="name">{c.nameSort}</option>
            </select>
          </label>
        </div>
        <div className={s.resultBar}>
          <p>{filtered.length} {c.results}{visible.length > 0 && <span> · {(currentPage - 1) * 12 + 1}–{Math.min(currentPage * 12, filtered.length)}</span>}</p>
          {(category || brand || search) && <button onClick={reset}>
            {c.clear}
            <Icon name="close" size={13} />
          </button>}
        </div>
        {visible.length > 0 ? <>
          <div className={s.productGrid}>{visible.map(p => <ProductCard key={p.id} product={p} locale={locale} />)}</div>
          {totalPages > 1 && <nav className={s.pagination} aria-label={t(locale, "Product pages")}>
            <button aria-label={c.previous} disabled={currentPage === 1} onClick={() => update('page', String(currentPage - 1))}>
              <Icon name="chevron" size={16} style={{
                transform: 'rotate(180deg)'
              }} />
            </button>
            {Array.from({
              length: totalPages
            }, (_, i) => <button key={i} className={currentPage === i + 1 ? s.current : ''} aria-current={currentPage === i + 1 ? 'page' : undefined} onClick={() => {
              update('page', String(i + 1));
              document.getElementById('main')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}>{i + 1}</button>)}
            <button aria-label={c.next} disabled={currentPage === totalPages} onClick={() => update('page', String(currentPage + 1))}>
              <Icon name="chevron" size={16} />
            </button>
          </nav>}
        </> : <div className={s.empty}>
          {selectedCategory && <img src={selectedCategory.image} width="220" height="220" alt={selectedCategory.name[locale]} />}
          <Icon name={wishlist ? 'heart' : 'search'} size={36} />
          <h2>{wishlist && !shop.saved.length ? c.emptySaved : selectedCategory && !products.some(p => p.category === category) ? t(locale, "There’s more to discover in store.") : c.empty}</h2>
          <p>{wishlist && !shop.saved.length ? c.emptySavedHint : selectedCategory && !products.some(p => p.category === category) ? t(locale, "Ask our team about this collection and current pricing.") : c.emptyHint}</p>
          {category && <Link href={`${storefrontPrefix(locale)}/contact`}>
            {c.contactTeam}
            <Icon name="arrow" size={18} />
          </Link>}
          {wishlist ? <Link href={`${storefrontPrefix(locale)}/products`}>
            {c.explore}
            <Icon name="arrow" size={18} />
          </Link> : <button onClick={reset}>{c.clear}</button>}
        </div>}
        <p className={s.note}>{c.demoPrices}</p>
      </section>
    </div>
  </>;
}
