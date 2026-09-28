'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { cmsCopy } from '../../lib/cms-copy';
import { prepareCmsImage } from '../../lib/cms-image';
import { cmsProductsCopy } from '../../lib/cms-products-copy';
import { cmsInventoryCopy } from '../../lib/cms-inventory-copy';
import { downloadProductCsv, matchesStock } from '../../lib/cms-inventory';
import { cmsId, type CmsAction, type CmsMedia, type CmsPanelProps, type CmsProduct, type CmsStatus } from '../../lib/cms-types';
import { cmsPath, languageConfig, type LocalizedText } from '../../lib/i18n';
import { getLowestUnitPrice, MAX_PRODUCT_QUANTITY, roundCurrency, type PriceTier } from '../../lib/pricing';
import { moveToTrash } from '../../lib/cms-trash';
import Icon from '../Icon';
import { CmsActionPage, CmsBadge, CmsDialog, CmsEmpty, CmsImagePicker, CmsPagination } from './CmsUI';
import u from './CmsUI.module.css';
import s from './CmsProducts.module.css';

const statuses: CmsStatus[] = ['published', 'draft', 'archived'];
const pageSize = 8;
type PriceTierDraft = { minQuantity: string; unitPrice: string };
type ProductDraft = Omit<CmsProduct, 'price' | 'stock' | 'priceTiers' | 'images' | 'sizeGroup'> & { price: string; stock: string; priceTiers: PriceTierDraft[]; images: string[]; sizeGroup: string };
type ProductEditor = { mode: 'new' | 'edit' | 'duplicate'; draft: ProductDraft };
type CollectionDraft = { kind: 'categories' | 'brands'; id: string; name: LocalizedText; brandName: string; image: string; status: CmsStatus; isNew: boolean };
const activity = (key: keyof typeof cmsProductsCopy.en): LocalizedText => ({ th: cmsProductsCopy.th[key], en: cmsProductsCopy.en[key] });
const normalize = (value: string) => value.trim().toLocaleLowerCase();
const priceFormat = (price: number, locale: CmsPanelProps['locale']) => new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(price);

function productEditorForRoute(data: CmsPanelProps['data'], action?: CmsAction, itemId?: string): ProductEditor | null {
  if (action === 'new') return { mode: 'new', draft: { id: cmsId('product'), slug: '', sku: '', name: { th: '', en: '' }, description: { th: '', en: '' }, category: '', brand: '', image: '', images: [], price: '', priceTiers: [], stock: '0', capacity: '', sizeGroup: '', status: 'draft', featured: false } };
  if (!itemId || !['edit', 'duplicate'].includes(action || '')) return null;
  const product = data.products.find(item => item.id === itemId);
  if (!product) return null;
  const duplicate = action === 'duplicate';
  let sku = product.sku;
  if (duplicate) {
    sku = `${product.sku}-COPY`;
    let counter = 2;
    while (data.products.some(item => normalize(item.sku) === normalize(sku))) sku = `${product.sku}-COPY-${counter++}`;
  }
  return { mode: duplicate ? 'duplicate' : 'edit', draft: {
    ...product,
    id: duplicate ? cmsId('product') : product.id,
    slug: duplicate ? '' : product.slug,
    sku,
    name: duplicate ? { th: `${product.name.th} (${cmsProductsCopy.th.copySuffix})`, en: `${product.name.en} (${cmsProductsCopy.en.copySuffix})` } : { ...product.name },
    description: { ...product.description },
    images: product.images?.length ? [...product.images] : product.image ? [product.image] : [],
    sizeGroup: product.sizeGroup || '',
    status: duplicate ? 'draft' : product.status,
    price: String(product.price), priceTiers: product.priceTiers.map(tier => ({ minQuantity: String(tier.minQuantity), unitPrice: String(tier.unitPrice) })), stock: String(duplicate ? 0 : product.stock),
  } };
}

function collectionEditorForRoute(data: CmsPanelProps['data'], kind: CollectionDraft['kind'], action?: CmsAction, itemId?: string): CollectionDraft | null {
  if (!['new', 'edit'].includes(action || '')) return null;
  if (kind === 'categories') {
    const item = action === 'edit' ? data.categories.find(category => category.id === itemId) : undefined;
    if (action === 'edit' && !item) return null;
    return { kind, id: item?.id || cmsId('category'), name: item ? { ...item.name } : { th: '', en: '' }, brandName: '', image: item?.image || '', status: item?.status || 'draft', isNew: !item };
  }
  const item = action === 'edit' ? data.brands.find(brand => brand.id === itemId) : undefined;
  if (action === 'edit' && !item) return null;
  return { kind, id: item?.id || cmsId('brand'), name: { th: '', en: '' }, brandName: item?.name || '', image: item?.image || '', status: item?.status || 'draft', isNew: !item };
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className={u.field}><span>{label}</span>{children}{hint && <small className={u.muted}>{hint}</small>}</label>;
}

