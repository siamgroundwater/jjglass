'use client';

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cmsCopy } from '@/lib/cms-copy';
import type { Locale } from '@/lib/i18n';
import type { CmsMedia } from '@/lib/cms-types';
import Icon from '../Icon';
import u from './CmsUI.module.css';

export const CmsSaveErrorContext = createContext<string>('');

const openDialogs = new Set<HTMLDialogElement>();
let previousBodyOverflow = '';

export function CmsDialog({ title, locale, onClose, children, wide = false, drawer = false, closeOnBackdrop = false }: { title: string; locale: Locale; onClose: () => void; children: ReactNode; wide?: boolean; drawer?: boolean; closeOnBackdrop?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const saveError = useContext(CmsSaveErrorContext);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!openDialogs.size) previousBodyOverflow = document.body.style.overflow;
    openDialogs.add(dialog);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      openDialogs.delete(dialog);
      if (dialog.open) dialog.close();
      if (!openDialogs.size) document.body.style.overflow = previousBodyOverflow;
      const activeDialog = Array.from(openDialogs).at(-1);
      if (focus?.isConnected && (!activeDialog || activeDialog.contains(focus))) focus.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [title]);
  useEffect(() => {
    if (saveError && ref.current === Array.from(openDialogs).at(-1)) errorRef.current?.scrollIntoView({ block: 'nearest' });
  }, [saveError]);
  return <dialog ref={ref} className={`${u.dialog} ${wide ? u.dialogWide : ''} ${drawer ? u.dialogDrawer : ''}`} aria-labelledby={titleId} onClick={event => {
    if ((drawer || closeOnBackdrop) && event.target === event.currentTarget) onClose();
  }} onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}>
    <div className={u.dialogHead}><h2 id={titleId}>{title}</h2><button type="button" className={u.iconButton} onClick={onClose} aria-label={cmsCopy[locale].close}><Icon name="close" size={22} /></button></div>
    <div className={u.dialogBody}>{children}{saveError && <p ref={errorRef} className={u.error} role="alert">{saveError}</p>}</div>
  </dialog>;
}

export function CmsActionPage({ title, description, backLabel, onBack, children, danger = false }: { title: string; description?: string; backLabel: string; onBack: () => void; children: ReactNode; danger?: boolean }) {
  return <section className={`${u.actionPage} ${danger ? u.actionPageDanger : ''}`}>
    <header className={u.actionPageHeader}>
      <button type="button" className={u.actionBack} onClick={onBack}><Icon name="arrow" size={18} /><span>{backLabel}</span></button>
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    </header>
    <div className={u.actionPageBody}>{children}</div>
  </section>;
}

export function CmsBadge({ status, children }: { status: string; children: ReactNode }) {
  return <span className={u.badge} data-status={status}>{children}</span>;
}

export function CmsEmpty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className={u.empty}><Icon name="search" size={28} /><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>;
}

export function CmsPagination({ page, pages, onChange, locale }: { page: number; pages: number; onChange: (page: number) => void; locale: Locale }) {
  const c = cmsCopy[locale];
  if (pages <= 1) return null;
  return <nav className={u.pagination} aria-label={c.results}>
    <button type="button" className={u.secondary} disabled={page <= 1} onClick={() => onChange(page - 1)}>{c.previous}</button>
    <span>{page} / {pages}</span>
    <button type="button" className={u.secondary} disabled={page >= pages} onClick={() => onChange(page + 1)}>{c.next}</button>
  </nav>;
}

export function CmsImagePicker({ locale, media, value, onChange }: { locale: Locale; media: CmsMedia[]; value: string; onChange: (src: string) => void }) {
  const c = cmsCopy[locale];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const matches = media.filter(item => `${item.name} ${item.alt.th} ${item.alt.en}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className={u.imagePicker}>
    <div className={u.imageSelection}>{value ? <img src={value} width={90} height={75} alt={media.find(item => item.src === value)?.alt[locale] || c.image} /> : <span><Icon name="grid" /></span>}<button className={u.secondary} type="button" onClick={() => setOpen(true)}>{c.chooseImage}</button>{value && <button className={u.textButton} type="button" onClick={() => onChange('')}>{c.remove}</button>}</div>
    {open && <section className={u.pickerPanel} aria-label={c.imageLibrary}>
      <header><strong>{c.imageLibrary}</strong><button type="button" className={u.iconButton} onClick={() => setOpen(false)} aria-label={c.close}><Icon name="close" size={20} /></button></header>
      <label className={u.search}><Icon name="search" size={18} /><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }} placeholder={c.imageSearch} aria-label={c.imageSearch} /></label>
      <div className={u.pickerGrid}>{matches.map(item => <button type="button" key={item.id} className={u.pickerItem} aria-label={`${c.select}: ${item.name}`} onClick={() => { onChange(item.src); setOpen(false); }}><img src={item.src} alt={item.alt[locale]} width={140} height={100} loading="lazy" /><span>{item.name}</span></button>)}</div>
      {!matches.length && <CmsEmpty title={c.noResults} />}
    </section>}
  </div>;
}
