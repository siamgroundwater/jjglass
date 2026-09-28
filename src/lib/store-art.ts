import type { LocalizedText } from './i18n';
import type { CmsData, CmsMedia } from './cms-types';

export const storeGalleryScenes: LocalizedText[] = [
  { th: 'ภาพวาดหน้าร้านประกอบตัวอย่าง', en: 'Illustrated storefront concept' },
  { th: 'ภาพวาดภายในร้านประกอบตัวอย่าง', en: 'Illustrated store interior concept' },
  { th: 'ภาพวาดมุมจัดแสดงเครื่องแก้วประกอบตัวอย่าง', en: 'Illustrated glassware display concept' },
];
const storeIds = ['head-office', 'bangbon', 'sampheng', 'plaza', 'section-9', 'section-7', 'lynx'];
export const illustratedStoreGalleries: Record<string, readonly string[]> = Object.fromEntries(storeIds.map(id => [id, ['exterior', 'interior', 'display'].map(scene => `stores/${id}-${scene}.webp`)]));

// Match entire original galleries so a customer's curated gallery is never replaced.
export const legacyStoreGalleries: Record<string, readonly string[]> = {
  'head-office': ['category-drinkware.jpg', 'collection-glassware.jpg', 'category-stemware.jpg'],
  bangbon: ['category-stemware.jpg', 'lifestyle-wedding.jpg', 'category-tableware.jpg'],
  sampheng: ['category-vase.jpeg', 'lifestyle-florist.jpg', 'category-jar.jpg'],
  plaza: ['lifestyle-living.jpg', 'category-cover.jpg', 'category-base.jpg'],
  'section-9': ['category-bottle.jpg', 'lifestyle-garden.jpg', 'category-candle-stand.jpg'],
  'section-7': ['category-jar.jpg', 'category-drinkware.jpg', 'collection-glassware.jpg'],
  lynx: ['category-tableware.jpg', 'category-stemware.jpg', 'lifestyle-wedding.jpg'],
};

export function createStoreIllustrationMedia(stores: { id: string; name: LocalizedText }[]): CmsMedia[] {
  return stores.flatMap(store => (illustratedStoreGalleries[store.id] || []).map((image, index) => ({
    id: `media-store-art-${store.id}-${index + 1}`,
    name: image.split('/').pop()!,
    src: `/images/${image}`,
    alt: { th: `${store.name.th} — ${storeGalleryScenes[index].th}`, en: `${store.name.en} — ${storeGalleryScenes[index].en}` },
    uploaded: false,
    created: '2026-09-28T09:00:00+07:00',
  })));
}

export function enrichStoreIllustrations(data: CmsData): CmsData {
  let changed = false;
  const stores = data.stores.map(store => {
    const legacy = legacyStoreGalleries[store.id];
    if (!legacy || store.images.length !== legacy.length || !store.images.every((image, index) => image === `/images/${legacy[index]}`)) return store;
    changed = true;
    return { ...store, images: illustratedStoreGalleries[store.id].map(image => `/images/${image}`) };
  });
  const media = [...data.media];
  for (const illustration of createStoreIllustrationMedia(stores)) {
    if (!stores.some(store => store.images.includes(illustration.src)) || media.some(item => item.src === illustration.src)) continue;
    let id = illustration.id;
    let suffix = 2;
    while (media.some(item => item.id === id)) id = `${illustration.id}-${suffix++}`;
    media.push({ ...illustration, id });
    changed = true;
  }
  return changed ? { ...data, stores, media } : data;
}