export function CmsProducts({ locale, data, save, routeAction, routeItemId, openAction, actionPath, closeAction, setDirty }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const t = cmsProductsCopy[locale];
  const it = cmsInventoryCopy[locale];
  const detailView = locale === 'th' ? 'ภาพขยายรายละเอียด' : 'Detail view';
  const detailBadge = locale === 'th' ? 'ภาพขยาย' : 'Detail';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<ProductEditor | null>(() => productEditorForRoute(data, routeAction, routeItemId));
  const initialDraft = useRef(JSON.stringify(editor?.draft));
  const dirty = Boolean(editor && JSON.stringify(editor.draft) !== initialDraft.current);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [pendingImages, setPendingImages] = useState<CmsMedia[]>([]);
  const [preparingImage, setPreparingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const imageVersion = useRef(0);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<CmsProduct | null>(null);
  const query = normalize(search);
  const needsStockAttention = (product: CmsProduct) => product.status === 'published' && product.stock <= data.settings.lowStockThreshold;
  const filtered = data.products.filter(product =>
    (!query || [product.name.th, product.name.en, product.sku, product.brand].some(value => normalize(value).includes(query))) &&
    (category === 'all' || product.category === category) && (status === 'all' || product.status === status) &&
    (brand === 'all' || product.brand === brand) && matchesStock(product, stockFilter, data.settings.lowStockThreshold))
    .sort((a, b) => sort === 'name' ? a.name[locale].localeCompare(b.name[locale], locale) : sort === 'stockAsc' ? a.stock - b.stock : sort === 'stockDesc' ? b.stock - a.stock : sort === 'priceAsc' ? a.price - b.price : sort === 'priceDesc' ? b.price - a.price : 0);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * pageSize, activePage * pageSize);
  const archivedProduct = routeAction === 'archive' ? data.products.find(product => product.id === routeItemId) : undefined;
  const deletingProduct = routeAction === 'delete' ? data.products.find(product => product.id === routeItemId) : undefined;
  const lowStock = data.products.filter(needsStockAttention).length;

  useEffect(() => () => { imageVersion.current += 1; }, []);
  useEffect(() => { setDirty?.(dirty || preparingImage); return () => setDirty?.(false); }, [dirty, preparingImage, setDirty]);
  useEffect(() => { if (error) { errorRef.current?.focus(); errorRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, [error]);

  function clearFilters() { setSearch(''); setCategory('all'); setStatus('all'); setStockFilter('all'); setBrand('all'); setSort('recommended'); setPage(1); }
  function updateDraft(patch: Partial<ProductDraft>) {
    setEditor(current => current ? { ...current, draft: { ...current.draft, ...patch } } : null);
  }
  function updatePriceTier(index: number, patch: Partial<PriceTierDraft>) {
    if (!draft) return;
    updateDraft({ priceTiers: draft.priceTiers.map((tier, tierIndex) => tierIndex === index ? { ...tier, ...patch } : tier) });
  }
  function addPriceTier() {
    if (!draft || draft.priceTiers.length >= MAX_PRODUCT_QUANTITY - 1) return;
    const previous = Number(draft.priceTiers.at(-1)?.minQuantity || 1);
    const suggested = Math.min(MAX_PRODUCT_QUANTITY, Math.max(2, Number.isSafeInteger(previous) ? previous + 1 : 2));
    updateDraft({ priceTiers: [...draft.priceTiers, { minQuantity: String(suggested), unitPrice: '' }] });
  }
  async function selectDeviceImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (!files.length || !draft) return;
    if (draft.images.length + files.length > 5) { setError(t.galleryLimit); return; }
    const version = ++imageVersion.current;
    setPreparingImage(true);
    setError('');
    try {
      const prepared: CmsMedia[] = [];
      for (const file of files) {
        const image = await prepareCmsImage(file, { maxDataUrlLength: 500_000 });
        if (version !== imageVersion.current) return;
        if (draft.images.includes(image.src) || prepared.some(item => item.src === image.src)) { setError(t.imageAlreadyAdded); return; }
        prepared.push(image);
      }
      if (version !== imageVersion.current) return;
      const images = [...draft.images, ...prepared.map(item => item.src)];
      setPendingImages(current => [...current, ...prepared]);
      updateDraft({ images, image: images[0] || '' });
      if (!previewImage) setPreviewImage(images[0] || '');
    } catch {
      if (version === imageVersion.current) setError(c.uploadError);
    } finally {
      if (version === imageVersion.current) setPreparingImage(false);
    }
  }
  function selectLibraryImage(image: string) {
    if (!draft || !image || preparingImage) return;
    if (draft.images.length >= 5) { setError(t.galleryLimit); return; }
    if (draft.images.includes(image)) { setError(t.imageAlreadyAdded); return; }
    const images = [...draft.images, image];
    updateDraft({ images, image: images[0] });
    if (!previewImage) setPreviewImage(images[0]);
    setError('');
  }
  function reorderImage(from: number, to: number) {
    if (!draft || preparingImage || to < 0 || to >= draft.images.length) return;
    const images = [...draft.images];
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    updateDraft({ images, image: images[0] });
    if (to === 0) setPreviewImage(images[0]);
    setError('');
  }
  function removeImage(src: string) {
    if (!draft || preparingImage) return;
    const images = draft.images.filter(image => image !== src);
    updateDraft({ images, image: images[0] || '' });
    setPendingImages(current => current.filter(image => image.src !== src));
    if (previewImage === src) setPreviewImage(images[0] || '');
    setError('');
  }
  function submitProduct(event: FormEvent) {
    event.preventDefault();
    if (!editor || preparingImage) return;
    const draft = editor.draft;
    const existing = editor.mode === 'edit' ? data.products.find(product => product.id === draft.id) : undefined;
    const price = roundCurrency(Number(draft.price));
    const stock = Number(draft.stock);
    const priceTiers: PriceTier[] = draft.priceTiers.map(tier => ({ minQuantity: Number(tier.minQuantity), unitPrice: roundCurrency(Number(tier.unitPrice)) }));
    const quantitiesValid = draft.priceTiers.every((tier, index) => tier.minQuantity.trim() !== '' && Number.isSafeInteger(priceTiers[index].minQuantity) && priceTiers[index].minQuantity >= 2 && priceTiers[index].minQuantity <= MAX_PRODUCT_QUANTITY && (index === 0 || priceTiers[index].minQuantity > priceTiers[index - 1].minQuantity));
    const pricesValid = draft.priceTiers.every((tier, index) => tier.unitPrice.trim() !== '' && Number.isFinite(priceTiers[index].unitPrice) && priceTiers[index].unitPrice > 0 && priceTiers[index].unitPrice < (index === 0 ? price : priceTiers[index - 1].unitPrice));
    let issue = '';
    if (languageConfig.order.some(lang => !draft.name[lang].trim())) issue = t.nameRequired;
    else if (!draft.sku.trim()) issue = t.skuRequired;
    else if (data.products.some(product => product.id !== draft.id && normalize(product.sku) === normalize(draft.sku))) issue = t.duplicateSku;
    else if (!draft.price.trim() || !Number.isFinite(price) || price <= 0) issue = t.priceInvalid;
    else if (!quantitiesValid) issue = t.tierQuantityInvalid;
    else if (!pricesValid) issue = t.tierPriceInvalid;
    else if (!draft.stock.trim() || !Number.isSafeInteger(stock) || stock < 0) issue = t.stockInvalid;
    else if (!data.categories.some(item => item.id === draft.category && (item.status !== 'archived' || existing?.category === item.id))) issue = t.categoryRequired;
    else if (!data.brands.some(item => item.name === draft.brand && (item.status !== 'archived' || existing?.brand === item.name))) issue = t.brandRequired;
    else if (draft.images.length < 3 || draft.images.length > 5 || new Set(draft.images).size !== draft.images.length || draft.images.some(image => !image)) issue = t.galleryRequired;
    else if (draft.sizeGroup.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.sizeGroup.trim().toLowerCase())) issue = t.sizeGroupInvalid;
    if (issue) { setError(issue); return; }
    const product: CmsProduct = {
      id: draft.id, sku: draft.sku.trim(), category: draft.category, brand: draft.brand,
      price, priceTiers, stock, image: draft.images[0], images: [...draft.images], status: draft.status, featured: draft.featured,
      name: { th: draft.name.th.trim(), en: draft.name.en.trim() },
      description: { th: draft.description.th.trim(), en: draft.description.en.trim() },
      capacity: draft.capacity?.trim(),
      sizeGroup: draft.sizeGroup.trim().toLowerCase() || undefined,
      slug: draft.slug || `${draft.name.en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'product'}-${draft.id.slice(-8)}`,
    };
    const products = existing ? data.products.map(item => item.id === product.id ? product : item) : [product, ...data.products];
    const media = [...pendingImages.filter(item => product.images?.includes(item.src) && !data.media.some(saved => saved.src === item.src)).map(item => ({ ...item, alt: { ...product.name } })), ...data.media];
    const stockActivity = existing && existing.stock !== stock ? [{ id: cmsId('stock'), date: new Date().toISOString(), text: {
      th: `${cmsInventoryCopy.th.saved} · ${product.sku}: ${existing.stock} → ${stock} · ${cmsProductsCopy.th.editProduct}`,
      en: `${cmsInventoryCopy.en.saved} · ${product.sku}: ${existing.stock} → ${stock} · ${cmsProductsCopy.en.editProduct}`,
    } }] : [];
    if (save({ ...data, products, media, activity: [...stockActivity, ...data.activity] }, activity('productSaved'))) {
      setError('');
      closeAction();
    } else setError(c.storageError);
  }
  function archiveProduct() {
    if (!archivedProduct) return;
    if (save({ ...data, products: data.products.map(product => product.id === archivedProduct.id ? { ...product, status: 'archived' } : product) }, activity('productArchived'))) closeAction();
  }
  function deleteProduct() {
    if (!deletingProduct) return;
    const next = moveToTrash(data, 'product', deletingProduct.id);
    if (!next) { setError(t.noResultsHint); return; }
    if (save(next, activity('productDeleted'))) {
      setError('');
      closeAction();
    } else setError(c.storageError);
  }
  const draft = editor?.draft;
  const selectedPreview = draft && (draft.images.includes(previewImage) ? previewImage : draft.images[0]);

  if (editor && draft) return <CmsActionPage title={editor.mode === 'edit' ? t.editProduct : editor.mode === 'duplicate' ? t.duplicateProduct : t.newProduct} description={t.intro} backLabel={c.back} onBack={closeAction}>
    <form onSubmit={submitProduct} noValidate>
      <div className={s.editorGuide}><strong>{it.guide}</strong><p>{it.guideHint}</p></div>
      {error && <p ref={errorRef} tabIndex={-1} className={u.error} role="alert">{error}</p>}
      <div className={s.editorGrid}>
        <div className={u.formStack}>
          <h3 className={s.sectionTitle}>{t.productInfo}</h3>
          {languageConfig.order.map(lang => <Field key={`name-${lang}`} label={`${c.name} · ${c[lang === 'th' ? 'thai' : 'english']} *`}><input className={u.input} required maxLength={180} value={draft.name[lang]} onChange={event => updateDraft({ name: { ...draft.name, [lang]: event.target.value } })} /></Field>)}
          {languageConfig.order.map(lang => <Field key={`description-${lang}`} label={`${t.description} · ${c[lang === 'th' ? 'thai' : 'english']}`}><textarea className={u.textarea} rows={4} maxLength={4000} value={draft.description[lang]} onChange={event => updateDraft({ description: { ...draft.description, [lang]: event.target.value } })} /></Field>)}
          <Field label={t.capacity} hint={t.capacityHint}><input className={u.input} maxLength={100} value={draft.capacity || ''} onChange={event => updateDraft({ capacity: event.target.value })} /></Field>
          <Field label={t.sizeGroup} hint={t.sizeGroupHint}><input className={u.input} maxLength={80} value={draft.sizeGroup} placeholder={t.sizeGroupPlaceholder} onChange={event => updateDraft({ sizeGroup: event.target.value })} /></Field>
        </div>
        <div className={`${s.editorSide} ${u.formStack}`}>
          <div className={s.galleryHeading}><div><h3 className={s.sectionTitle}>{t.galleryTitle} *</h3><p>{t.galleryHint}</p></div><span>{draft.images.length} / 5</span></div>
          {draft.images.length > 0 && <div className={s.galleryPreview}>
            <img src={selectedPreview} className={selectedPreview?.endsWith('#detail') ? s.detailCrop : undefined} alt={`${draft.name[locale] || t.product} · ${selectedPreview?.endsWith('#detail') ? detailView : t.galleryPreview}`} width={800} height={620} />
            <span>{selectedPreview?.endsWith('#detail') ? detailView : selectedPreview === draft.images[0] ? t.coverImage : t.galleryPreview}</span>
          </div>}
          {draft.images.length > 0 && <div className={s.galleryGrid} aria-label={t.galleryTitle}>{draft.images.map((image, index) => <div className={s.galleryCard} key={image}>
            <button type="button" className={`${s.galleryThumb} ${selectedPreview === image ? s.galleryThumbActive : ''}`} onClick={() => setPreviewImage(image)} aria-label={`${t.galleryPreview} ${index + 1}${image.endsWith('#detail') ? ` · ${detailView}` : ''}`} aria-pressed={selectedPreview === image}><img src={image} className={image.endsWith('#detail') ? s.detailCrop : undefined} alt="" width={240} height={180} />{image.endsWith('#detail') && <span className={s.galleryDetailBadge} aria-hidden="true">{detailBadge}</span>}</button>
            <div className={s.galleryCardActions}>
              {index === 0 ? <span className={s.coverTag}>{t.coverImage}</span> : <button type="button" className={s.setCover} onClick={() => reorderImage(index, 0)} disabled={preparingImage}>{t.setCover}</button>}
              <button type="button" className={s.galleryIconButton} onClick={() => reorderImage(index, index - 1)} disabled={preparingImage || index === 0} aria-label={`${t.moveEarlier} ${index + 1}`}>←</button>
              <button type="button" className={s.galleryIconButton} onClick={() => reorderImage(index, index + 1)} disabled={preparingImage || index === draft.images.length - 1} aria-label={`${t.moveLater} ${index + 1}`}>→</button>
              <button type="button" className={`${s.galleryIconButton} ${s.galleryRemove}`} onClick={() => removeImage(image)} disabled={preparingImage} aria-label={`${c.remove} ${index + 1}`}><Icon name="close" size={16} /></button>
            </div>
          </div>)}</div>}
          <div className={s.deviceImagePicker}>
            <label className={s.deviceImageButton}>
              <Icon name="plus" size={19} />
              <span>{t.chooseFromDevice}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label={t.chooseFromDevice} onChange={selectDeviceImage} disabled={preparingImage || draft.images.length >= 5} />
            </label>
            <p>{t.deviceImageHint}</p>
          </div>
          {preparingImage && <p className={s.imageStatus} role="status">{t.preparingImage}</p>}
          {pendingImages.some(item => draft.images.includes(item.src)) && <p className={s.imageStatus}><Icon name="check" size={17} />{t.imageReady} · {pendingImages.filter(item => draft.images.includes(item.src)).length}</p>}
          {draft.images.length < 5 && !preparingImage && <div className={s.galleryLibrary}><span>{t.addFromLibrary}</span><CmsImagePicker locale={locale} media={data.media} value="" onChange={selectLibraryImage} /></div>}
          <h3 className={`${s.sectionTitle} ${s.spacedSection}`}>{t.organisation}</h3>
          <Field label={`${t.sku} *`}><input className={u.input} required maxLength={100} value={draft.sku} onChange={event => updateDraft({ sku: event.target.value })} /></Field>
          <div className={u.formGrid}><Field label={`${t.priceLabel} *`}><input className={u.input} inputMode="decimal" type="number" min="0.01" step="0.01" required value={draft.price} onChange={event => updateDraft({ price: event.target.value })} /></Field><Field label={`${t.stockLabel} *`}><input className={u.input} inputMode="numeric" type="number" min="0" step="1" required value={draft.stock} onChange={event => updateDraft({ stock: event.target.value })} /></Field></div>
          <section className={s.pricingEditor} aria-labelledby="quantity-pricing-title">
            <div className={s.pricingHead}><div><h3 id="quantity-pricing-title">{t.quantityPricing}</h3><p>{t.quantityPricingHint}</p></div><button type="button" className={u.secondary} onClick={addPriceTier}><Icon name="plus" size={16} />{t.addPriceTier}</button></div>
            {draft.priceTiers.length ? <div className={s.tierEditorRows}>{draft.priceTiers.map((tier, index) => <div className={s.tierEditorRow} key={index}>
              <Field label={t.minimumQuantity}><input className={u.input} type="number" inputMode="numeric" min="2" max={MAX_PRODUCT_QUANTITY} step="1" required value={tier.minQuantity} onChange={event => updatePriceTier(index, { minQuantity: event.target.value })} /></Field>
              <Field label={t.unitPrice}><input className={u.input} type="number" inputMode="decimal" min="0.01" step="0.01" required value={tier.unitPrice} onChange={event => updatePriceTier(index, { unitPrice: event.target.value })} /></Field>
              <button type="button" className={s.removeTier} onClick={() => updateDraft({ priceTiers: draft.priceTiers.filter((_, tierIndex) => tierIndex !== index) })} aria-label={`${t.removePriceTier} ${index + 1}`}><Icon name="close" size={17} /></button>
            </div>)}</div> : <p className={s.emptyTiers}>{t.noPriceTiers}</p>}
          </section>
          <Field label={`${t.category} *`}><select className={u.select} required value={draft.category} onChange={event => updateDraft({ category: event.target.value })}><option value="">{t.chooseCategory}</option>{data.categories.filter(item => item.status !== 'archived' || item.id === draft.category).map(item => <option key={item.id} value={item.id}>{item.name[locale]}{item.status === 'archived' ? ` (${t.archivedSelection})` : ''}</option>)}</select></Field>
          <Field label={`${t.brand} *`}><select className={u.select} required value={draft.brand} onChange={event => updateDraft({ brand: event.target.value })}><option value="">{t.chooseBrand}</option>{data.brands.filter(item => item.status !== 'archived' || item.name === draft.brand).map(item => <option key={item.id} value={item.name}>{item.name}{item.status === 'archived' ? ` (${t.archivedSelection})` : ''}</option>)}</select></Field>
          <Field label={c.status}><select className={u.select} value={draft.status} onChange={event => updateDraft({ status: event.target.value as CmsStatus })}>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select></Field>
          <label className={s.featureToggle}><input type="checkbox" checked={draft.featured} onChange={event => updateDraft({ featured: event.target.checked })} /><div><strong>{t.featured}</strong><span>{t.featuredHint}</span></div></label>
        </div>
      </div>
      <div className={`${u.actions} ${s.editorActions}`}><span className={s.dirtyLabel}>{dirty ? it.changed : it.clean}</span>{editor.mode === 'edit' && <button className={`${u.danger} ${s.deleteEdit}`} type="button" onClick={() => openAction('delete', draft.id)}>{c.delete}</button>}<button className={u.secondary} type="button" onClick={closeAction}>{c.cancel}</button><button className={u.primary} type="submit" disabled={preparingImage}>{c.save}</button></div>
    </form>
  </CmsActionPage>;

  if (archivedProduct) return <CmsActionPage title={t.archiveProduct} description={t.archiveProductNote} backLabel={c.back} onBack={closeAction} danger><div className={s.confirmationProduct}><img src={archivedProduct.image} alt="" /><div><strong>{archivedProduct.name[locale]}</strong><p className={u.muted}>{archivedProduct.sku}</p></div></div><div className={u.actions}><button type="button" className={u.secondary} onClick={closeAction}>{c.cancel}</button><button type="button" className={u.danger} onClick={archiveProduct}>{t.archive}</button></div></CmsActionPage>;

  if (deletingProduct) return <CmsActionPage title={t.deleteProduct} description={t.deleteProductNote} backLabel={c.back} onBack={closeAction} danger><div className={s.confirmationProduct}><img src={deletingProduct.image} alt="" /><div><strong>{deletingProduct.name[locale]}</strong><p className={u.muted}>{deletingProduct.sku}</p></div></div>{error && <p className={u.error} role="alert">{error}</p>}<div className={u.actions}><button type="button" className={u.secondary} onClick={closeAction}>{c.cancel}</button><button type="button" className={u.danger} onClick={deleteProduct}>{c.moveToTrash}</button></div></CmsActionPage>;

  if (routeAction) return <CmsActionPage title={c.noResults} backLabel={c.back} onBack={closeAction}><p className={u.muted}>{t.noResultsHint}</p></CmsActionPage>;

  return <div>
    <div className={u.panelHead}>
      <div className={s.heading}><p className={u.eyebrow}>{t.catalogEyebrow}</p><h1>{t.title}</h1><p className={u.muted}>{t.intro}</p></div>
      <div className={s.rowActions}><a className={u.secondary} href={cmsPath(locale, 'inventory')}>{it.stockLink}</a><button type="button" className={u.primary} onClick={() => openAction('new')}><Icon name="plus" size={19} />{t.addProduct}</button></div>
    </div>
    <div className={s.stats}>
      <button className={s.stat} onClick={clearFilters}><strong>{data.products.length}</strong><span>{t.productCount}</span></button>
      <button className={s.stat} onClick={() => { clearFilters(); setStatus('published'); }}><strong>{data.products.filter(product => product.status === 'published').length}</strong><span>{t.publishedCount}</span></button>
      <button className={s.stat} onClick={() => { clearFilters(); setStockFilter('attention'); }}><strong>{lowStock}</strong><span>{t.stockAlerts}</span></button>
    </div>
    <section className={u.panel} aria-label={t.productCount}>
      <div className={u.toolbar}>
        <label className={u.search}><Icon name="search" size={19} /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={t.productSearch} aria-label={t.productSearch} type="search" /></label>
        <select className={u.select} aria-label={t.category} value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="all">{t.allCategories}</option>{data.categories.map(item => <option key={item.id} value={item.id}>{item.name[locale]}</option>)}</select>
        <select className={u.select} aria-label={c.status} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">{t.allStatuses}</option>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select>
        <select className={u.select} aria-label={t.stock} value={stockFilter} onChange={event => { setStockFilter(event.target.value); setPage(1); }}>{(['all', 'attention', 'low', 'out', 'healthy'] as const).map(value => <option value={value} key={value}>{value === 'all' ? t.allInventory : it[value]}</option>)}</select>
        <select className={u.select} aria-label={t.brand} value={brand} onChange={event => { setBrand(event.target.value); setPage(1); }}><option value="all">{it.allBrands}</option>{data.brands.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
        <select className={u.select} aria-label={it.sort} value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}>{(['recommended', 'name', 'stockAsc', 'stockDesc', 'priceAsc', 'priceDesc'] as const).map(value => <option key={value} value={value}>{it[value]}</option>)}</select>
        {(search || category !== 'all' || status !== 'all' || stockFilter !== 'all' || brand !== 'all' || sort !== 'recommended') && <button type="button" className={u.secondary} onClick={clearFilters}>{c.clear}</button>}
      </div>
      <div className={s.resultToolbar}><p role="status">{it.results.replace('{count}', String(filtered.length))}</p><button className={u.textButton} disabled={!filtered.length} title={it.exportHint} onClick={() => downloadProductCsv(filtered, data)}>{it.export}</button></div>
      {visible.length ? <>
        <div className={u.recordGrid}>{visible.map(product => {
            const itemCategory = data.categories.find(item => item.id === product.category);
            return <article className={u.recordCard} key={product.id}>
              <header className={u.recordCardHeader}>
                <div className={s.productCell}><img className={s.productImage} src={product.image} alt="" /><div><button type="button" className={s.productName} onClick={() => setDetail(product)}>{product.name[locale]}</button><p className={s.productMeta}>{product.sku}</p>{product.featured && <span className={s.featured}>{t.featured}</span>}</div></div>
                <CmsBadge status={product.status}>{c[product.status]}</CmsBadge>
              </header>
              <div className={u.recordCardBody}>
                <div className={u.recordField}><span className={u.recordLabel}>{t.category}</span><div className={`${u.recordValue} ${s.cellStack}`}><span>{itemCategory?.name[locale] || product.category}</span><span className={u.muted}>{product.brand}</span></div></div>
                <div className={u.recordField}><span className={u.recordLabel}>{t.priceRange}</span><div className={`${u.recordValue} ${s.cellStack}`}><strong>{priceFormat(product.price, locale)}</strong>{product.priceTiers.length > 0 && <span className={s.priceRange}>{t.unitPrice}: {priceFormat(getLowestUnitPrice(product), locale)}</span>}</div></div>
                <div className={u.recordField}><span className={u.recordLabel}>{t.stock}</span><div className={`${u.recordValue} ${s.cellStack}`}><span className={needsStockAttention(product) ? product.stock === 0 ? s.stockEmpty : s.stockLow : undefined}>{product.stock} {t.units}</span>{needsStockAttention(product) && <span className={u.muted}>{product.stock === 0 ? t.zeroStock : t.lowStock}</span>}</div></div>
              </div>
              <footer className={u.recordCardFooter}><span className={u.recordCardAccent} aria-hidden="true" /><div className={s.rowActions}><a className={s.rowButton} href={`${cmsPath(locale, 'inventory')}?q=${encodeURIComponent(product.sku)}`}>{it.adjust}</a><button type="button" className={s.rowButton} onClick={() => setDetail(product)}>{c.details}</button><a className={s.rowButton} aria-label={`${c.edit}: ${product.name[locale]}`} href={actionPath('edit', product.id)} target="_blank" rel="noopener noreferrer">{c.edit}</a><button type="button" className={s.rowButton} aria-label={`${t.duplicate}: ${product.name[locale]}`} onClick={() => openAction('duplicate', product.id)}>{t.duplicate}</button>{product.status !== 'archived' && <button type="button" className={s.rowButton} aria-label={`${t.archive}: ${product.name[locale]}`} onClick={() => openAction('archive', product.id)}>{t.archive}</button>}</div></footer>
            </article>;
          })}</div>
        <div className={s.footer}><p className={u.muted}>{t.resultCount.replace('{from}', String((activePage - 1) * pageSize + 1)).replace('{to}', String(Math.min(activePage * pageSize, filtered.length))).replace('{count}', String(filtered.length))}</p><CmsPagination page={activePage} pages={pages} onChange={setPage} locale={locale} /></div>
      </> : <CmsEmpty title={data.products.length ? c.noResults : t.noProducts} description={data.products.length ? t.noResultsHint : t.noProductsHint} action={<button type="button" className={u.secondary} onClick={data.products.length ? clearFilters : () => openAction('new')}>{data.products.length ? c.clear : t.addProduct}</button>} />}
    </section>
    {detail && <CmsDialog title={c.details} locale={locale} onClose={() => setDetail(null)} wide><div className={s.editorGrid}>
      <div className={s.confirmationProduct}><img src={detail.image} alt="" /><div><strong>{detail.name[locale]}</strong><p className={u.muted}>{detail.sku}</p><CmsBadge status={detail.status}>{c[detail.status]}</CmsBadge></div></div>
      <div className={u.formStack}>
        <div className={u.recordField}><span className={u.recordLabel}>{t.galleryTitle}</span><div className={s.detailGallery}>{(detail.images?.length ? detail.images : [detail.image]).map((image, index) => <div key={image}><img src={image} className={image.endsWith('#detail') ? s.detailCrop : undefined} alt={`${detail.name[locale]} ${index + 1}${image.endsWith('#detail') ? ` · ${detailView}` : ''}`} width={140} height={105} />{image.endsWith('#detail') ? <span>{detailBadge}</span> : index === 0 && <span>{t.coverImage}</span>}</div>)}</div></div>
        <div className={u.recordField}><span className={u.recordLabel}>{t.description}</span><p>{detail.description[locale] || '—'}</p></div>
        {detail.capacity && <div className={u.recordField}><span className={u.recordLabel}>{t.capacity}</span><span>{detail.capacity}</span></div>}
        {detail.sizeGroup && <div className={u.recordField}><span className={u.recordLabel}>{t.sizeGroup}</span><span>{detail.sizeGroup}</span></div>}
        <div className={u.recordField}><span className={u.recordLabel}>{t.price}</span><strong>{priceFormat(detail.price, locale)}</strong></div>
        <div className={u.recordField}><span className={u.recordLabel}>{t.quantityPricing}</span>{detail.priceTiers.length ? <div className={s.detailTiers}>{detail.priceTiers.map(tier => <span key={tier.minQuantity}><b>{tier.minQuantity}+ {t.units}</b><strong>{priceFormat(tier.unitPrice, locale)}</strong></span>)}</div> : <p className={u.muted}>{t.noPriceTiers}</p>}</div>
        <div className={u.recordField}><span className={u.recordLabel}>{t.stock}</span><span>{detail.stock} {t.units}</span></div>
      </div>
    </div></CmsDialog>}
  </div>;
}

