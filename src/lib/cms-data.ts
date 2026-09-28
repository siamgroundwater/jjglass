import { brands, categories, contact, productGallery, products, stores } from './catalog';
import { brandImages, catalogs, pageIntro, stories, storePreviewGalleries } from './content';
import { messages } from './messages';
import { createStoreIllustrationMedia, enrichStoreIllustrations } from './store-art';
import { createDemoPriceTiers, getUnitPrice, MAX_PRODUCT_QUANTITY } from './pricing';
import { legacyCatalogProducts } from './legacy-products';
import type { LocalizedText } from './i18n';
import type { CmsContent, CmsCustomer, CmsData, CmsMedia, CmsOrder, CmsTrashItem } from './cms-types';

export const CMS_STORAGE_KEY = 'jjglass-cms-presentation-v3';
export const PREVIOUS_CMS_STORAGE_KEY = 'jjglass-cms-presentation-v2';
export const LEGACY_CMS_STORAGE_KEY = 'jjglass-cms-presentation-v1';
export const CATALOG_REVISION = 2;
const addedLegacyIds = new Set(legacyCatalogProducts.map(product => product.id));
const phrase = (key: keyof typeof messages.en): LocalizedText => ({ th: messages.th[key], en: messages.en[key] });

export function createCmsTrashSample(now = new Date(), sampleKey = crypto.randomUUID()): CmsTrashItem {
  const source = products[0];
  const id = `sample-product-${sampleKey}`;
  return {
    id: `trash-${sampleKey}`,
    kind: 'product',
    deletedAt: now.toISOString(),
    record: {
      ...source,
      id,
      slug: id,
      sku: `DEMO-${id.slice(-8).toUpperCase()}`,
      name: { th: `${source.name.th} (ตัวอย่าง)`, en: `${source.name.en} (Demo)` },
      description: { ...source.description },
      images: source.images ? [...source.images] : undefined,
      priceTiers: source.priceTiers.map(tier => ({ ...tier })),
      stock: 0,
      status: 'draft',
      featured: false,
    },
  };
}

export function createCmsPresentationSeed(): CmsData {
  const seed = createCmsSeed();
  return { ...seed, trash: [createCmsTrashSample(new Date(), 'preview')] };
}

