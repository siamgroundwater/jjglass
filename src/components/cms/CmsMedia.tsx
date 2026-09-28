'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { cmsCopy } from '@/lib/cms-copy';
import { prepareCmsImage } from '@/lib/cms-image';
import { type CmsMedia as MediaItem, type CmsPanelProps } from '@/lib/cms-types';
import { mediaIsUsed } from '@/lib/cms-data';
import { moveToTrash } from '@/lib/cms-trash';
import { languageConfig } from '@/lib/i18n';
import Icon from '../Icon';
import { CmsActionPage, CmsBadge, CmsDialog, CmsEmpty, CmsPagination } from './CmsUI';
import u from './CmsUI.module.css';
import s from './CmsMedia.module.css';

export default function CmsMedia({ locale, data, save, routeAction, routeItemId, openAction, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaItem | null>(() => ['edit', 'delete'].includes(routeAction || '') ? (() => { const item = data.media.find(media => media.id === routeItemId); return item ? { ...item, alt: { ...item.alt } } : null; })() : null);
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [pending, setPending] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);
  const matches = data.media.filter(item => `${item.name} ${item.alt.th} ${item.alt.en}`.toLowerCase().includes(query.trim().toLowerCase()) && (filter === 'all' || (filter === 'uploaded') === item.uploaded));
  const pages = Math.max(1, Math.ceil(matches.length / 18));
  const currentPage = Math.min(page, pages);
  const closeUpload = () => { uploadVersion.current++; setPending([]); setBusy(false); setError(''); closeAction(); };
  async function stage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (files.length > 6) { setError(c.uploadLimit); return; }
    setError(''); setBusy(true);
    const version = ++uploadVersion.current;
    try {
      const next: MediaItem[] = [];
      for (const file of files) next.push(await prepareCmsImage(file));
      if (version === uploadVersion.current) setPending(next);
    } catch { if (version === uploadVersion.current) setError(c.uploadError); }
    finally { if (version === uploadVersion.current) setBusy(false); }
  }
  function saveImage(event: FormEvent) {
    event.preventDefault();
    if (!selected || !selected.name.trim()) return;
    const updated = { ...selected, name: selected.name.trim() };
    if (save({ ...data, media: data.media.map(item => item.id === updated.id ? updated : item) }, { th: cmsCopy.th.imageUpdated, en: cmsCopy.en.imageUpdated })) closeAction();
  }
  return <>
    {!routeAction && <>
    <div className={s.heading}><p className={u.muted}>{c.libraryIntro}</p><button className={u.primary} onClick={() => openAction('upload')}><Icon name="plus" size={18} />{c.upload}</button></div>
    <section className={u.panel}>
      <div className={u.toolbar}><label className={u.search}><Icon name="search" size={19} /><input aria-label={c.imageSearch} placeholder={c.imageSearch} value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><select className={u.select} aria-label={c.media} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="all">{c.all}</option><option value="original">{c.mediaOriginal}</option><option value="uploaded">{c.mediaUploaded}</option></select><span className={u.muted}>{matches.length} {c.mediaCount}</span></div>
      <div className={s.grid}>{matches.slice((currentPage - 1) * 18, currentPage * 18).map(item => <button className={s.card} key={item.id} onClick={() => setDetail(item)}>
        <div className={s.image}><img src={item.src} alt={item.alt[locale]} width={240} height={170} loading="lazy" />{item.uploaded && <span className={s.uploaded}><Icon name="check" size={14} /></span>}</div>
        <div className={s.cardInfo}><strong>{item.name}</strong><span>{item.uploaded ? c.mediaUploaded : c.mediaOriginal}</span></div>
      </button>)}</div>
      {!matches.length && <CmsEmpty title={c.noResults} action={<button className={u.secondary} onClick={() => { setQuery(''); setFilter('all'); }}>{c.clear}</button>} />}
      <CmsPagination page={currentPage} pages={pages} onChange={setPage} locale={locale} />
    </section>
    <p className={s.tip}>{c.mediaTip}</p>
    </>}
    {routeAction === 'upload' && <CmsActionPage title={c.uploadPreview} description={c.uploadHint} backLabel={c.back} onBack={closeUpload}>
      <div className={s.uploadArea}><Icon name="plus" size={28} /><p>{c.uploadHint}</p><p>{c.uploadLimit}</p><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={stage} disabled={busy} aria-label={c.upload} />{busy && <p role="status">{c.uploading}</p>}</div>
      <div className={s.uploadGrid}>{pending.map(item => <div key={item.id}><img src={item.src} width={180} height={120} alt={item.name} /><span>{item.name}</span><button type="button" className={u.textButton} onClick={() => setPending(current => current.filter(image => image.id !== item.id))}>{c.remove}</button></div>)}</div>
      {error && <p role="alert" className={u.error}>{error}</p>}
      <div className={u.actions}><button className={u.secondary} onClick={closeUpload}>{c.cancel}</button><button className={u.primary} disabled={busy || !pending.length} onClick={() => { if (save({ ...data, media: [...pending, ...data.media] }, { th: cmsCopy.th.imageAdded, en: cmsCopy.en.imageAdded })) { setQuery(''); setFilter('all'); setPage(1); closeUpload(); } }}>{c.uploadSave}</button></div>
    </CmsActionPage>}
    {routeAction === 'edit' && selected && <CmsActionPage title={`${c.edit} · ${selected.name}`} description={c.libraryIntro} backLabel={c.back} onBack={closeAction}>
      <div className={s.detailGrid}><div className={s.largePreview}><img src={selected.src} alt={selected.alt[locale]} width={420} height={420} /></div><form onSubmit={saveImage} className={u.formStack}>
        <CmsBadge status={mediaIsUsed(data, selected.src) ? 'published' : 'draft'}>{mediaIsUsed(data, selected.src) ? c.used : c.unused}</CmsBadge>
        <label className={u.field}>{c.fileName}<input className={u.input} required maxLength={150} value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} /></label>
        {languageConfig.order.map(language => <label className={u.field} key={language}>{c.altText} · {languageConfig.labels[language]}<textarea className={u.textarea} maxLength={300} value={selected.alt[language]} onChange={e => setSelected({ ...selected, alt: { ...selected.alt, [language]: e.target.value } })} /></label>)}
        <div className={u.actions}><button type="button" className={u.secondary} onClick={closeAction}>{c.cancel}</button><button className={u.primary} type="submit">{c.save}</button></div>
        {mediaIsUsed(data, selected.src) && <p className={u.muted}>{c.mediaInUse}</p>}
      </form></div>
    </CmsActionPage>}
    {routeAction === 'delete' && selected && <CmsActionPage title={c.mediaDeleteTitle} description={c.mediaDeleteNote} backLabel={c.back} onBack={closeAction} danger><div className={s.detailGrid}><div className={s.largePreview}><img src={selected.src} alt={selected.alt[locale]} width={420} height={420} /></div><div className={u.formStack}><strong>{selected.name}</strong><CmsBadge status={mediaIsUsed(data, selected.src) ? 'published' : 'draft'}>{mediaIsUsed(data, selected.src) ? c.used : c.unused}</CmsBadge>{mediaIsUsed(data, selected.src) && <p className={u.error}>{c.mediaInUse}</p>}{error && <p className={u.error} role="alert">{error}</p>}<div className={u.actions}><button className={u.secondary} onClick={closeAction}>{c.cancel}</button><button className={u.danger} disabled={mediaIsUsed(data, selected.src)} onClick={() => { const next = moveToTrash(data, 'media', selected.id); if (!next) { setError(data.media.some(item => item.id === selected.id) ? c.mediaInUse : c.noResults); return; } if (save(next, { th: cmsCopy.th.imageDeleted, en: cmsCopy.en.imageDeleted })) closeAction(); else setError(c.storageError); }}>{c.moveToTrash}</button></div></div></div></CmsActionPage>}
    {routeAction && !['upload'].includes(routeAction) && !selected && <CmsActionPage title={c.noResults} backLabel={c.back} onBack={closeAction}><p className={u.muted}>{c.libraryIntro}</p></CmsActionPage>}
    {detail && <CmsDialog title={c.details} locale={locale} onClose={() => setDetail(null)} wide><div className={s.detailGrid}><div className={s.largePreview}><img src={detail.src} alt={detail.alt[locale]} width={420} height={420} /></div><div className={u.formStack}><CmsBadge status={mediaIsUsed(data, detail.src) ? 'published' : 'draft'}>{mediaIsUsed(data, detail.src) ? c.used : c.unused}</CmsBadge><div className={u.recordField}><span className={u.recordLabel}>{c.fileName}</span><strong>{detail.name}</strong></div>{languageConfig.order.map(language => <div className={u.recordField} key={language}><span className={u.recordLabel}>{c.altText} · {languageConfig.labels[language]}</span><p>{detail.alt[language] || '—'}</p></div>)}<div className={u.actions}><a className={u.secondary} href={actionPath('edit', detail.id)} target="_blank" rel="noopener noreferrer">{c.edit}</a><button className={u.danger} disabled={mediaIsUsed(data, detail.src)} onClick={() => openAction('delete', detail.id)}>{c.delete}</button></div></div></div></CmsDialog>}
  </>;
}
