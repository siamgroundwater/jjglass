import { messages, type MessageKey } from './messages';
import type { CmsView } from './cms-types';

// URL codes and the explicit default stay stable when display order changes.
// Add locale configuration and translations in copy, messages.ts, content.ts and catalog.ts.
export const languageConfig = {
  default: 'th',
  order: ['th', 'en'],
  labels: {
    th: 'ไทย',
    en: 'English'
  },
  shortLabels: {
    th: 'TH',
    en: 'EN'
  },
  switchLabels: {
    th: 'เปลี่ยนเป็นภาษาไทย',
    en: 'Switch to English'
  },
  openGraph: {
    th: 'th_TH',
    en: 'en_US'
  },
  productNameKeys: {
    th: 'Product name (Thai)',
    en: 'Product name (English)'
  }
} as const;
export type Locale = typeof languageConfig.order[number];
export type LocalizedText = Record<Locale, string>;
export const isLocale = (value: string): value is Locale => languageConfig.order.some(l => l === value);
export function nextLocale(locale: Locale): Locale {
  return languageConfig.order[(languageConfig.order.indexOf(locale) + 1) % languageConfig.order.length];
}
export function cmsPath(locale: Locale, view: CmsView = 'overview'): string {
  const base = locale === languageConfig.default ? '/cms' : `/cms/${locale}`;
  return view === 'overview' ? base : `${base}/${view}`;
}
export function storefrontPrefix(locale: Locale): string {
  return locale === languageConfig.default ? '' : `/${locale}`;
}
export function localizedPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) segments.splice(1, 1);
  const unprefixed = segments.join('/') || '/';
  return unprefixed === '/' ? storefrontPrefix(locale) || '/' : `${storefrontPrefix(locale)}${unprefixed}`;
}
export const copy = {
  th: {
    home: 'หน้าแรก',
    products: 'สินค้าของเรา',
    brands: 'แบรนด์',
    inspiration: 'แรงบันดาลใจ',
    catalog: 'แคตตาล็อก',
    about: 'เกี่ยวกับเรา',
    stores: 'สาขาของเรา',
    contact: 'ติดต่อเรา',
    search: 'ค้นหาสินค้า',
    searchHint: 'ค้นหาชื่อสินค้า หรือรหัสสินค้า…',
    saved: 'รายการโปรด',
    cart: 'ตะกร้าสินค้า',
    all: 'ทั้งหมด',
    viewAll: 'ดูสินค้าทั้งหมด',
    explore: 'เลือกชมสินค้า',
    add: 'เพิ่มลงตะกร้า',
    added: 'เพิ่มลงตะกร้าแล้ว',
    save: 'บันทึกสินค้า',
    remove: 'นำออก',
    close: 'ปิด',
    menu: 'เมนู',
    continue: 'เลือกซื้อสินค้าต่อ',
    total: 'ยอดรวมสินค้า',
    subtotal: 'รวมค่าสินค้า',
    shipping: 'ค่าจัดส่ง',
    shippingNote: 'สอบถามค่าจัดส่งกับทีมงาน',
    checkout: 'ดำเนินการสั่งซื้อ',
    pieces: 'ชิ้น',
    price: 'ราคา',
    category: 'หมวดหมู่',
    sort: 'เรียงตาม',
    recommended: 'แนะนำ',
    lowPrice: 'ราคา: ต่ำไปสูง',
    highPrice: 'ราคา: สูงไปต่ำ',
    nameSort: 'ชื่อสินค้า',
    clear: 'ล้างตัวกรอง',
    results: 'สินค้า',
    resultSingular: 'สินค้า',
    empty: 'ไม่พบสินค้าที่ตรงกับการค้นหา',
    emptyHint: 'ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูสินค้าอื่น',
    emptyCart: 'ตะกร้าของคุณยังว่างอยู่',
    emptySaved: 'เก็บความชอบไว้ที่นี่',
    emptySavedHint: 'แตะรูปหัวใจบนสินค้า เพื่อบันทึกชิ้นที่คุณชอบ',
    demo: 'เว็บไซต์ตัวอย่างเพื่อการนำเสนอ • ไม่มีการรับคำสั่งซื้อหรือชำระเงินจริง',
    demoPrices: 'ราคาอ้างอิงจากข้อมูลเว็บไซต์เดิม โปรดสอบถามราคาและสต็อกปัจจุบัน',
    details: 'รายละเอียดสินค้า',
    sku: 'รหัสสินค้า',
    quantity: 'จำนวน',
    back: 'ย้อนกลับ',
    seeCollection: 'ชมคอลเลกชัน',
    contactTeam: 'พูดคุยกับทีมงาน',
    browse: 'เลือกชม',
    from: 'เริ่มต้น',
    homeLink: 'กลับหน้าแรก',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    filter: 'ตัวกรอง',
    readMore: 'อ่านเพิ่มเติม',
    brand: 'แบรนด์',
    availability: 'สอบถามสต็อกกับทีมงาน',
    notFound: 'ไม่พบหน้าที่คุณกำลังมองหา'
  },
  en: {
    home: 'Home',
    products: 'Our products',
    brands: 'Brands',
    inspiration: 'Inspiration',
    catalog: 'Catalogs',
    about: 'Our story',
    stores: 'Our stores',
    contact: 'Contact',
    search: 'Search products',
    searchHint: 'Search by product name or code…',
    saved: 'Wishlist',
    cart: 'Your bag',
    all: 'All',
    viewAll: 'View all products',
    explore: 'Explore the collection',
    add: 'Add to bag',
    added: 'Added to your bag',
    save: 'Save item',
    remove: 'Remove',
    close: 'Close',
    menu: 'Menu',
    continue: 'Continue shopping',
    total: 'Product total',
    subtotal: 'Subtotal',
    shipping: 'Delivery',
    shippingNote: 'Contact our team for delivery costs',
    checkout: 'Continue to checkout',
    pieces: 'items',
    price: 'Price',
    category: 'Categories',
    sort: 'Sort by',
    recommended: 'Recommended',
    lowPrice: 'Price: low to high',
    highPrice: 'Price: high to low',
    nameSort: 'Product name',
    clear: 'Clear filters',
    results: 'products',
    resultSingular: 'product',
    empty: 'No products found',
    emptyHint: 'Try a different search or clear your filters to discover more.',
    emptyCart: 'Your bag is waiting for something lovely',
    emptySaved: 'A place for your favourites',
    emptySavedHint: 'Tap the heart on any product to keep it here for later.',
    demo: 'Presentation website • No real orders or payments are processed',
    demoPrices: 'Prices are from the supplied previous website. Confirm current prices and stock with our team.',
    details: 'Product details',
    sku: 'Product code',
    quantity: 'Quantity',
    back: 'Back',
    seeCollection: 'Explore collection',
    contactTeam: 'Talk to our team',
    browse: 'Explore',
    from: 'From',
    homeLink: 'Back to home',
    next: 'Next',
    previous: 'Previous',
    filter: 'Filters',
    readMore: 'Read the story',
    brand: 'Brand',
    availability: 'Contact our team for availability',
    notFound: 'We couldn’t find that page'
  }
} as const;
export function t(locale: Locale, key: MessageKey, values?: Record<string, string | number>): string {
  const message = messages[locale][key];
  return values ? message.replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder)) : message;
}
export const money = (value: number) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}).format(value);