export function createCmsSeed(): CmsData {
  const customers: CmsCustomer[] = [
    { id: 'customer-1', name: 'Demo Customer 01', company: 'Sample Café', email: 'cafe@example.test', phone: '000-000-0001', address: { th: 'ที่อยู่ตัวอย่าง เขตบางบอน กรุงเทพฯ 10150', en: 'Sample address, Bangbon, Bangkok 10150' }, note: '', joined: '2026-08-12' },
    { id: 'customer-2', name: 'Demo Customer 02', company: '', email: 'customer02@example.test', phone: '000-000-0002', address: { th: 'ที่อยู่ตัวอย่าง เขตจตุจักร กรุงเทพฯ 10900', en: 'Sample address, Chatuchak, Bangkok 10900' }, note: '', joined: '2026-09-04' },
    { id: 'customer-3', name: 'Demo Customer 03', company: 'Sample Hotel', email: 'hotel@example.test', phone: '000-000-0003', address: { th: 'ที่อยู่ตัวอย่าง เขตบางรัก กรุงเทพฯ 10500', en: 'Sample address, Bang Rak, Bangkok 10500' }, note: '', joined: '2026-07-23' },
    { id: 'customer-4', name: 'Demo Customer 04', company: 'Sample Flower Studio', email: 'flowers@example.test', phone: '000-000-0004', address: { th: 'ที่อยู่ตัวอย่าง เขตปทุมวัน กรุงเทพฯ 10330', en: 'Sample address, Pathum Wan, Bangkok 10330' }, note: '', joined: '2026-08-30' },
    { id: 'customer-5', name: 'Demo Customer 05', company: '', email: 'customer05@example.test', phone: '000-000-0005', address: { th: 'ที่อยู่ตัวอย่าง อำเภอเมืองนนทบุรี 11000', en: 'Sample address, Mueang Nonthaburi 11000' }, note: '', joined: '2026-09-12' },
    { id: 'customer-6', name: 'Demo Customer 06', company: 'Sample Restaurant', email: 'restaurant@example.test', phone: '000-000-0006', address: { th: 'ที่อยู่ตัวอย่าง เขตสัมพันธวงศ์ กรุงเทพฯ 10100', en: 'Sample address, Samphanthawong, Bangkok 10100' }, note: '', joined: '2026-09-18' },
  ];
  const orderStates: CmsOrder['status'][] = ['pending', 'processing', 'shipped', 'completed', 'completed', 'pending', 'processing', 'completed', 'cancelled', 'shipped', 'completed', 'completed'];
  const orders: CmsOrder[] = orderStates.map((status, index) => ({
    id: `JJ-2609-${String(128 - index).padStart(4, '0')}`,
    customerId: customers[index % customers.length].id,
    date: `2026-09-${String(25 - Math.floor(index * 1.6)).padStart(2, '0')}T${String(9 + index % 8).padStart(2, '0')}:30:00+07:00`,
    status, payment: status === 'pending' || status === 'cancelled' ? 'unpaid' : 'paid', delivery: index % 3 ? 80 : 0,
    items: [products[(index * 3) % products.length], products[(index * 3 + 6) % products.length]].map((product, item) => {
      const quantity = index % 2 ? 2 + item : 12 + item * 6;
      return { productId: product.id, name: { ...product.name }, image: product.image, price: getUnitPrice(product, quantity), quantity };
    }),
    note: '', tracking: status === 'shipped' || status === 'completed' ? `DEMO-TRACK-${128 - index}` : ''
  }));
  const content: CmsContent[] = [
    ...['hero.webp', 'collection-glassware.jpg', 'lifestyle-cafe.jpg'].map((image, index): CmsContent => ({
      id: `banner-${index + 1}`, kind: 'banner', title: phrase('More than glass.'), subtitle: phrase('More beautiful moments.'), body: phrase('Thoughtfully selected glassware that brings design to life.'), image: `/images/${image}`, link: '/products', status: 'published', seoTitle: { th: '', en: '' }, seoDescription: { th: '', en: '' }
    })),
    ...Object.entries(pageIntro).map(([id, intro]): CmsContent => ({ id: `page-${id}`, kind: 'page', title: { ...intro.title }, subtitle: { ...intro.eyebrow }, body: { ...intro.description }, image: id === 'about' ? '/images/lifestyle-cafe.jpg' : '', link: `/${id}`, status: 'published', seoTitle: { ...intro.title }, seoDescription: { ...intro.description } })),
    ...stories.map((story): CmsContent => ({ id: `story-${story.id}`, kind: 'story', title: { ...story.title }, subtitle: { ...story.label }, body: { ...story.text }, image: story.image, link: `/products?category=${story.category}`, status: 'published', seoTitle: { ...story.title }, seoDescription: { ...story.text } })),
    ...catalogs.map((catalog, index): CmsContent => ({ id: `catalog-${index + 1}`, kind: 'catalog', title: { th: catalog.title, en: catalog.title }, subtitle: { ...catalog.description }, body: { ...catalog.description }, image: catalog.image, link: catalog.url, status: 'published', seoTitle: { th: catalog.title, en: catalog.title }, seoDescription: { ...catalog.description } }))
  ];
  const sourceImages = [...products.flatMap(p => productGallery(p).map(src => ({ src, alt: p.name }))), ...categories.map(p => ({ src: p.image, alt: p.name })), ...content.filter(p => p.image).map(p => ({ src: p.image, alt: p.title })), ...Object.entries(brandImages).map(([brand, image]) => ({ src: `/images/${image}`, alt: { th: brand, en: brand } }))];
  const media: CmsMedia[] = Array.from(new Map(sourceImages.map(item => [item.src, item])).values()).map((item, index) => ({ id: `media-${index + 1}`, name: item.src.split('/').pop() || 'Image', src: item.src, alt: { ...item.alt }, uploaded: false, created: '2026-09-01T09:00:00+07:00' }));
  return {
    version: 3,
    catalogRevision: CATALOG_REVISION,
    products: products.map((product, index) => ({ ...product, images: product.images ? [...product.images] : undefined, name: { ...product.name }, description: { ...product.description }, priceTiers: product.priceTiers.map(tier => ({ ...tier })), status: index === products.length - 1 ? 'draft' : 'published', stock: index % 7 === 0 ? 3 + index % 6 : 24 + index * 3, featured: ['13156', '13157', '19833', '15276'].includes(product.id) })),
    categories: categories.map(category => ({ ...category, name: { ...category.name }, status: 'published' })),
    brands: brands.map((name, index) => ({ id: `brand-${index + 1}`, name, image: brandImages[name] ? `/images/${brandImages[name]}` : '', status: 'published' })),
    orders, customers, content,
    stores: stores.map(store => ({ ...store, name: { ...store.name }, address: { ...store.address }, hours: { ...store.hours }, images: (storePreviewGalleries[store.id] || []).map(image => `/images/${image}`), status: 'published' })),
    media: [...media, ...createStoreIllustrationMedia(stores)],
    trash: [],
    settings: { siteName: 'JJGLASS', email: contact.email, phone: contact.phone, line: '@jjglass', description: phrase('Discover glassware for your everyday, your home, and your business.'), deliveryFee: 80, freeShippingThreshold: 3000, orderNotifications: true, lowStockNotifications: true, lowStockThreshold: 10 },
    activity: [{ id: 'activity-seed', text: { th: 'เตรียมพื้นที่ทำงานพร้อมข้อมูลตัวอย่าง', en: 'Workspace prepared with sample data' }, date: '2026-09-25T09:00:00+07:00' }]
  };
}

