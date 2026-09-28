import { mediaIsUsed } from './cms-data';
import { cmsId, type CmsData, type CmsTrashItem, type CmsTrashKind } from './cms-types';

export const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function expired(item: CmsTrashItem, now: Date): boolean {
  return Date.parse(item.deletedAt) + TRASH_RETENTION_MS <= now.getTime();
}

export function purgeExpiredTrash(data: CmsData, now = new Date()): CmsData {
  const trash = data.trash.filter(item => !expired(item, now));
  return trash.length === data.trash.length ? data : { ...data, trash };
}

export function moveToTrash(data: CmsData, kind: CmsTrashKind, recordId: string, now = new Date()): CmsData | null {
  if (!Number.isFinite(now.getTime())) return null;
  const current = purgeExpiredTrash(data, now);
  const common = { id: cmsId('trash'), deletedAt: now.toISOString() };
  let item: CmsTrashItem;

  if (kind === 'product') {
    const record = current.products.find(product => product.id === recordId);
    if (!record) return null;
    item = { ...common, kind, record: structuredClone(record) };
    return { ...current, products: current.products.filter(product => product.id !== recordId), trash: [item, ...current.trash] };
  }
  if (kind === 'content') {
    const record = current.content.find(content => content.id === recordId);
    if (!record) return null;
    item = { ...common, kind, record: structuredClone(record) };
    return { ...current, content: current.content.filter(content => content.id !== recordId), trash: [item, ...current.trash] };
  }
  if (kind === 'store') {
    const record = current.stores.find(store => store.id === recordId);
    if (!record) return null;
    item = { ...common, kind, record: structuredClone(record) };
    return { ...current, stores: current.stores.filter(store => store.id !== recordId), trash: [item, ...current.trash] };
  }
  if (kind === 'media') {
    const record = current.media.find(media => media.id === recordId);
    if (!record || mediaIsUsed(current, record.src)) return null;
    item = { ...common, kind, record: structuredClone(record) };
    return { ...current, media: current.media.filter(media => media.id !== recordId), trash: [item, ...current.trash] };
  }
  return null;
}

export function restoreFromTrash(data: CmsData, trashId: string, now = new Date()): CmsData | null {
  const item = data.trash.find(entry => entry.id === trashId);
  if (!item || !Number.isFinite(now.getTime()) || expired(item, now)) return null;
  const trash = data.trash.filter(entry => entry.id !== trashId);

  if (item.kind === 'product') {
    const key = (value: string) => value.trim().toLocaleLowerCase();
    if (data.products.some(product => product.id === item.record.id || key(product.sku) === key(item.record.sku) || key(product.slug) === key(item.record.slug))) return null;
    return { ...data, products: [...data.products, structuredClone(item.record)], trash };
  }
  if (item.kind === 'content') {
    if (data.content.some(content => content.id === item.record.id)) return null;
    return { ...data, content: [...data.content, structuredClone(item.record)], trash };
  }
  if (item.kind === 'store') {
    if (data.stores.some(store => store.id === item.record.id)) return null;
    return { ...data, stores: [...data.stores, structuredClone(item.record)], trash };
  }
  if (data.media.some(media => media.id === item.record.id || media.src === item.record.src)) return null;
  return { ...data, media: [...data.media, structuredClone(item.record)], trash };
}

export function permanentlyDeleteFromTrash(data: CmsData, trashId: string): CmsData | null {
  if (!data.trash.some(item => item.id === trashId)) return null;
  return { ...data, trash: data.trash.filter(item => item.id !== trashId) };
}