export function CmsCollections({ locale, data, save, routeAction, routeItemId, routeKind, openAction, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsCopy[locale];
  const t = cmsProductsCopy[locale];
  const [tab, setTab] = useState<'categories' | 'brands'>(routeKind || 'categories');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState<CollectionDraft | null>(() => collectionEditorForRoute(data, routeKind || 'categories', routeAction, routeItemId));
  const [error, setError] = useState('');
  const query = normalize(search);
  const items = tab === 'categories'
    ? data.categories.map(item => ({ ...item, label: item.name[locale], searchText: `${item.name.th} ${item.name.en}`, count: data.products.filter(product => product.category === item.id).length }))
    : data.brands.map(item => ({ ...item, label: item.name, searchText: item.name, count: data.products.filter(product => product.brand === item.name).length }));
  const filtered = items.filter(item => (!query || normalize(item.searchText).includes(query)) && (status === 'all' || item.status === status));
  const archivedItem = routeAction === 'archive' ? items.find(item => item.id === routeItemId) : undefined;
  function updateCollection(patch: Partial<CollectionDraft>) { setEditor(current => current ? { ...current, ...patch } : null); }
  function submitCollection(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (editor.kind === 'categories') {
      if (languageConfig.order.some(lang => !editor.name[lang].trim())) { setError(t.categoryNameRequired); return; }
      if (data.categories.some(item => item.id !== editor.id && languageConfig.order.some(lang => normalize(item.name[lang]) === normalize(editor.name[lang])))) { setError(t.duplicateCategory); return; }
      const category = { id: editor.id, name: { th: editor.name.th.trim(), en: editor.name.en.trim() }, image: editor.image, status: editor.status };
      const categories = editor.isNew ? [...data.categories, category] : data.categories.map(item => item.id === category.id ? category : item);
      if (save({ ...data, categories }, activity('categorySaved'))) closeAction();
    } else {
      const name = editor.brandName.trim();
      if (!name) { setError(t.brandNameRequired); return; }
      if (data.brands.some(item => item.id !== editor.id && normalize(item.name) === normalize(name))) { setError(t.duplicateBrand); return; }
      const previous = data.brands.find(item => item.id === editor.id);
      const brand = { id: editor.id, name, image: editor.image, status: editor.status };
      const brands = editor.isNew ? [...data.brands, brand] : data.brands.map(item => item.id === brand.id ? brand : item);
      const products = previous && previous.name !== name ? data.products.map(product => product.brand === previous.name ? { ...product, brand: name } : product) : data.products;
      if (save({ ...data, brands, products }, activity('brandSaved'))) closeAction();
    }
  }
  function archiveCollection() {
    if (!archivedItem) return;
    const next = tab === 'categories'
      ? { ...data, categories: data.categories.map(item => item.id === routeItemId ? { ...item, status: 'archived' as const } : item) }
      : { ...data, brands: data.brands.map(item => item.id === routeItemId ? { ...item, status: 'archived' as const } : item) };
    if (save(next, activity(tab === 'categories' ? 'categoryArchived' : 'brandArchived'))) closeAction();
  }
  const clear = () => { setSearch(''); setStatus('all'); };

  if (editor) return <CmsActionPage title={editor.kind === 'categories' ? editor.isNew ? t.addCategory : t.editCategory : editor.isNew ? t.addBrand : t.editBrand} description={t.collectionIntro} backLabel={c.back} onBack={closeAction}><form onSubmit={submitCollection} noValidate><div className={s.collectionEditor}><div className={u.formStack}>
    {editor.kind === 'categories' ? languageConfig.order.map(lang => <Field key={lang} label={`${c.name} · ${c[lang === 'th' ? 'thai' : 'english']} *`}><input className={u.input} required maxLength={140} value={editor.name[lang]} onChange={event => updateCollection({ name: { ...editor.name, [lang]: event.target.value } })} /></Field>) : <Field label={`${t.brandName} *`} hint={t.brandNameHint}><input className={u.input} required maxLength={100} value={editor.brandName} onChange={event => updateCollection({ brandName: event.target.value })} /></Field>}
    <Field label={c.status}><select className={u.select} value={editor.status} onChange={event => updateCollection({ status: event.target.value as CmsStatus })}>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select></Field>
    {!editor.isNew && <p className={u.muted}>{t.linkedProducts}: {editor.kind === 'categories' ? data.products.filter(product => product.category === editor.id).length : data.products.filter(product => product.brand === data.brands.find(brand => brand.id === editor.id)?.name).length}</p>}
  </div><div><h3 className={s.sectionTitle}>{t.collectionImage} <span className={u.muted}>({t.optional})</span></h3><CmsImagePicker locale={locale} media={data.media} value={editor.image} onChange={image => updateCollection({ image })} /></div></div>{error && <p className={u.error} role="alert">{error}</p>}<div className={u.actions}><button className={u.secondary} type="button" onClick={closeAction}>{c.cancel}</button><button className={u.primary} type="submit">{c.save}</button></div></form></CmsActionPage>;

  if (archivedItem) return <CmsActionPage title={t.collectionArchive} description={t.collectionArchiveNote} backLabel={c.back} onBack={closeAction} danger><div className={s.confirmationProduct}><div><strong>{archivedItem.label}</strong><p className={u.muted}>{t.linkedProducts}: {archivedItem.count}</p></div></div><div className={u.actions}><button type="button" className={u.secondary} onClick={closeAction}>{c.cancel}</button><button type="button" className={u.danger} onClick={archiveCollection}>{t.archive}</button></div></CmsActionPage>;

  if (routeAction) return <CmsActionPage title={c.noResults} backLabel={c.back} onBack={closeAction}><p className={u.muted}>{t.noResultsHint}</p></CmsActionPage>;

  return <div>
    <div className={u.panelHead}><div className={s.heading}><p className={u.eyebrow}>{t.collectionEyebrow}</p><h1>{t.collectionTitle}</h1><p className={u.muted}>{t.collectionIntro}</p></div><button type="button" className={u.primary} onClick={() => openAction('new', undefined, tab)}><Icon name="plus" size={19} />{tab === 'categories' ? t.addCategory : t.addBrand}</button></div>
    <div className={s.tabs} role="group" aria-label={c.collections}>{(['categories', 'brands'] as const).map(kind => <button type="button" key={kind} className={`${s.tab} ${tab === kind ? s.activeTab : ''}`} aria-pressed={tab === kind} onClick={() => { setTab(kind); clear(); }}>{t[kind]}<span className={s.tabCount}>{data[kind].length}</span></button>)}</div>
    <div className={u.toolbar}><label className={u.search}><Icon name="search" size={19} /><input type="search" aria-label={t.collectionSearch} placeholder={t.collectionSearch} value={search} onChange={event => setSearch(event.target.value)} /></label><select className={u.select} aria-label={c.status} value={status} onChange={event => setStatus(event.target.value)}><option value="all">{t.allStatuses}</option>{statuses.map(item => <option key={item} value={item}>{c[item]}</option>)}</select>{(search || status !== 'all') && <button type="button" className={u.secondary} onClick={clear}>{c.clear}</button>}</div>
    {filtered.length ? <div className={s.collectionsGrid}>{filtered.map(item => <article className={s.collectionCard} key={item.id}><div className={`${s.collectionImage} ${tab === 'brands' ? s.brandImage : ''}`}>{item.image ? <img src={item.image} alt="" /> : <Icon name="grid" size={42} />}</div><div className={s.collectionBody}><h2>{item.label}</h2><div className={s.collectionMeta}><span className={u.muted}>{item.count} {c.productCount}</span><CmsBadge status={item.status}>{c[item.status]}</CmsBadge></div><div className={s.collectionCardActions}><a className={u.secondary} aria-label={`${c.edit}: ${item.label}`} href={actionPath('edit', item.id, tab)} target="_blank" rel="noopener noreferrer">{c.edit}</a>{item.status !== 'archived' && <button type="button" className={s.rowButton} aria-label={`${t.archive}: ${item.label}`} onClick={() => openAction('archive', item.id, tab)}>{t.archive}</button>}</div></div></article>)}</div> : <CmsEmpty title={items.length ? c.noResults : tab === 'categories' ? t.noCategories : t.noBrands} description={items.length ? t.noResultsHint : t.collectionEmptyHint} action={<button type="button" className={u.secondary} onClick={items.length ? clear : () => openAction('new', undefined, tab)}>{items.length ? c.clear : tab === 'categories' ? t.addCategory : t.addBrand}</button>} />}
    <p className={s.collectionCount}>{t.collectionCount.replace('{count}', String(filtered.length))}</p>
  </div>;
}