export function mediaIsUsed(data: CmsData, src: string): boolean {
  return data.products.some(item => productGallery(item).includes(src)) || data.categories.some(item => item.image === src) || data.brands.some(item => item.image === src) || data.content.some(item => item.image === src) || data.stores.some(item => item.images.includes(src)) || data.orders.some(item => item.items.some(product => product.image === src)) || data.trash.some(item => item.kind === 'product' ? productGallery(item.record).includes(src) : item.kind === 'content' ? item.record.image === src : item.kind === 'store' ? item.record.images.includes(src) : false);
}

export function normalizeCmsData(value: unknown): CmsData | null {
  if (isCmsData(value)) return enrichStoreDetails(enrichProductCatalog(value));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy.version === 2) {
    const migrated = { ...legacy, version: 3, trash: [] };
    return isCmsData(migrated) ? enrichStoreDetails(enrichProductCatalog(migrated)) : null;
  }
  if (legacy.version !== 1 || !Array.isArray(legacy.products) || !Array.isArray(legacy.customers)) return null;
  const migrated = {
    ...legacy,
    version: 3,
    trash: [],
    products: legacy.products.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
      const product = item as Record<string, unknown>;
      const priceTiers = Array.isArray(product.priceTiers)
        ? product.priceTiers
        : typeof product.price === 'number' && Number.isFinite(product.price) && product.price > 0
          ? createDemoPriceTiers(product.price)
          : [];
      return { ...product, priceTiers };
    }),
    customers: legacy.customers.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
      const customer = { ...(item as Record<string, unknown>) };
      delete customer.type;
      return customer;
    })
  };
  return isCmsData(migrated) ? enrichStoreDetails(enrichProductCatalog(migrated)) : null;
}

