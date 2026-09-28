import type { Locale, LocalizedText } from './i18n';
import type { Product } from './catalog';

export type CmsStatus = 'published' | 'draft' | 'archived';
export type CmsAction = 'new' | 'edit' | 'delete' | 'restore' | 'duplicate' | 'archive' | 'upload' | 'reset';
export type CmsCollectionKind = 'categories' | 'brands';
export type CmsProduct = Product & { stock: number; status: CmsStatus; featured: boolean };
export type CmsCategory = { id: string; name: LocalizedText; image: string; status: CmsStatus };
export type CmsBrand = { id: string; name: string; image: string; status: CmsStatus };
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type CmsOrderItem = { productId: string; name: LocalizedText; image: string; quantity: number; price: number };
export type CmsOrder = { id: string; customerId: string; date: string; status: OrderStatus; payment: PaymentStatus; delivery: number; items: CmsOrderItem[]; note: string; tracking: string };
export type CmsCustomer = { id: string; name: string; company: string; email: string; phone: string; address: LocalizedText; note: string; joined: string };
export type CmsContent = { id: string; kind: 'page' | 'banner' | 'story' | 'catalog'; title: LocalizedText; subtitle: LocalizedText; body: LocalizedText; image: string; link: string; status: CmsStatus; seoTitle: LocalizedText; seoDescription: LocalizedText };
export type CmsStore = { id: string; name: LocalizedText; address: LocalizedText; phone: string; lineId?: string; mapUrl: string; hours: LocalizedText; images: string[]; status: CmsStatus };
export type CmsMedia = { id: string; name: string; src: string; alt: LocalizedText; uploaded: boolean; created: string };
export type CmsSettings = { siteName: string; email: string; phone: string; line: string; description: LocalizedText; deliveryFee: number; freeShippingThreshold: number; orderNotifications: boolean; lowStockNotifications: boolean; lowStockThreshold: number };
export type CmsActivity = { id: string; text: LocalizedText; date: string };
export type CmsTrashKind = 'product' | 'content' | 'store' | 'media';
export type CmsTrashItem =
  | { id: string; kind: 'product'; deletedAt: string; record: CmsProduct }
  | { id: string; kind: 'content'; deletedAt: string; record: CmsContent }
  | { id: string; kind: 'store'; deletedAt: string; record: CmsStore }
  | { id: string; kind: 'media'; deletedAt: string; record: CmsMedia };
export type CmsData = { version: 3; products: CmsProduct[]; categories: CmsCategory[]; brands: CmsBrand[]; orders: CmsOrder[]; customers: CmsCustomer[]; content: CmsContent[]; stores: CmsStore[]; media: CmsMedia[]; trash: CmsTrashItem[]; settings: CmsSettings; activity: CmsActivity[] };
export const cmsViews = ['overview', 'products', 'inventory', 'collections', 'orders', 'customers', 'content', 'stores', 'media', 'trash', 'settings'] as const;
export type CmsView = typeof cmsViews[number];
export function isCmsView(value: string): value is CmsView {
  return cmsViews.some(view => view === value);
}
export type CmsPanelProps = {
  setDirty?: (dirty: boolean) => void;
  locale: Locale;
  data: CmsData;
  save: (next: CmsData, message?: LocalizedText) => boolean;
  routeAction?: CmsAction;
  routeItemId?: string;
  routeKind?: CmsCollectionKind;
  openAction: (action: CmsAction, itemId?: string, kind?: CmsCollectionKind) => void;
  actionPath: (action: CmsAction, itemId?: string, kind?: CmsCollectionKind) => string;
  closeAction: () => void;
};
export const orderTotal = (order: CmsOrder) => order.items.reduce((total, item) => total + item.price * item.quantity, 0) + order.delivery;
export const cmsId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
