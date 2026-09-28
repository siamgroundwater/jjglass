'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cmsCopy } from '@/lib/cms-copy';
import { cmsInventoryCopy } from '@/lib/cms-inventory-copy';
import { applyStockChanges, downloadProductCsv, matchesStock, stockResult, type StockChange, type StockMode } from '@/lib/cms-inventory';
import { cmsRoutePath } from '@/lib/cms-routing';
import { cmsId, type CmsPanelProps } from '@/lib/cms-types';
import { CmsBadge, CmsEmpty, CmsPagination } from './CmsUI';
import Icon from '../Icon';
import u from './CmsUI.module.css';
import s from './CmsInventory.module.css';

export default function CmsInventory({ locale, data, save, setDirty }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const t = cmsInventoryCopy[locale];
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [filter, setFilter] = useState(params.get('stock') === 'attention' ? 'attention' : 'all');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('stockAsc');
  const [page, setPage] = useState(1);
  const [changes, setChanges] = useState<StockChange[]>([]);
  const [review, setReview] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState('');
  const reviewRef = useRef<HTMLElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const threshold = data.settings.lowStockThreshold;
  const query = search.trim().toLocaleLowerCase();
  const filtered = data.products.filter(product => (!query || [product.sku, product.name.th, product.name.en, product.brand].some(value => value.toLocaleLowerCase().includes(query))) && (brand === 'all' || product.brand === brand) && (filter === 'pending' ? changes.some(change => change.id === product.id) : matchesStock(product, filter, threshold))).sort((a, b) => sort === 'name' ? a.name[locale].localeCompare(b.name[locale], locale) : sort === 'stockDesc' ? b.stock - a.stock : a.stock - b.stock);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * 12, activePage * 12);
  const invalid = changes.some(change => stockResult(change) === null || stockResult(change) === change.previous || !change.reason.trim());
  const conflict = changes.some(change => data.products.find(product => product.id === change.id)?.stock !== change.previous);

  useEffect(() => { setDirty?.(changes.length > 0); return () => setDirty?.(false); }, [changes.length, setDirty]);
  useEffect(() => { if (review) { reviewRef.current?.focus(); reviewRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }, [review]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  function update(id: string, patch: Partial<StockChange>) {
    setChanges(current => current.map(change => change.id === id ? { ...change, ...patch } : change));
    setError('');
  }
  function resetFilters() { setSearch(''); setFilter('all'); setBrand('all'); setPage(1); }
  function saveChanges() {
    const next = applyStockChanges(data, changes);
    if (!next) { setError(conflict ? t.conflict : t.invalid); return; }
    const date = new Date().toISOString();
    const entries = changes.map(change => {
      const product = data.products.find(item => item.id === change.id)!;
      const detail = `${product.sku}: ${change.previous} → ${stockResult(change)} · ${change.reason.trim()}`;
      return { id: cmsId('stock'), date, text: { th: `${cmsInventoryCopy.th.saved} · ${detail}`, en: `${cmsInventoryCopy.en.saved} · ${detail}` } };
    });
    if (save({ ...next, activity: [...entries, ...next.activity] }, { th: `${cmsInventoryCopy.th.saved} · ${changes.length} รายการ`, en: `${cmsInventoryCopy.en.saved} · ${changes.length} products` })) {
      setChanges([]); setReview(false); setError('');
    }
  }

  return <div className={s.page}>
    <div className={s.heading}><div><h1>{t.title}</h1><p>{t.intro}</p></div><button className={u.secondary} disabled={!filtered.length} title={t.exportHint} onClick={() => downloadProductCsv(filtered, data)}>{t.export}</button></div>
    <p className={s.guide}>{t.help}</p>
    <div className={s.stats}>{(['all', 'attention', 'out', 'low'] as const).map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? s.activeStat : ''} onClick={() => { setFilter(value); setPage(1); }}><strong>{data.products.filter(product => matchesStock(product, value, threshold)).length}</strong><span>{t[value]}</span></button>)}</div>
    <p className={s.hint}>{t.threshold.replace('{count}', String(threshold))}</p>
    {review ? <section ref={reviewRef} tabIndex={-1} className={s.review} aria-label={t.review}>
      <h2>{t.review}</h2><p className={u.muted}>{t.reviewHint}</p>
      <div className={s.reviewList}>{changes.map(change => {
        const product = data.products.find(item => item.id === change.id);
        return <article key={change.id}><div><strong>{product?.name[locale] || change.id}</strong><p>{product?.sku}</p><p>{change.reason}</p></div><div><span>{t.current}: {change.previous}</span><strong>{t.after}: {stockResult(change) ?? '—'}</strong></div><button className={u.textButton} onClick={() => { setChanges(current => current.filter(item => item.id !== change.id)); setReview(false); }}>{c.remove}</button></article>;
      })}</div>
      {conflict && <p className={u.error} role="alert">{t.conflict}</p>}
      <div className={u.actions}><button className={u.secondary} onClick={() => setReview(false)}>{t.cancelReview}</button><button className={u.primary} disabled={!changes.length || invalid || conflict} onClick={saveChanges}>{t.save} ({changes.length})</button></div>
    </section> : <section className={u.panel} aria-label={t.inventory}>
      <div className={u.toolbar}>
        <label className={u.search}><Icon name="search" size={19} /><input type="search" value={search} aria-label={t.search} placeholder={t.search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
        <select className={u.select} aria-label={t.inventory} value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}>{(['all', 'attention', 'out', 'low', 'healthy', 'pending'] as const).map(value => <option key={value} value={value}>{t[value]}</option>)}</select>
        <select className={u.select} aria-label={t.allBrands} value={brand} onChange={event => { setBrand(event.target.value); setPage(1); }}><option value="all">{t.allBrands}</option>{data.brands.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
        <select className={u.select} aria-label={t.sort} value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}>{(['stockAsc', 'stockDesc', 'name'] as const).map(value => <option key={value} value={value}>{t[value]}</option>)}</select>
        {(search || filter !== 'all' || brand !== 'all') && <button className={u.secondary} onClick={resetFilters}>{c.clear}</button>}
      </div>
      <p className={s.resultCount} role="status">{t.results.replace('{count}', String(filtered.length))}</p>
      {visible.length ? <div className={u.recordGrid}>{visible.map(product => {
        const change = changes.find(item => item.id === product.id);
        const result = change ? stockResult(change) : null;
        return <article className={`${u.recordCard} ${change ? s.editing : ''}`} key={product.id}>
          <header className={u.recordCardHeader}><div className={s.product}><img src={product.image} alt="" width={64} height={72} /><div><h2>{product.name[locale]}</h2><p>{product.sku} · {product.brand}</p></div></div><CmsBadge status={product.status}>{c[product.status]}</CmsBadge></header>
          <div className={s.stock}><div><span>{t.savedStock}</span><strong>{product.stock} <small>{t.units}</small></strong></div><span className={product.stock === 0 ? s.out : product.stock <= threshold ? s.low : s.healthy}>{product.stock === 0 ? t.out : product.stock <= threshold ? t.low : t.healthy}</span></div>
          {change ? <div className={s.adjustment}>
            <label className={u.field}><span>{t.mode}</span><select className={u.select} value={change.mode} onChange={event => update(product.id, { mode: event.target.value as StockMode })}>{(['receive', 'remove', 'count'] as const).map(mode => <option value={mode} key={mode}>{t[mode]}</option>)}</select></label>
            <label className={u.field}><span>{t.amount}</span><input className={u.input} type="number" inputMode="numeric" min={change.mode === 'count' ? 0 : 1} step={1} value={change.amount} onChange={event => update(product.id, { amount: event.target.value })} /></label>
            <label className={`${u.field} ${s.reason}`}><span>{t.reason} *</span><input className={u.input} value={change.reason} maxLength={200} placeholder={t.reasonHint} onChange={event => update(product.id, { reason: event.target.value })} /></label>
            <p className={s.preview} aria-live="polite">{t.after}: <strong>{result ?? '—'} {result !== null && t.units}</strong>{result === change.previous && ` · ${t.noChange}`}</p>
            {product.stock !== change.previous && <p className={u.error}>{t.conflict}</p>}
            <button className={u.textButton} onClick={() => setChanges(current => current.filter(item => item.id !== product.id))}>{c.cancel}</button>
          </div> : <footer className={u.recordCardFooter}><a className={u.secondary} href={cmsRoutePath({ locale, view: 'products', action: 'edit', itemId: product.id })} target="_blank" rel="noopener noreferrer">{c.edit}</a><button className={u.primary} onClick={() => setChanges(current => [...current, { id: product.id, previous: product.stock, mode: 'receive', amount: '', reason: '' }])}>{t.adjust}</button></footer>}
        </article>;
      })}</div> : <CmsEmpty title={c.noResults} description={t.noChanges} action={<button className={u.secondary} onClick={resetFilters}>{c.clear}</button>} />}
      <CmsPagination page={activePage} pages={pages} onChange={setPage} locale={locale} />
    </section>}
    {error && <p ref={errorRef} tabIndex={-1} className={u.error} role="alert">{error}</p>}
    {!review && <section className={s.review}><h2>{t.history}</h2><p className={u.muted}>{t.historyHint}</p><div className={s.reviewList}>{data.activity.filter(item => item.id.startsWith('stock-')).slice(0, 8).map(item => <article key={item.id}><p>{item.text[locale]}</p><time dateTime={item.date}>{new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.date))}</time></article>)}</div>{!data.activity.some(item => item.id.startsWith('stock-')) && <p className={u.muted}>{t.noHistory}</p>}</section>}
    {changes.length > 0 && !review && <div className={s.saveBar} data-discarding={discarding}><div><button className={u.textButton} onClick={() => { resetFilters(); setFilter('pending'); }}>{t.pending}: {changes.length}</button><p>{discarding ? t.leave : t.pendingHint}</p></div><div>{discarding ? <><button className={u.secondary} onClick={() => setDiscarding(false)}>{c.cancel}</button><button className={u.danger} onClick={() => { setChanges([]); setError(''); setDiscarding(false); }}>{t.discard}</button></> : <><button className={u.secondary} onClick={() => setDiscarding(true)}>{t.discard}</button><button className={u.primary} onClick={() => { if (invalid) { resetFilters(); setFilter('pending'); setError(t.invalid); } else setReview(true); }}>{t.review}</button></>}</div></div>}
  </div>;
}