// Add new presentation records to existing browser snapshots once, without
// overwriting CMS edits or resurrecting a product the user has moved to trash.
function enrichProductCatalog(data: CmsData): CmsData {
  if ((data.catalogRevision ?? 0) >= CATALOG_REVISION) return data;
  const seed = createCmsSeed();
  const catalogById = new Map(products.map(product => [product.id, product]));
  const presentIds = new Set(data.products.map(product => product.id));
  const presentSkus = new Set(data.products.map(product => product.sku.toLowerCase()));
  const presentSlugs = new Set(data.products.map(product => product.slug));
  for (const item of data.trash) {
    if (item.kind !== 'product') continue;
    presentIds.add(item.record.id);
    presentSkus.add(item.record.sku.toLowerCase());
    presentSlugs.add(item.record.slug);
  }

  const updated = data.products.map(product => {
    const source = catalogById.get(product.id);
    if (!source) return product;
    const sourceImages = productGallery(source);
    const hasOriginalCoverOnly = product.image === source.image && (!product.images || (product.images.length === 1 && product.images[0] === product.image));
    const gallery = hasOriginalCoverOnly && sourceImages.length >= 3 ? { images: [...sourceImages] } : {};
    const sizeGroup = !product.sizeGroup && source.sizeGroup && product.capacity === source.capacity ? { sizeGroup: source.sizeGroup } : {};
    return Object.keys(gallery).length || Object.keys(sizeGroup).length ? { ...product, ...gallery, ...sizeGroup } : product;
  });

  const appended = seed.products.filter(product => {
    if (!addedLegacyIds.has(product.id) || presentIds.has(product.id) || presentSkus.has(product.sku.toLowerCase()) || presentSlugs.has(product.slug)) return false;
    presentIds.add(product.id);
    presentSkus.add(product.sku.toLowerCase());
    presentSlugs.add(product.slug);
    return true;
  });
  const nextProducts = [...updated, ...appended];
  const existingMedia = new Set(data.media.map(item => item.src));
  const newMedia: CmsMedia[] = [];
  for (const product of nextProducts) {
    for (const [index, src] of productGallery(product).entries()) {
      if (existingMedia.has(src)) continue;
      existingMedia.add(src);
      newMedia.push({
        id: `media-catalog-${product.id}-${index + 1}`,
        name: src.split('/').pop() || 'Image',
        src,
        alt: { ...product.name },
        uploaded: false,
        created: '2026-09-28T09:00:00+07:00',
      });
    }
  }
  return { ...data, catalogRevision: CATALOG_REVISION, products: nextProducts, media: [...data.media, ...newMedia] };
}

function enrichStoreDetails(data: CmsData): CmsData {
  let changed = false;
  const nextStores = data.stores.map(store => {
    const source = stores.find(item => item.id === store.id);
    if (!source) return store;
    const hadPlaceholderHours = store.hours.th === 'สอบถามเวลาเปิดกับสาขา' && store.hours.en === 'Contact the store for opening hours';
    if (!hadPlaceholderHours && store.lineId !== undefined) return store;
    changed = true;
    return {
      ...store,
      hours: hadPlaceholderHours ? { ...source.hours } : store.hours,
      lineId: store.lineId ?? source.lineId
    };
  });
  return enrichStoreIllustrations(changed ? { ...data, stores: nextStores } : data);
}

