'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { cmsCopy } from '@/lib/cms-copy';
import { cmsContentCopy } from '@/lib/cms-content-copy';
import { withPreparedCmsMedia } from '@/lib/cms-image';
import { moveToTrash } from '@/lib/cms-trash';
import { isLocale, languageConfig, localizedPath, type Locale, type LocalizedText } from '@/lib/i18n';
import { cmsId, type CmsPanelProps, type CmsContent as ContentItem, type CmsMedia, type CmsStore, type CmsStatus, type CmsSettings as SettingsValue } from '@/lib/cms-types';
import { CmsActionPage, CmsDialog, CmsImagePicker, CmsBadge, CmsEmpty, CmsPagination } from './CmsUI';
import ui from './CmsUI.module.css';
import styles from './CmsContent.module.css';

const kinds: ContentItem['kind'][] = ['page', 'banner', 'story', 'catalog'];
const statuses: CmsStatus[] = ['published', 'draft', 'archived'];
const blankText = (): LocalizedText => ({ th: '', en: '' });
const trimText = (value: LocalizedText): LocalizedText => ({ th: value.th.trim(), en: value.en.trim() });
const hasText = (value: LocalizedText) => languageConfig.order.every(language => value[language].trim());
const activityText = (key: 'contentSaved' | 'contentRemoved' | 'bannerOrderSaved' | 'storeSaved' | 'storeRemoved' | 'settingsSaved'): LocalizedText => ({ th: cmsContentCopy.th[key], en: cmsContentCopy.en[key] });

