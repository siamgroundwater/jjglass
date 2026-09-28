import type { Product } from './catalog';
import sourceRows from './legacy-products-data.json';

// Each row is a distinct, simple WooCommerce product in the supplied category snapshots.
// Related capacities retain their own source ID, SKU, price, and photograph.
const thaiNames: Record<string, string> = {
  '13161': 'แก้วลิเคียวร์ Madison 85 มล.',
  '13163': 'แก้วคอนญัก 650 มล.',
  '13164': 'แก้วเชอร์รี Madison 115 มล.',
  '13169': 'แก้วค็อกเทล Lexngtion 205 มล.',
  '13170': 'แก้วแชมเปญฟลุต Lexngtion 185 มล.',
  '13171': 'แก้วกอบเล็ต Lexngtion 370 มล.',
  '13172': 'แก้วไวน์แดง Lexngtion 315 มล.',
  '13173': 'แก้วไวน์แดง Lexngtion 455 มล.',
  '13135': 'เชิงเทียน 13356A-2',
  '13136': 'เชิงเทียน 13356A-3',
  '13147': 'เชิงเทียน 13620-2',
  '13148': 'เชิงเทียน 13620-3',
  '13142': 'เชิงเทียน 14287-2',
  '13143': 'เชิงเทียน 14287-3',
  '13131': 'เชิงเทียน 14737-2',
  '13132': 'เชิงเทียน 14737-3',
  '13127': 'เชิงเทียน 3909-2',
  '13128': 'เชิงเทียน 3909-3',
  '13129': 'เชิงเทียน 3909-4',
  '13217': 'แก้วน้ำ Long Cool 315 มล.',
  '13218': 'แก้วน้ำ Top Drink 235 มล.',
  '13219': 'แก้วน้ำ Top Drink 305 มล.',
  '13220': 'แก้วน้ำ Top Drink Rock 325 มล.',
  '13221': 'แก้วน้ำ Top Drink 375 มล.',
  '13224': 'แก้วน้ำ San Marino Rock 245 มล.',
  '13225': 'แก้วน้ำ San Marino 290 มล.',
  '13226': 'แก้วน้ำ B00411 290 มล.',
  '13227': 'แก้วน้ำ San Marino 350 มล.',
  '13228': 'แก้วน้ำ San Marino 385 มล.',
  '15275': 'โหล Pop Jar B02511G0001 325 มล.',
  '15271': 'โหล Pop Jar B02517G0000 500 มล.',
  '15272': 'โหล Pop Jar B02523G0000 650 มล.',
  '15273': 'โหล Pop Jar B02526G0000 750 มล.',
  '15278': 'โหล Pop Jar B02526G0001 750 มล.',
  '15274': 'โหล Pop Jar B02536G0000 1,000 มล.',
  '19708': 'โหล BORO 1013WC',
  '19709': 'โหล BORO 1017WC',
  '19710': 'โหล BORO 1023WC',
  '19728': 'โหล BORO BT WC 600 มล.',
  '19814': 'ขวด Apothecary WC 500 มล.',
  '19815': 'ขวด Apothecary WC 540 มล.',
  '19816': 'ขวด Apothecary WC 750 มล.',
  '12989': 'แจกัน BALL VASE 783/16 สีดำ',
  '12990': 'แจกัน BALL VASE 783/20 สีดำ',
  '19835': 'แจกัน BOOT 25 ซม.',
  '19837': 'แจกัน BORO 1017',
  '19838': 'แจกัน BORO 1022',
  '19839': 'แจกัน BORO 1028',
};

function sourceCapacity(title: string): string | undefined {
  const match = title.match(/(?:\(|\s)([\d,]+)\s*ml\.?/i);
  return match ? `${match[1]} ml` : undefined;
}

function englishDisplayName(title: string, capacity?: string): string {
  let name = title.replace(/^(?:\d{4}[A-Z]\d{2}|B\d{5}(?:G\d{4})?)\s+/i, '');
  if (!capacity) return name;
  name = name
    .replace(/\s*\(\s*[\d,]+\s*ml\.?\s*\)\s*$/i, '')
    .replace(/\s*[\d,]+\s*ml\.?\s*$/i, '')
    .replace(/\s+\d+(?:\.\d+|\s+\d+\s*\/\s*\d+)?\s*oz\.?\s*$/i, '')
    .replace(/^Drinkware Tumbler\s+/i, '')
    .replace(/^Drinkware Tumbler$/i, 'Tumbler')
    .replace(/\bRed wine\b/i, 'Red Wine')
    .replace(/\bTop drink rock\b/i, 'Top Drink Rock')
    .replace(/\bFlute champagne\b/i, 'Flute Champagne')
    .trim();
  return `${name}, ${capacity}`;
}

export const legacyCatalogProducts: Omit<Product, 'priceTiers'>[] = sourceRows.map(row => {
  const thaiName = thaiNames[row.id];
  const capacity = sourceCapacity(row.legacyName);
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: { th: thaiName, en: englishDisplayName(row.legacyName, capacity) },
    description: {
      th: `${thaiName} จาก ${row.brand} รหัสสินค้า ${row.sku} เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS`,
      en: `${row.legacyName} from ${row.brand}. SKU ${row.sku}. Explore the collection and contact JJGLASS for further product details.`,
    },
    category: row.category,
    brand: row.brand,
    price: row.price,
    image: row.image,
    ...(capacity ? { capacity } : {}),
  };
});

export const legacyProductSources = sourceRows.map(row => ({
  id: row.id,
  sourceFile: row.sourceFile,
  sourceProduct: row.sourceProduct,
  sourceImage: row.sourceImage,
}));