// Reject incomplete or outdated browser snapshots before rendering an editor.
export function isCmsData(value: unknown): value is CmsData {
  if (!value || typeof value !== 'object') return false;
  const x = value as Record<string, unknown>;
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
  const text = (v: unknown) => typeof v === 'string';
  const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
  const nonnegativeNumber = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  const positiveNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
  const nonnegativeInteger = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
  const positiveQuantity = (v: unknown) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 1 && v <= MAX_PRODUCT_QUANTITY;
  const localized = (v: unknown) => object(v) && text(v.th) && text(v.en);
  const strings = (v: Record<string, unknown>, keys: string[]) => keys.every(key => text(v[key]));
  const list = (v: unknown, check: (item: Record<string, unknown>) => boolean) => Array.isArray(v) && v.every(item => object(item) && check(item));
  const status = (v: unknown) => ['published', 'draft', 'archived'].includes(String(v));
  const priceTiers = (v: unknown, basePrice: unknown) => {
    if (!positiveNumber(basePrice) || !Array.isArray(v)) return false;
    let previousQuantity = 1;
    let previousPrice = basePrice;
    return v.every(item => {
      if (!object(item)) return false;
      const unitPrice = item.unitPrice;
      if (!Number.isSafeInteger(item.minQuantity) || Number(item.minQuantity) < 2 || Number(item.minQuantity) > MAX_PRODUCT_QUANTITY || Number(item.minQuantity) <= previousQuantity || !positiveNumber(unitPrice) || unitPrice >= previousPrice) return false;
      previousQuantity = Number(item.minQuantity);
      previousPrice = unitPrice;
      return true;
    });
  };
  const product = (p: Record<string, unknown>) => strings(p, ['id', 'slug', 'sku', 'brand', 'category', 'image']) && String(p.image).trim().length > 0 && localized(p.name) && localized(p.description) && positiveNumber(p.price) && priceTiers(p.priceTiers, p.price) && nonnegativeInteger(p.stock) && status(p.status) && typeof p.featured === 'boolean' && (p.capacity === undefined || text(p.capacity)) && (p.sizeGroup === undefined || text(p.sizeGroup)) && (p.images === undefined || (Array.isArray(p.images) && p.images.length >= 1 && p.images.length <= 5 && p.images.every(image => text(image) && image.trim().length > 0) && p.images[0] === p.image && new Set(p.images).size === p.images.length));
  const content = (p: Record<string, unknown>) => strings(p, ['id', 'image', 'link']) && ['page', 'banner', 'story', 'catalog'].includes(String(p.kind)) && localized(p.title) && localized(p.subtitle) && localized(p.body) && localized(p.seoTitle) && localized(p.seoDescription) && status(p.status);
  const store = (p: Record<string, unknown>) => strings(p, ['id', 'phone', 'mapUrl']) && (p.lineId === undefined || text(p.lineId)) && localized(p.name) && localized(p.address) && localized(p.hours) && Array.isArray(p.images) && p.images.every(text) && status(p.status);
  const media = (p: Record<string, unknown>) => strings(p, ['id', 'name', 'src', 'created']) && date(p.created) && localized(p.alt) && typeof p.uploaded === 'boolean';
  const trashItem = (p: Record<string, unknown>) => strings(p, ['id', 'deletedAt']) && date(p.deletedAt) && object(p.record) && (
    p.kind === 'product' ? product(p.record) :
    p.kind === 'content' ? content(p.record) :
    p.kind === 'store' ? store(p.record) :
    p.kind === 'media' ? media(p.record) : false
  );
  return x.version === 3
    && (x.catalogRevision === undefined || nonnegativeInteger(x.catalogRevision))
    && list(x.products, product)
    && list(x.categories, p => strings(p, ['id', 'image']) && localized(p.name) && status(p.status))
    && list(x.brands, p => strings(p, ['id', 'name', 'image']) && status(p.status))
    && list(x.orders, p => strings(p, ['id', 'customerId', 'date', 'note', 'tracking']) && date(p.date) && ['pending', 'processing', 'shipped', 'completed', 'cancelled'].includes(String(p.status)) && ['unpaid', 'paid', 'refunded'].includes(String(p.payment)) && nonnegativeNumber(p.delivery) && list(p.items, i => strings(i, ['productId', 'image']) && localized(i.name) && positiveQuantity(i.quantity) && positiveNumber(i.price)))
    && list(x.customers, p => strings(p, ['id', 'name', 'company', 'email', 'phone', 'note', 'joined']) && date(p.joined) && localized(p.address))
    && list(x.content, content)
    && list(x.stores, store)
    && list(x.media, media)
    && list(x.trash, trashItem)
    && (x.trash as { id: string }[]).every((item, index, items) => items.findIndex(other => other.id === item.id) === index)
    && object(x.settings) && strings(x.settings, ['siteName', 'email', 'phone', 'line']) && localized(x.settings.description) && nonnegativeNumber(x.settings.deliveryFee) && nonnegativeNumber(x.settings.freeShippingThreshold) && nonnegativeInteger(x.settings.lowStockThreshold) && typeof x.settings.orderNotifications === 'boolean' && typeof x.settings.lowStockNotifications === 'boolean'
    && list(x.activity, p => strings(p, ['id', 'date']) && date(p.date) && localized(p.text));
}