function safeLink(value: string) {
  const link = value.trim();
  if (!link) return true;
  if (/[\u0000-\u0020\u007f\\]/.test(link)) return false;
  if (link.startsWith('/') && !link.startsWith('//')) return true;
  try {
    const url = new URL(link);
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

function contentDestination(value: string, locale: Locale) {
  const link = value.trim();
  if (!link.startsWith('/') || link.startsWith('//')) return link;
  const suffixAt = link.search(/[?#]/);
  const pathname = suffixAt < 0 ? link : link.slice(0, suffixAt);
  const suffix = suffixAt < 0 ? '' : link.slice(suffixAt);
  const first = pathname.split('/')[1] || '';
  const storefrontPages = ['', 'products', 'wishlist', 'cart', 'checkout', 'brands', 'catalog', 'about', 'stores', 'contact', 'inspiration'];
  return isLocale(first) || storefrontPages.includes(first) ? `${localizedPath(pathname, locale)}${suffix}` : link;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className={ui.field}><span>{label}</span>{children}{hint && <span className={styles.help}>{hint}</span>}</label>;
}

function LocalizedFields({ label, value, onChange, locale, multiline = false, required = false, maxLength = 2000 }: { label: string; value: LocalizedText; onChange: (value: LocalizedText) => void; locale: Locale; multiline?: boolean; required?: boolean; maxLength?: number }) {
  const c = cmsCopy[locale];
  return <div className={ui.formGrid}>{languageConfig.order.map(language => <Field key={language} label={`${label} · ${language === 'th' ? c.thai : c.english}${required ? ' *' : ''}`}>
    {multiline ? <textarea className={ui.textarea} lang={language} value={value[language]} required={required} maxLength={maxLength} rows={4} onChange={event => onChange({ ...value, [language]: event.target.value })} /> : <input className={ui.input} lang={language} value={value[language]} required={required} maxLength={maxLength} onChange={event => onChange({ ...value, [language]: event.target.value })} />}
  </Field>)}</div>;
}

function StatusField({ locale, value, onChange }: { locale: Locale; value: CmsStatus; onChange: (value: CmsStatus) => void }) {
  const c = cmsCopy[locale];
  return <Field label={c.status}><select className={ui.select} value={value} onChange={event => onChange(event.target.value as CmsStatus)}>{statuses.map(status => <option key={status} value={status}>{c[status]}</option>)}</select></Field>;
}

function PreviewLanguage({ locale, value, onChange }: { locale: Locale; value: Locale; onChange: (value: Locale) => void }) {
  return <Field label={cmsContentCopy[locale].previewLanguage}><select className={ui.select} value={value} onChange={event => onChange(event.target.value as Locale)}>{languageConfig.order.map(language => <option key={language} value={language}>{languageConfig.labels[language]}</option>)}</select></Field>;
}

function ContentPreview({ item, locale }: { item: ContentItem; locale: Locale }) {
  const [language, setLanguage] = useState(locale);
  const c = cmsContentCopy[locale];
  return <>
    <p className={styles.previewNotice}>{c.previewNote}</p>
    <div className={styles.previewToolbar}><PreviewLanguage locale={locale} value={language} onChange={setLanguage} /><CmsBadge status={item.status}>{cmsCopy[locale][item.status]}</CmsBadge></div>
    <article lang={language} className={`${styles.previewArticle} ${item.kind === 'banner' ? styles.previewBanner : ''}`}>
      {item.image && <img className={styles.previewImage} src={item.image} alt={item.title[language]} />}
      <div className={styles.previewBody}>
        <h2>{item.title[language] || c.untitled}</h2>
        {item.subtitle[language] && <p className={styles.previewSubtitle}>{item.subtitle[language]}</p>}
        {item.body[language] && <p className={styles.prose}>{item.body[language]}</p>}
        {item.link.trim() && safeLink(item.link) && <a className={styles.previewLink} href={contentDestination(item.link, language)} target="_blank" rel="noopener noreferrer">{cmsContentCopy[language].previewButton}</a>}
      </div>
    </article>
    {(item.seoTitle[language] || item.seoDescription[language]) && <section className={styles.searchPreview}><span className={ui.eyebrow}>{c.seo}</span><strong lang={language}>{item.seoTitle[language] || item.title[language]}</strong><p lang={language}>{item.seoDescription[language]}</p></section>}
  </>;
}

export function CmsContent({ locale, data, save, routeAction, routeItemId, openAction, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const t = cmsContentCopy[locale];
  const [kind, setKind] = useState<ContentItem['kind']>('banner');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<ContentItem | null>(() => {
    if (routeAction === 'new') return { id: cmsId('content'), kind: 'banner', title: blankText(), subtitle: blankText(), body: blankText(), image: '', link: '', status: 'draft', seoTitle: blankText(), seoDescription: blankText() };
    const item = routeAction === 'edit' ? data.content.find(content => content.id === routeItemId) : undefined;
    return item ? { ...item, title: { ...item.title }, subtitle: { ...item.subtitle }, body: { ...item.body }, seoTitle: { ...item.seoTitle }, seoDescription: { ...item.seoDescription } } : null;
  });
  const [editorPreview, setEditorPreview] = useState(false);
  const [pendingImages, setPendingImages] = useState<CmsMedia[]>([]);
  const [preparingImage, setPreparingImage] = useState(false);
  const [preview, setPreview] = useState<ContentItem | null>(null);
  const [deleting] = useState<ContentItem | null>(() => routeAction === 'delete' ? data.content.find(content => content.id === routeItemId) || null : null);
  const [error, setError] = useState('');
  const filtered = data.content.filter(item => item.kind === kind && (status === 'all' || item.status === status) && `${Object.values(item.title).join(' ')} ${Object.values(item.body).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const currentPage = Math.min(page, pages);
  const banners = data.content.filter(item => item.kind === 'banner');
  const create = () => openAction('new');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || preparingImage) return;
    if (!hasText(draft.title)) { setError(t.invalidTitle); return; }
    if (!safeLink(draft.link)) { setError(t.invalidUrl); return; }
    const item = { ...draft, title: trimText(draft.title), subtitle: trimText(draft.subtitle), body: trimText(draft.body), link: draft.link.trim(), seoTitle: trimText(draft.seoTitle), seoDescription: trimText(draft.seoDescription) };
    const exists = data.content.some(content => content.id === item.id);
    const content = exists ? data.content.map(content => content.id === item.id ? item : content) : [...data.content, item];
    if (save({ ...data, content, media: withPreparedCmsMedia(data.media, pendingImages, [item.image], item.title) }, activityText('contentSaved'))) {
      setError(''); closeAction();
    } else setError(t.saveError);
  };
  const reorder = (item: ContentItem, direction: -1 | 1) => {
    const index = banners.findIndex(banner => banner.id === item.id);
    const neighbor = banners[index + direction];
    if (!neighbor) return;
    const content = [...data.content];
    const from = content.findIndex(content => content.id === item.id);
    const to = content.findIndex(content => content.id === neighbor.id);
    [content[from], content[to]] = [content[to], content[from]];
    save({ ...data, content }, activityText('bannerOrderSaved'));
  };
  return <>
    {!routeAction && <>
    <section className={ui.panel}>
      <header className={ui.panelHead}><p className={ui.muted}>{t.contentIntro}</p><button className={ui.primary} onClick={create}>{t.newContent}</button></header>
      <div className={styles.tabs} role="group" aria-label={t.contentType}>{kinds.map(value => <button key={value} type="button" aria-pressed={kind === value} className={`${styles.tab} ${kind === value ? styles.tabActive : ''}`} onClick={() => { setKind(value); setPage(1); }}>{t[value]}<span className={styles.tabCount}>{data.content.filter(item => item.kind === value).length}</span></button>)}</div>
      <div className={ui.toolbar}>
        <input className={ui.search} type="search" aria-label={t.contentSearch} placeholder={t.contentSearch} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} />
        <select className={ui.select} aria-label={c.status} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">{c.all} · {c.status}</option>{statuses.map(value => <option key={value} value={value}>{c[value]}</option>)}</select>
        <span className={ui.muted}>{filtered.length} {t.items}</span>
      </div>
      {filtered.length ? <div className={styles.contentGrid}>{filtered.slice((currentPage - 1) * 9, currentPage * 9).map(item => {
        const bannerIndex = banners.findIndex(banner => banner.id === item.id);
        return <article className={styles.card} key={item.id}>
          {item.image ? <img className={styles.cardImage} src={item.image} alt={item.title[locale]} loading="lazy" /> : <div className={styles.cardImageEmpty}>{c.noImage}</div>}
          <div className={styles.cardBody}><div className={styles.cardMeta}><CmsBadge status={item.status}>{c[item.status]}</CmsBadge><span className={ui.muted}>{t[item.kind]}</span></div>
            <h3 className={styles.cardTitle}>{item.title[locale]}</h3><p className={styles.cardText}>{item.subtitle[locale] || item.body[locale]}</p>
            <div className={styles.cardActions}><a className={ui.secondary} href={actionPath('edit', item.id)} target="_blank" rel="noopener noreferrer">{c.edit}</a><button className={ui.secondary} onClick={() => setPreview(item)}>{c.preview}</button></div>
            <div className={styles.cardFooter}>{item.kind === 'banner' ? <><span>{t.position} {bannerIndex + 1}</span><div className={styles.orderControls}><button type="button" disabled={bannerIndex === 0} aria-label={`${t.moveUp}: ${item.title[locale]}`} onClick={() => reorder(item, -1)}>↑</button><button type="button" disabled={bannerIndex === banners.length - 1} aria-label={`${t.moveDown}: ${item.title[locale]}`} onClick={() => reorder(item, 1)}>↓</button></div></> : <span>{languageConfig.shortLabels.th} / {languageConfig.shortLabels.en}</span>}<button className={ui.danger} onClick={() => openAction('delete', item.id)} aria-label={`${c.delete}: ${item.title[locale]}`}>{c.delete}</button></div>
          </div>
        </article>;
      })}</div> : <CmsEmpty title={query || status !== 'all' ? c.noResults : t.noContent} description={query || status !== 'all' ? undefined : t.noContentHint} action={<button className={ui.secondary} onClick={query || status !== 'all' ? () => { setQuery(''); setStatus('all'); } : create}>{query || status !== 'all' ? c.clear : t.newContent}</button>} />}
      {pages > 1 && <CmsPagination page={currentPage} pages={pages} onChange={setPage} locale={locale} />}
    </section>
    </>}
    {draft && <CmsActionPage title={editorPreview ? t.previewTitle : data.content.some(item => item.id === draft.id) ? t.editContent : t.newContent} description={t.contentIntro} backLabel={c.back} onBack={closeAction}>
      {editorPreview ? <><ContentPreview item={draft} locale={locale} /><div className={ui.actions}><button type="button" className={ui.secondary} onClick={() => setEditorPreview(false)}>{t.backToEditor}</button></div></> : <form className={ui.formStack} onSubmit={submit}>
        <div className={styles.formTop}><Field label={t.contentType}><select className={ui.select} value={draft.kind} onChange={event => setDraft({ ...draft, kind: event.target.value as ContentItem['kind'] })}>{kinds.map(value => <option value={value} key={value}>{t[value]}</option>)}</select></Field><StatusField locale={locale} value={draft.status} onChange={value => setDraft({ ...draft, status: value })} /></div>
        <LocalizedFields label={t.title} locale={locale} value={draft.title} onChange={title => setDraft({ ...draft, title })} required maxLength={180} />
        <LocalizedFields label={t.subtitle} locale={locale} value={draft.subtitle} onChange={subtitle => setDraft({ ...draft, subtitle })} maxLength={300} />
        <LocalizedFields label={t.body} locale={locale} value={draft.body} onChange={body => setDraft({ ...draft, body })} multiline maxLength={15000} />
        <section className={styles.formSection}><h3>{t.image}</h3><CmsImagePicker locale={locale} media={data.media} value={draft.image} onChange={(image, prepared) => { setDraft(current => current ? { ...current, image } : current); setPendingImages(prepared ? [prepared] : []); }} onBusyChange={setPreparingImage} /><Field label={t.destination} hint={t.destinationHint}><input className={ui.input} value={draft.link} maxLength={2000} onChange={event => setDraft({ ...draft, link: event.target.value })} /></Field></section>
        <section className={styles.formSection}><div><h3>{t.seo}</h3><p className={styles.help}>{t.seoHint}</p></div><LocalizedFields label={t.seoTitle} locale={locale} value={draft.seoTitle} onChange={seoTitle => setDraft({ ...draft, seoTitle })} maxLength={120} /><LocalizedFields label={t.seoDescription} locale={locale} value={draft.seoDescription} onChange={seoDescription => setDraft({ ...draft, seoDescription })} multiline maxLength={320} /></section>
        {error && <p className={ui.error} role="alert">{error}</p>}
        <div className={styles.editorActions}><button type="button" className={ui.secondary} disabled={preparingImage} onClick={() => setEditorPreview(true)}>{c.preview}</button><div className={ui.actions}><button type="button" className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button className={ui.primary} type="submit" disabled={preparingImage}>{t.saveContent}</button></div></div>
      </form>}
    </CmsActionPage>}
    {preview && <CmsDialog title={t.previewTitle} locale={locale} onClose={() => setPreview(null)} wide><ContentPreview item={preview} locale={locale} /></CmsDialog>}
    {deleting && <CmsActionPage title={t.deleteContent} description={t.deleteContentNote} backLabel={c.back} onBack={closeAction} danger><div className={ui.formStack}><strong>{deleting.title[locale]}</strong>{error && <p className={ui.error} role="alert">{error}</p>}<div className={ui.actions}><button className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button className={ui.danger} onClick={() => { const next = moveToTrash(data, 'content', deleting.id); if (next && save(next, activityText('contentRemoved'))) closeAction(); else setError(t.saveError); }}>{c.moveToTrash}</button></div></div></CmsActionPage>}
    {routeAction && !draft && !deleting && <CmsActionPage title={c.noResults} backLabel={c.back} onBack={closeAction}><p className={ui.muted}>{t.noContentHint}</p></CmsActionPage>}
  </>;
}

function StorePreview({ item, locale }: { item: CmsStore; locale: Locale }) {
  const [language, setLanguage] = useState(locale);
  const [selected, setSelected] = useState(0);
  const t = cmsContentCopy[locale];
  const images = item.images.filter(Boolean);
  return <>
    <p className={styles.previewNotice}>{t.previewNote}</p>
    <div className={styles.previewToolbar}><PreviewLanguage locale={locale} value={language} onChange={setLanguage} /><CmsBadge status={item.status}>{cmsCopy[locale][item.status]}</CmsBadge></div>
    <article className={styles.previewArticle} lang={language}>
      {images.length > 0 && <img className={styles.previewImage} src={images[Math.min(selected, images.length - 1)]} alt={`${item.name[language]} · ${t.photo} ${selected + 1}`} />}
      {images.length > 1 && <div className={styles.galleryStrip}>{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelected(index)} aria-label={`${t.photo} ${index + 1}`} aria-pressed={selected === index} className={`${styles.galleryThumbnail} ${selected === index ? styles.galleryThumbnailActive : ''}`}><img src={image} alt="" /></button>)}</div>}
      <div className={styles.previewBody}><h2>{item.name[language] || t.untitled}</h2><p className={styles.prose}>{item.address[language]}</p>{item.hours[language] && <p>{item.hours[language]}</p>}{item.phone && <p>{item.phone}</p>}{item.lineId && <p>LINE: {item.lineId}</p>}{item.mapUrl.trim() && safeLink(item.mapUrl) && <a className={styles.previewLink} href={item.mapUrl.trim()} target="_blank" rel="noopener noreferrer">{cmsContentCopy[language].openMap}</a>}</div>
    </article>
  </>;
}

export function CmsStores({ locale, data, save, routeAction, routeItemId, openAction, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const t = cmsContentCopy[locale];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [draft, setDraft] = useState<CmsStore | null>(() => {
    if (routeAction === 'new') return { id: cmsId('store'), name: blankText(), address: blankText(), phone: '', lineId: '', mapUrl: '', hours: blankText(), images: [], status: 'draft' };
    const store = routeAction === 'edit' ? data.stores.find(item => item.id === routeItemId) : undefined;
    return store ? { ...store, name: { ...store.name }, address: { ...store.address }, hours: { ...store.hours }, images: [...store.images] } : null;
  });
  const [preview, setPreview] = useState<CmsStore | null>(null);
  const [editorPreview, setEditorPreview] = useState(false);
  const [pendingImages, setPendingImages] = useState<CmsMedia[]>([]);
  const [preparingCount, setPreparingCount] = useState(0);
  const [deleting] = useState<CmsStore | null>(() => routeAction === 'delete' ? data.stores.find(store => store.id === routeItemId) || null : null);
  const [error, setError] = useState('');
  useEffect(() => {
    setPendingImages(current => {
      const referenced = current.filter(item => draft?.images.includes(item.src));
      return referenced.length === current.length ? current : referenced;
    });
  }, [draft?.images]);
  const stores = data.stores.filter(store => (status === 'all' || status === store.status) && `${Object.values(store.name).join(' ')} ${Object.values(store.address).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const create = () => openAction('new');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || preparingCount) return;
    if (!hasText(draft.name) || !hasText(draft.address)) { setError(t.invalidStore); return; }
    if (!safeLink(draft.mapUrl)) { setError(t.invalidUrl); return; }
    const images = draft.images.filter(Boolean);
    if (new Set(images).size !== images.length) { setError(t.duplicatePhoto); return; }
    const item = { ...draft, name: trimText(draft.name), address: trimText(draft.address), hours: trimText(draft.hours), phone: draft.phone.trim(), lineId: draft.lineId?.trim() || '', mapUrl: draft.mapUrl.trim(), images };
    const exists = data.stores.some(store => store.id === item.id);
    const nextStores = exists ? data.stores.map(store => store.id === item.id ? item : store) : [...data.stores, item];
    if (save({ ...data, stores: nextStores, media: withPreparedCmsMedia(data.media, pendingImages, item.images, item.name) }, activityText('storeSaved'))) {
      setError(''); closeAction();
    } else setError(t.saveError);
  };
  const moveImage = (index: number, direction: -1 | 1) => {
    if (!draft || preparingCount || index + direction < 0 || index + direction >= draft.images.length) return;
    const images = [...draft.images];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    setDraft({ ...draft, images });
  };
  return <>
    {!routeAction && <>
    <section className={ui.panel}>
      <header className={ui.panelHead}><p className={ui.muted}>{t.storesIntro}</p><button className={ui.primary} onClick={create}>{t.newStore}</button></header>
      <div className={ui.toolbar}><input className={ui.search} type="search" placeholder={t.storeSearch} aria-label={t.storeSearch} value={query} onChange={event => setQuery(event.target.value)} /><select className={ui.select} aria-label={c.status} value={status} onChange={event => setStatus(event.target.value)}><option value="all">{c.all} · {c.status}</option>{statuses.map(value => <option value={value} key={value}>{c[value]}</option>)}</select><span className={ui.muted}>{stores.length} {t.items}</span></div>
      {stores.length ? <div className={styles.storeGrid}>{stores.map(store => <article key={store.id} className={`${styles.card} ${styles.storeCard}`}>
        {store.images[0] ? <img className={styles.cardImage} src={store.images[0]} alt={store.name[locale]} loading="lazy" /> : <div className={styles.cardImageEmpty}>{c.noImage}</div>}
        <div className={styles.cardBody}><div className={styles.cardMeta}><CmsBadge status={store.status}>{c[store.status]}</CmsBadge><span className={ui.muted}>{store.images.length} {c.mediaCount}</span></div><h3 className={styles.cardTitle}>{store.name[locale]}</h3><div className={styles.storeDetails}><p>{store.address[locale]}</p><p>{store.hours[locale]}</p><p>{store.phone}</p>{store.lineId && <p>LINE: {store.lineId}</p>}</div><div className={styles.cardActions}><a className={ui.secondary} href={actionPath('edit', store.id)} target="_blank" rel="noopener noreferrer">{c.edit}</a><button className={ui.secondary} onClick={() => setPreview(store)}>{c.preview}</button></div><div className={styles.cardFooter}><span>{languageConfig.shortLabels.th} / {languageConfig.shortLabels.en}</span><button className={ui.danger} aria-label={`${c.delete}: ${store.name[locale]}`} onClick={() => openAction('delete', store.id)}>{c.delete}</button></div></div>
      </article>)}</div> : <CmsEmpty title={query || status !== 'all' ? c.noResults : t.noStores} description={query || status !== 'all' ? undefined : t.noStoresHint} action={<button className={ui.secondary} onClick={query || status !== 'all' ? () => { setQuery(''); setStatus('all'); } : create}>{query || status !== 'all' ? c.clear : t.newStore}</button>} />}
    </section>
    </>}
    {draft && <CmsActionPage title={editorPreview ? t.storePreview : data.stores.some(store => store.id === draft.id) ? t.editStore : t.newStore} description={t.storesIntro} backLabel={c.back} onBack={closeAction}>
      {editorPreview ? <><StorePreview item={draft} locale={locale} /><div className={ui.actions}><button type="button" className={ui.secondary} onClick={() => setEditorPreview(false)}>{t.backToEditor}</button></div></> : <form className={ui.formStack} onSubmit={submit}>
        <StatusField locale={locale} value={draft.status} onChange={value => setDraft({ ...draft, status: value })} />
        <LocalizedFields label={t.storeName} locale={locale} value={draft.name} onChange={name => setDraft({ ...draft, name })} required maxLength={160} />
        <LocalizedFields label={t.address} locale={locale} value={draft.address} onChange={address => setDraft({ ...draft, address })} required multiline maxLength={2000} />
        <LocalizedFields label={t.hours} locale={locale} value={draft.hours} onChange={hours => setDraft({ ...draft, hours })} maxLength={300} />
        <div className={ui.formGrid}><Field label={t.phone}><input className={ui.input} type="tel" value={draft.phone} maxLength={80} onChange={event => setDraft({ ...draft, phone: event.target.value })} /></Field><Field label={t.lineId}><input className={ui.input} value={draft.lineId || ''} maxLength={80} onChange={event => setDraft({ ...draft, lineId: event.target.value })} /></Field></div>
        <Field label={t.mapUrl} hint={t.destinationHint}><input className={ui.input} value={draft.mapUrl} maxLength={2000} onChange={event => setDraft({ ...draft, mapUrl: event.target.value })} /></Field>
        <section className={styles.formSection}>
          <div><h3>{t.gallery}</h3><p className={styles.help}>{t.galleryHint}</p></div>
          {draft.images.length > 0 ? <div className={styles.storeGallery}>{draft.images.map((image, index) => <div className={styles.galleryItem} key={index}>
            <header><strong>{index === 0 ? t.cover : `${t.photo} ${index + 1}`}</strong><span className={ui.muted}>{index + 1}</span></header>
            <CmsImagePicker locale={locale} media={data.media} value={image} onChange={(value, prepared) => {
              if (value && draft.images.some((existing, currentIndex) => currentIndex !== index && existing === value)) { setError(t.duplicatePhoto); return; }
              setError('');
              setDraft(current => current ? { ...current, images: current.images.map((existing, currentIndex) => currentIndex === index ? value : existing) } : current);
              if (prepared) setPendingImages(current => [...current.filter(item => item.src !== prepared.src), prepared]);
            }} onBusyChange={busy => setPreparingCount(count => count + (busy ? 1 : -1))} />
            <footer><div className={styles.orderControls}>
              <button type="button" disabled={preparingCount > 0 || index === 0} aria-label={`${t.moveUp}: ${t.photo} ${index + 1}`} onClick={() => moveImage(index, -1)}>↑</button>
              <button type="button" disabled={preparingCount > 0 || index === draft.images.length - 1} aria-label={`${t.moveDown}: ${t.photo} ${index + 1}`} onClick={() => moveImage(index, 1)}>↓</button>
            </div><button type="button" className={ui.danger} disabled={preparingCount > 0} onClick={() => setDraft({ ...draft, images: draft.images.filter((_, currentIndex) => currentIndex !== index) })}>{t.removePhoto}</button></footer>
          </div>)}</div> : <p className={ui.muted}>{t.noGallery}</p>}
          <div><button type="button" className={ui.secondary} disabled={preparingCount > 0} onClick={() => setDraft({ ...draft, images: [...draft.images, ''] })}>{t.addPhoto}</button></div>
        </section>
        {error && <p className={ui.error} role="alert">{error}</p>}
        <div className={styles.editorActions}><button type="button" className={ui.secondary} disabled={preparingCount > 0} onClick={() => setEditorPreview(true)}>{c.preview}</button><div className={ui.actions}><button type="button" className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button type="submit" className={ui.primary} disabled={preparingCount > 0}>{c.save}</button></div></div>
      </form>}
    </CmsActionPage>}
    {preview && <CmsDialog title={t.storePreview} locale={locale} onClose={() => setPreview(null)} wide><StorePreview item={preview} locale={locale} /></CmsDialog>}
    {deleting && <CmsActionPage title={t.deleteStore} description={t.deleteStoreNote} backLabel={c.back} onBack={closeAction} danger><div className={ui.formStack}><strong>{deleting.name[locale]}</strong>{error && <p className={ui.error} role="alert">{error}</p>}<div className={ui.actions}><button className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button className={ui.danger} onClick={() => { const next = moveToTrash(data, 'store', deleting.id); if (next && save(next, activityText('storeRemoved'))) closeAction(); else setError(t.saveError); }}>{c.moveToTrash}</button></div></div></CmsActionPage>}
    {routeAction && !draft && !deleting && <CmsActionPage title={c.noResults} backLabel={c.back} onBack={closeAction}><p className={ui.muted}>{t.noStoresHint}</p></CmsActionPage>}
  </>;
}

type SettingsDraft = Omit<SettingsValue, 'deliveryFee' | 'freeShippingThreshold' | 'lowStockThreshold'> & { deliveryFee: string; freeShippingThreshold: string; lowStockThreshold: string };
const settingsDraft = (settings: SettingsValue): SettingsDraft => ({ ...settings, deliveryFee: String(settings.deliveryFee), freeShippingThreshold: String(settings.freeShippingThreshold), lowStockThreshold: String(settings.lowStockThreshold) });

export function CmsSettings({ locale, data, save, routeAction, openAction, closeAction, onReset, onExport }: CmsPanelProps & { onReset: () => void; onExport: () => void }) {
  const c = cmsCopy[locale];
  const t = cmsContentCopy[locale];
  const [draft, setDraft] = useState<SettingsDraft>(() => settingsDraft(data.settings));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDraft(settingsDraft(data.settings)); setError(''); }, [data.settings]);
  const update = <Key extends keyof SettingsDraft>(key: Key, value: SettingsDraft[Key]) => { setDraft(current => ({ ...current, [key]: value })); setSaved(false); setError(''); };
  const submit = (event: FormEvent) => {
    event.preventDefault(); setSaved(false);
    if (!draft.siteName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) { setError(t.invalidSettings); return; }
    const deliveryFee = Number(draft.deliveryFee);
    const freeShippingThreshold = Number(draft.freeShippingThreshold);
    const lowStockThreshold = Number(draft.lowStockThreshold);
    if (![draft.deliveryFee, draft.freeShippingThreshold, draft.lowStockThreshold].every(value => value.trim()) || ![deliveryFee, freeShippingThreshold, lowStockThreshold].every(Number.isFinite) || deliveryFee < 0 || deliveryFee > 1000000 || freeShippingThreshold < 0 || freeShippingThreshold > 10000000 || !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 100000) { setError(t.invalidNumbers); return; }
    const settings: SettingsValue = { ...draft, siteName: draft.siteName.trim(), email: draft.email.trim(), phone: draft.phone.trim(), line: draft.line.trim(), description: trimText(draft.description), deliveryFee: Math.round(deliveryFee * 100) / 100, freeShippingThreshold: Math.round(freeShippingThreshold * 100) / 100, lowStockThreshold };
    if (save({ ...data, settings }, activityText('settingsSaved'))) { setError(''); setSaved(true); } else setError(t.saveError);
  };
  if (routeAction === 'reset') return <CmsActionPage title={c.resetTitle} description={c.resetDescription} backLabel={c.back} onBack={closeAction} danger><div className={ui.actions}><button className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button className={ui.danger} onClick={onReset}>{c.reset}</button></div></CmsActionPage>;
  return <div className={styles.settings}>
    <form className={styles.settings} onSubmit={submit}>
      <section className={`${ui.panel} ${styles.settingsPanel}`}><header className={styles.settingsSectionHead}><h2>{t.general}</h2><p>{t.generalIntro}</p></header><div className={ui.formStack}><div className={ui.formGrid}><Field label={`${t.siteName} *`}><input className={ui.input} value={draft.siteName} maxLength={160} required onChange={event => update('siteName', event.target.value)} /></Field><Field label={`${t.email} *`}><input type="email" className={ui.input} value={draft.email} maxLength={254} required onChange={event => update('email', event.target.value)} /></Field><Field label={t.phone}><input type="tel" className={ui.input} value={draft.phone} maxLength={80} onChange={event => update('phone', event.target.value)} /></Field><Field label={t.line}><input className={ui.input} value={draft.line} maxLength={100} onChange={event => update('line', event.target.value)} /></Field></div><LocalizedFields label={t.description} locale={locale} value={draft.description} multiline maxLength={2000} onChange={description => update('description', description)} /></div></section>
      <section className={`${ui.panel} ${styles.settingsPanel}`}><header className={styles.settingsSectionHead}><h2>{t.delivery}</h2><p>{t.deliveryIntro}</p></header><div className={ui.formGrid}><Field label={t.deliveryFee}><input className={ui.input} type="number" min="0" max="1000000" step="0.01" required value={draft.deliveryFee} onChange={event => update('deliveryFee', event.target.value)} /></Field><Field label={t.freeShipping} hint={t.freeShippingHint}><input className={ui.input} type="number" min="0" max="10000000" step="0.01" required value={draft.freeShippingThreshold} onChange={event => update('freeShippingThreshold', event.target.value)} /></Field></div></section>
      <section className={`${ui.panel} ${styles.settingsPanel}`}><header className={styles.settingsSectionHead}><h2>{t.inventory}</h2><p>{t.inventoryIntro}</p></header><Field label={t.lowStockThreshold}><input className={ui.input} type="number" min="0" max="100000" step="1" required value={draft.lowStockThreshold} onChange={event => update('lowStockThreshold', event.target.value)} /></Field></section>
      <section className={`${ui.panel} ${styles.settingsPanel}`}><header className={styles.settingsSectionHead}><h2>{t.notifications}</h2><p>{t.notificationsIntro}</p></header><label className={styles.settingToggle}><div><strong>{t.orderNotifications}</strong><span className={styles.help}>{t.orderNotificationsHint}</span></div><input type="checkbox" role="switch" checked={draft.orderNotifications} onChange={event => update('orderNotifications', event.target.checked)} /></label><label className={styles.settingToggle}><div><strong>{t.lowStockNotifications}</strong><span className={styles.help}>{t.lowStockNotificationsHint}</span></div><input type="checkbox" role="switch" checked={draft.lowStockNotifications} onChange={event => update('lowStockNotifications', event.target.checked)} /></label></section>
      {error && <p className={ui.error} role="alert">{error}</p>}
      <div className={styles.saveBar}><p className={saved ? styles.success : ui.muted} role="status">{saved ? t.savedNotice : t.changesOnly}</p><button type="submit" className={ui.primary}>{c.save}</button></div>
    </form>
    <section className={`${ui.panel} ${styles.settingsPanel}`}><header className={styles.settingsSectionHead}><h2>{t.workspaceData}</h2><p>{t.workspaceDataIntro}</p></header><div className={styles.dataActions}><div><p className={styles.help}>{t.exportHint}</p><button type="button" className={ui.secondary} onClick={onExport}>{c.export}</button></div><div><p className={styles.help}>{t.resetHint}</p><button type="button" className={ui.danger} onClick={() => openAction('reset')}>{c.reset}</button></div></div></section>
  </div>;
}
