'use client';

import { useState } from 'react';
import { cmsCopy } from '@/lib/cms-copy';
import { createCmsTrashSample } from '@/lib/cms-data';
import { permanentlyDeleteFromTrash, restoreFromTrash, TRASH_RETENTION_MS } from '@/lib/cms-trash';
import type { CmsPanelProps, CmsTrashItem, CmsTrashKind } from '@/lib/cms-types';
import type { Locale, LocalizedText } from '@/lib/i18n';
import Icon from '../Icon';
import { CmsActionPage, CmsEmpty, CmsPagination } from './CmsUI';
import u from './CmsUI.module.css';
import s from './CmsTrash.module.css';

const kinds: CmsTrashKind[] = ['product', 'content', 'store', 'media'];
const pageSize = 8;

function itemName(item: CmsTrashItem, locale: Locale): string {
  switch (item.kind) {
    case 'product': return item.record.name[locale];
    case 'content': return item.record.title[locale];
    case 'store': return item.record.name[locale];
    case 'media': return item.record.name;
  }
}

function itemImage(item: CmsTrashItem): string {
  switch (item.kind) {
    case 'product':
    case 'content': return item.record.image;
    case 'store': return item.record.images[0] || '';
    case 'media': return item.record.src;
  }
}

function itemSubtitle(item: CmsTrashItem, locale: Locale): string {
  switch (item.kind) {
    case 'product': return item.record.sku;
    case 'content': return item.record.id;
    case 'store': return item.record.phone;
    case 'media': return item.record.uploaded ? cmsCopy[locale].mediaUploaded : cmsCopy[locale].mediaOriginal;
  }
}

function kindLabel(kind: CmsTrashKind, locale: Locale): string {
  const c = cmsCopy[locale];
  return { product: c.trashProducts, content: c.trashContent, store: c.trashStores, media: c.trashMedia }[kind];
}

function dateLabel(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function CmsTrash({ locale, data, save, routeAction, routeItemId, openAction, closeAction }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | CmsTrashKind>('all');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const filtered = data.trash
    .filter(item => (kind === 'all' || item.kind === kind) && (!query || [itemName(item, 'th'), itemName(item, 'en'), itemSubtitle(item, locale), item.record.id].some(value => value.toLocaleLowerCase().includes(query))))
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * pageSize, activePage * pageSize);
  const actionItem = routeAction === 'delete' || routeAction === 'restore' ? data.trash.find(item => item.id === routeItemId) : undefined;
  const now = Date.now();

  function restore(item: CmsTrashItem) {
    const next = restoreFromTrash(data, item.id);
    if (!next) { setError(c.trashRestoreUnavailable); return; }
    const message: LocalizedText = { th: cmsCopy.th.trashRestored, en: cmsCopy.en.trashRestored };
    if (save(next, message)) setError('');
  }

  function permanentlyDelete(item: CmsTrashItem) {
    const next = permanentlyDeleteFromTrash(data, item.id);
    if (!next) { setError(c.trashDeleteUnavailable); return; }
    const message: LocalizedText = { th: cmsCopy.th.trashDeletedForever, en: cmsCopy.en.trashDeletedForever };
    if (save(next, message)) { setError(''); closeAction(); }
  }

  function clearFilters() { setSearch(''); setKind('all'); setPage(1); }

  function addSample() {
    const sample = createCmsTrashSample();
    if (save({ ...data, trash: [sample, ...data.trash] }, { th: cmsCopy.th.trashSampleAdded, en: cmsCopy.en.trashSampleAdded })) setError('');
    else setError(c.storageError);
  }

  if (routeAction === 'delete' || routeAction === 'restore') return <CmsActionPage title={actionItem ? routeAction === 'delete' ? c.trashDeleteTitle : c.trashRestoreTitle : c.noResults} description={actionItem ? routeAction === 'delete' ? c.trashDeleteNote : c.trashRestoreNote : undefined} backLabel={c.back} onBack={closeAction} danger={routeAction === 'delete'}>
    {actionItem ? <>
      <div className={s.confirmItem}>
        <div className={s.thumb}>{itemImage(actionItem) ? <img src={itemImage(actionItem)} alt="" width={90} height={90} /> : <Icon name="grid" size={25} />}</div>
        <div><span className={s.kind}>{kindLabel(actionItem.kind, locale)}</span><strong>{itemName(actionItem, locale)}</strong><span>{itemSubtitle(actionItem, locale)}</span></div>
      </div>
      {error && <p className={u.error} role="alert">{error}</p>}
      <div className={u.actions}><button type="button" className={u.secondary} onClick={closeAction}>{c.cancel}</button>{routeAction === 'delete' ? <button type="button" className={u.danger} onClick={() => permanentlyDelete(actionItem)}>{c.trashDeleteForever}</button> : <button type="button" className={u.primary} onClick={() => { const next = restoreFromTrash(data, actionItem.id); if (!next) { setError(c.trashRestoreUnavailable); return; } if (save(next, { th: cmsCopy.th.trashRestored, en: cmsCopy.en.trashRestored })) closeAction(); }}>{c.trashRestore}</button>}</div>
    </> : <p className={u.muted}>{c.trashEmptyNote}</p>}
  </CmsActionPage>;

  return <section className={s.page} aria-label={c.trash}>
    <div className={s.intro}><div className={s.introIcon}><Icon name="trash" size={27} /></div><div><h2>{c.trashHeadline}</h2><p>{c.trashIntro}</p><p>{c.trashRetention}</p></div><strong className={s.count} aria-label={`${data.trash.length} ${c.results}`}>{data.trash.length}</strong></div>
    {error && <p className={u.error} role="alert">{error}</p>}
    <div className={u.panel}>
      <div className={s.toolbar}>
        <label className={u.search}><Icon name="search" size={19} /><input type="search" aria-label={c.trashSearch} placeholder={c.trashSearch} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
        <select className={u.select} aria-label={c.trashAllTypes} value={kind} onChange={event => { setKind(event.target.value as 'all' | CmsTrashKind); setPage(1); }}><option value="all">{c.trashAllTypes}</option>{kinds.map(value => <option key={value} value={value}>{kindLabel(value, locale)}</option>)}</select>
        <span className={u.muted}>{filtered.length} {c.results}</span>
      </div>
      {visible.length ? <div className={s.grid}>{visible.map(item => {
        const expires = new Date(Date.parse(item.deletedAt) + TRASH_RETENTION_MS);
        const remainingMs = expires.getTime() - now;
        const daysLeft = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
        return <article className={s.card} key={item.id}>
          <div className={s.cardTop}>
            <div className={s.thumb}>{itemImage(item) ? <img src={itemImage(item)} alt="" width={90} height={90} loading="lazy" /> : <Icon name="grid" size={25} />}</div>
            <div className={s.cardTitle}><span className={s.kind}>{kindLabel(item.kind, locale)}</span><h3>{itemName(item, locale)}</h3><p>{itemSubtitle(item, locale)}</p></div>
          </div>
          <div className={s.dates}><span>{c.trashDeletedOn} <strong>{dateLabel(new Date(item.deletedAt), locale)}</strong></span><span>{c.trashExpiresOn} <strong>{dateLabel(expires, locale)}</strong></span></div>
          <div className={s.cardFooter}><span className={`${s.remaining} ${daysLeft <= 3 ? s.soon : ''}`}>{remainingMs <= 0 ? c.trashExpired : remainingMs < 24 * 60 * 60 * 1000 ? c.trashExpiresToday : `${daysLeft} ${c.trashDaysLeft}`}</span><div className={s.cardActions}><button type="button" className={u.secondary} disabled={remainingMs <= 0} onClick={() => restore(item)}>{c.trashRestore}</button><button type="button" className={u.danger} onClick={() => { setError(''); openAction('delete', item.id); }}>{c.trashDeleteForever}</button></div></div>
        </article>;
      })}</div> : <CmsEmpty title={data.trash.length && (query || kind !== 'all') ? c.noResults : c.trashEmpty} description={data.trash.length && (query || kind !== 'all') ? undefined : c.trashEmptyNote} action={data.trash.length && (query || kind !== 'all') ? <button type="button" className={u.secondary} onClick={clearFilters}>{c.clear}</button> : <button type="button" className={u.secondary} onClick={addSample}>{c.trashAddSample}</button>} />}
      <CmsPagination page={activePage} pages={pages} onChange={setPage} locale={locale} />
    </div>
  </section>;
}
