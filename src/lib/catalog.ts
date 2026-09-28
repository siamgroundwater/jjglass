// Presentation catalog adapted from the supplied legacy HTML. See docs/SOURCE_CONTENT.md.
import type { LocalizedText } from './i18n';
import { createDemoPriceTiers, type PriceTier } from './pricing';
export type { Locale, LocalizedText } from './i18n';
export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  brand: string;
  price: number;
  priceTiers: PriceTier[];
  image: string;
  images?: string[];
  capacity?: string;
  sizeGroup?: string;
};
export function productGallery(product: Pick<Product, 'image' | 'images'>): string[] {
  return product.images?.length ? product.images : product.image ? [product.image] : [];
}
export type Category = {
  id: string;
  name: LocalizedText;
  image: string;
};
export type Store = {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  phone: string;
  hours: LocalizedText;
  lineId: string;
  mapUrl: string;
};
export const categories: Category[] = [{
  "id": "drinkware",
  "name": {
    "th": "แก้วน้ำ",
    "en": "Drinkware"
  },
  "image": "/images/category-drinkware.jpg"
}, {
  "id": "stemware",
  "name": {
    "th": "แก้วไวน์และค็อกเทล",
    "en": "Stemware"
  },
  "image": "/images/category-stemware.jpg"
}, {
  "id": "vase",
  "name": {
    "th": "แจกัน",
    "en": "Vases"
  },
  "image": "/images/category-vase.jpeg"
}, {
  "id": "jar",
  "name": {
    "th": "โหลแก้วและภาชนะเก็บของ",
    "en": "Storage & Jars"
  },
  "image": "/images/category-jar.jpg"
}, {
  "id": "tableware",
  "name": {
    "th": "ภาชนะบนโต๊ะอาหาร",
    "en": "Tableware"
  },
  "image": "/images/category-tableware.jpg"
}, {
  "id": "base",
  "name": {
    "th": "ฐานรองและถาด",
    "en": "Bases & Trays"
  },
  "image": "/images/category-base.jpg"
}, {
  "id": "cover",
  "name": {
    "th": "ฝาครอบและขาตั้งเค้ก",
    "en": "Cake Stands & Domes"
  },
  "image": "/images/category-cover.jpg"
}, {
  "id": "bottle",
  "name": {
    "th": "ขวดแก้ว",
    "en": "Bottles"
  },
  "image": "/images/category-bottle.jpg"
}, {
  "id": "candle-stand",
  "name": {
    "th": "เชิงเทียน",
    "en": "Candle Holders"
  },
  "image": "/images/category-candle-stand.jpg"
}, {
  "id": "others",
  "name": {
    "th": "เครื่องแก้วอื่น ๆ",
    "en": "More Glassware"
  },
  "image": "/images/category-others.jpg"
}];
const catalogProducts: Omit<Product, 'priceTiers'>[] = [{
  "id": "13181",
  "slug": "1501b15-lexngtion-beer-14-3-4-oz-420-ml",
  "sku": "300389",
  "name": {
    "th": "แก้วเบียร์ Lexngtion 420 มล.",
    "en": "Lexngtion Beer Glass, 420 ml"
  },
  "description": {
    "th": "แก้วเบียร์ Lexngtion 420 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1501B15 Lexngtion Beer 14 3/4 oz. (420 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 65,
  "image": "/images/product-13181.jpg",
  "capacity": "420 ml"
}, {
  "id": "13214",
  "slug": "b00109-drinkware-tumbler-stack-9-oz-245-ml",
  "sku": "300648",
  "name": {
    "th": "แก้วน้ำ Stack 245 มล.",
    "en": "Stack Tumbler, 245 ml"
  },
  "description": {
    "th": "แก้วน้ำ Stack 245 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B00109 Drinkware Tumbler Stack 9 oz. ( 245 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 25,
  "image": "/images/product-13214.jpg",
  "capacity": "245 ml"
}, {
  "id": "13215",
  "slug": "b00208-drinkware-tumbler-long-cool-9-oz-245-ml",
  "sku": "300655",
  "name": {
    "th": "แก้วน้ำ Long Cool 245 มล.",
    "en": "Long Cool Tumbler, 245 ml"
  },
  "description": {
    "th": "แก้วน้ำ Long Cool 245 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B00208 Drinkware Tumbler Long Cool 9 oz. ( 245 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 25,
  "image": "/images/product-13215.jpg",
  "capacity": "245 ml"
}, {
  "id": "13216",
  "slug": "b00209-drinkware-tumbler-rock-9-oz-245-ml",
  "sku": "300662",
  "name": {
    "th": "แก้วน้ำ Rock 245 มล.",
    "en": "Rock Tumbler, 245 ml"
  },
  "description": {
    "th": "แก้วน้ำ Rock 245 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B00209 Drinkware Tumbler Rock 9 oz. ( 245 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 25,
  "image": "/images/product-13216.jpg",
  "capacity": "245 ml"
}, {
  "id": "13222",
  "slug": "b00322-drinkware-tumbler-top-drink-22oz-625-ml",
  "sku": "300730",
  "name": {
    "th": "แก้วน้ำ Top Drink 625 มล.",
    "en": "Top Drink Tumbler, 625 ml"
  },
  "description": {
    "th": "แก้วน้ำ Top Drink 625 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B00322 Drinkware Tumbler Top Drink 22oz. ( 625 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 40,
  "image": "/images/product-13222.jpg",
  "capacity": "625 ml"
}, {
  "id": "13223",
  "slug": "b00406-drinkware-tumbler-san-marino-6-oz-175-ml",
  "sku": "300747",
  "name": {
    "th": "แก้วน้ำ San Marino 175 มล.",
    "en": "San Marino Tumbler, 175 ml"
  },
  "description": {
    "th": "แก้วน้ำ San Marino 175 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B00406 Drinkware Tumbler San Marino 6 oz. ( 175 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "drinkware",
  "brand": "Ocean",
  "price": 25,
  "image": "/images/product-13223.jpg",
  "capacity": "175 ml"
}, {
  "id": "13156",
  "slug": "1015a21-bordeaux-21oz-600ml",
  "sku": "300228",
  "name": {
    "th": "แก้วไวน์ Bordeaux 600 มล.",
    "en": "Bordeaux Wine Glass, 600 ml"
  },
  "description": {
    "th": "แก้วไวน์ Bordeaux 600 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015A21 Bordeaux 21oz. (600ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 170,
  "image": "/images/product-13156.jpg",
  "capacity": "600 ml"
}, {
  "id": "13157",
  "slug": "1015c10-cocktail-10oz-285ml",
  "sku": "300235",
  "name": {
    "th": "แก้วค็อกเทล 285 มล.",
    "en": "Cocktail Glass, 285 ml"
  },
  "description": {
    "th": "แก้วค็อกเทล 285 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015C10 Cocktail 10oz. (285ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 170,
  "image": "/images/product-13157.jpg",
  "capacity": "285 ml"
}, {
  "id": "13158",
  "slug": "1015d22-madison-burgundy-22-3-4-oz-650-ml",
  "sku": "300242",
  "name": {
    "th": "แก้วไวน์ Madison Burgundy 650 มล.",
    "en": "Madison Burgundy Glass, 650 ml"
  },
  "description": {
    "th": "แก้วไวน์ Madison Burgundy 650 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015D22 Madison Burgundy 22 3/4 oz. (650 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 170,
  "image": "/images/product-13158.jpg",
  "capacity": "650 ml"
}, {
  "id": "13159",
  "slug": "1015f07-flute-champagne-7-1-4oz-210ml",
  "sku": "300259",
  "name": {
    "th": "แก้วแชมเปญ Flute 210 มล.",
    "en": "Champagne Flute, 210 ml"
  },
  "description": {
    "th": "แก้วแชมเปญ Flute 210 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015F07 Flute Champagne 7 1/4oz. (210ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 160,
  "image": "/images/product-13159.jpg",
  "capacity": "210 ml"
}, {
  "id": "13160",
  "slug": "1015g15-water-goblet-15oz-425ml",
  "sku": "300266",
  "name": {
    "th": "แก้วน้ำ Water Goblet 425 มล.",
    "en": "Water Goblet, 425 ml"
  },
  "description": {
    "th": "แก้วน้ำ Water Goblet 425 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015G15 Water Goblet 15oz. (425ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 150,
  "image": "/images/product-13160.jpg",
  "capacity": "425 ml"
}, {
  "id": "13162",
  "slug": "1015m12-margarita-12oz-345ml",
  "sku": "300273",
  "name": {
    "th": "แก้วมาร์การิตา 345 มล.",
    "en": "Margarita Glass, 345 ml"
  },
  "description": {
    "th": "แก้วมาร์การิตา 345 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015M12 Margarita 12oz. (345ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 170,
  "image": "/images/product-13162.jpg",
  "capacity": "345 ml"
}, {
  "id": "13165",
  "slug": "1015r15-red-wine-15oz-425ml",
  "sku": "300297",
  "name": {
    "th": "แก้วไวน์แดง 425 มล.",
    "en": "Red Wine Glass, 425 ml"
  },
  "description": {
    "th": "แก้วไวน์แดง 425 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015R15 Red Wine 15oz. (425ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 150,
  "image": "/images/product-13165.jpg",
  "capacity": "425 ml"
}, {
  "id": "13166",
  "slug": "1015w12-white-wine-12-1-4oz-350ml",
  "sku": "300303",
  "name": {
    "th": "แก้วไวน์ขาว 350 มล.",
    "en": "White Wine Glass, 350 ml"
  },
  "description": {
    "th": "แก้วไวน์ขาว 350 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "1015W12 White Wine 12 1/4oz. (350ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "stemware",
  "brand": "Ocean",
  "price": 150,
  "image": "/images/product-13166.jpg",
  "capacity": "350 ml"
}, {
  "id": "19817",
  "slug": "apothecary-bottle-wc-1100ml",
  "sku": "061075",
  "name": {
    "th": "แจกันขวด Apothecary WC 1,100 มล.",
    "en": "Apothecary Bottle WC, 1,100 ml"
  },
  "description": {
    "th": "แจกันขวด Apothecary WC 1,100 มล. จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Apothecary Bottle WC 1,100ml. from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 120,
  "image": "/images/product-19817.jpg",
  "capacity": "1,100 ml"
}, {
  "id": "19813",
  "slug": "apothecary-bottle-wc-280ml",
  "sku": "061099",
  "name": {
    "th": "แจกันขวด Apothecary WC 280 มล.",
    "en": "Apothecary Bottle WC, 280 ml"
  },
  "description": {
    "th": "แจกันขวด Apothecary WC 280 มล. จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Apothecary Bottle WC 280ml. from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 75,
  "image": "/images/product-19813.jpg",
  "capacity": "280 ml"
}, {
  "id": "12988",
  "slug": "ball-vase-783-12-black",
  "sku": "76529",
  "name": {
    "th": "แจกันทรงกลม 783/12 สีดำ",
    "en": "Ball Vase 783/12, Black"
  },
  "description": {
    "th": "แจกันทรงกลม 783/12 สีดำ จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "BALL VASE 783/12 Black from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "LYNX",
  "price": 380,
  "image": "/images/product-12988.jpg"
}, {
  "id": "19833",
  "slug": "ballon-64-14cm-rb",
  "sku": "046546",
  "name": {
    "th": "แจกัน Ballon 64/14 ซม. RB",
    "en": "Ballon Vase 64/14 cm, RB"
  },
  "description": {
    "th": "แจกัน Ballon 64/14 ซม. RB จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Ballon 64/14cm. RB from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 180,
  "image": "/images/product-19833.jpg"
}, {
  "id": "19834",
  "slug": "big-cone-15cm",
  "sku": "046379",
  "name": {
    "th": "แจกัน Big Cone 15 ซม.",
    "en": "Big Cone Vase, 15 cm"
  },
  "description": {
    "th": "แจกัน Big Cone 15 ซม. จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Big Cone 15cm. from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 180,
  "image": "/images/product-19834.jpg"
}, {
  "id": "19924",
  "slug": "bohemia-20685-b1",
  "sku": "048939",
  "name": {
    "th": "แจกัน BOHEMIA 20685/B1",
    "en": "Bohemia Vase 20685/B1"
  },
  "description": {
    "th": "แจกัน BOHEMIA 20685/B1 จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "BOHEMIA 20685/B1 from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 680,
  "image": "/images/product-19924.jpg"
}, {
  "id": "19836",
  "slug": "boro-1013",
  "sku": "054152",
  "name": {
    "th": "แจกันทรงกระบอก BORO 1013",
    "en": "BORO Vase 1013"
  },
  "description": {
    "th": "แจกันทรงกระบอก BORO 1013 จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "BORO 1013 from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "vase",
  "brand": "AMORN",
  "price": 120,
  "image": "/images/product-19836.jpg"
}, {
  "id": "15270",
  "slug": "b02511g0000-pop-jar-325ml",
  "sku": "302048",
  "name": {
    "th": "โหลแก้ว Pop Jar 325 มล.",
    "en": "Pop Jar, 325 ml"
  },
  "description": {
    "th": "โหลแก้ว Pop Jar 325 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B02511G0000 Pop Jar (325ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "Ocean",
  "price": 55,
  "image": "/images/product-15270.jpg",
  "capacity": "325 ml"
}, {
  "id": "15276",
  "slug": "b02517g0001-pop-jar-500ml",
  "sku": "302109",
  "name": {
    "th": "โหลแก้ว Pop Jar 500 มล.",
    "en": "Pop Jar, 500 ml"
  },
  "description": {
    "th": "โหลแก้ว Pop Jar 500 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B02517G0001 Pop Jar (500ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "Ocean",
  "price": 95,
  "image": "/images/product-15276.jpg",
  "capacity": "500 ml"
}, {
  "id": "15277",
  "slug": "b02523g0001-pop-jar-650ml",
  "sku": "302154",
  "name": {
    "th": "โหลแก้ว Pop Jar 650 มล.",
    "en": "Pop Jar, 650 ml"
  },
  "description": {
    "th": "โหลแก้ว Pop Jar 650 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B02523G0001 Pop Jar (650ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "Ocean",
  "price": 105,
  "image": "/images/product-15277.jpg",
  "capacity": "650 ml"
}, {
  "id": "15279",
  "slug": "b02536g0001-pop-jar-1000-ml",
  "sku": "302222",
  "name": {
    "th": "โหลแก้ว Pop Jar 1,000 มล.",
    "en": "Pop Jar, 1,000 ml"
  },
  "description": {
    "th": "โหลแก้ว Pop Jar 1,000 มล. จาก Ocean เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "B02536G0001 Pop Jar (1,000 ml.) from Ocean. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "Ocean",
  "price": 125,
  "image": "/images/product-15279.jpg",
  "capacity": "1,000 ml"
}, {
  "id": "19707",
  "slug": "boro-1008wc",
  "sku": "061013",
  "name": {
    "th": "โหลแก้ว BORO 1008WC",
    "en": "BORO Jar 1008WC"
  },
  "description": {
    "th": "โหลแก้ว BORO 1008WC จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "BORO 1008WC from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 120,
  "image": "/images/product-19707.jpg"
}, {
  "id": "19727",
  "slug": "boro-bt-wc-330ml",
  "sku": "061051",
  "name": {
    "th": "โหลแก้ว BORO BT WC 330 มล.",
    "en": "BORO BT WC Jar, 330 ml"
  },
  "description": {
    "th": "โหลแก้ว BORO BT WC 330 มล. จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "BORO BT WC 330ml. from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 180,
  "image": "/images/product-19727.jpg",
  "capacity": "330 ml"
}, {
  "id": "13134",
  "slug": "candle-stand-13356a-1",
  "sku": "075409",
  "name": {
    "th": "เชิงเทียน 13356A-1",
    "en": "Candle Holder 13356A-1"
  },
  "description": {
    "th": "เชิงเทียน 13356A-1 จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Candle Stand 13356A-1 from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "candle-stand",
  "brand": "LYNX",
  "price": 680,
  "image": "/images/product-13134.jpg"
}, {
  "id": "13146",
  "slug": "candle-stand-13620-1",
  "sku": "075515",
  "name": {
    "th": "เชิงเทียน 13620-1",
    "en": "Candle Holder 13620-1"
  },
  "description": {
    "th": "เชิงเทียน 13620-1 จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Candle Stand 13620-1 from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "candle-stand",
  "brand": "LYNX",
  "price": 150,
  "image": "/images/product-13146.jpg"
}, {
  "id": "13141",
  "slug": "candle-stand-14287-1",
  "sku": "075461",
  "name": {
    "th": "เชิงเทียน 14287-1",
    "en": "Candle Holder 14287-1"
  },
  "description": {
    "th": "เชิงเทียน 14287-1 จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Candle Stand 14287-1 from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "candle-stand",
  "brand": "LYNX",
  "price": 250,
  "image": "/images/product-13141.jpg"
}, {
  "id": "13130",
  "slug": "candle-stand-14737-1",
  "sku": "075362",
  "name": {
    "th": "เชิงเทียน 14737-1",
    "en": "Candle Holder 14737-1"
  },
  "description": {
    "th": "เชิงเทียน 14737-1 จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Candle Stand 14737-1 from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "candle-stand",
  "brand": "LYNX",
  "price": 250,
  "image": "/images/product-13130.jpg"
}, {
  "id": "13126",
  "slug": "candle-stand-3909-1",
  "sku": "075324",
  "name": {
    "th": "เชิงเทียน 3909-1",
    "en": "Candle Holder 3909-1"
  },
  "description": {
    "th": "เชิงเทียน 3909-1 จาก LYNX เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Candle Stand 3909-1 from LYNX. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "candle-stand",
  "brand": "LYNX",
  "price": 180,
  "image": "/images/product-13126.jpg"
}, {
  "id": "27671",
  "slug": "mason-27671",
  "sku": "27671",
  "name": {
    "th": "เมสัน จาร์ 450 ฝาเงิน",
    "en": "Mason Jar 450, Silver Lid"
  },
  "description": {
    "th": "เมสัน จาร์ 450 ฝาเงิน จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Mason Jar 450, Silver Lid from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 35,
  "image": "/images/product-27671.jpg"
}, {
  "id": "27670",
  "slug": "mason-27670",
  "sku": "27670",
  "name": {
    "th": "เมสัน จาร์ 450 ฝาขาว",
    "en": "Mason Jar 450, White Lid"
  },
  "description": {
    "th": "เมสัน จาร์ 450 ฝาขาว จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Mason Jar 450, White Lid from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 35,
  "image": "/images/product-27670.jpg"
}, {
  "id": "27567",
  "slug": "mason-045525",
  "sku": "045525",
  "name": {
    "th": "ขวด Mason เหลี่ยม 750 มล. ฝาทอง",
    "en": "Square Mason Bottle, 750 ml, Gold Lid"
  },
  "description": {
    "th": "ขวด Mason เหลี่ยม 750 มล. ฝาทอง จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Square Mason Bottle 750 ml, Gold Lid from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 75,
  "image": "/images/product-27567.jpg",
  "capacity": "750 ml"
}, {
  "id": "27557",
  "slug": "mason-047079",
  "sku": "047079",
  "name": {
    "th": "ขวด Mason เหลี่ยม 300 มล. Homemade ฝาทอง",
    "en": "Homemade Mason Bottle, 300 ml, Gold Lid"
  },
  "description": {
    "th": "ขวด Mason เหลี่ยม 300 มล. Homemade ฝาทอง จาก AMORN เลือกชมและสอบถามรายละเอียดเพิ่มเติมกับทีม JJGLASS",
    "en": "Homemade Square Mason Bottle 300 ml, Gold Lid from AMORN. Explore the collection and contact JJGLASS for further product details."
  },
  "category": "jar",
  "brand": "AMORN",
  "price": 45,
  "image": "/images/product-27557.jpg",
  "capacity": "300 ml"
}];
export const products: Product[] = catalogProducts.map(product => ({
  ...product,
  priceTiers: createDemoPriceTiers(product.price)
}));
export const brands: string[] = ["LYNX", "AMORN", "NUK", "LUCE", "FAWLES", "STONE ISLAND", "GREEN APPLE", "IDELITA", "KING CRYSTAL", "KING DEALAY", "Ocean"];
export const stores: Store[] = [{
  "id": "head-office",
  "name": {
    "th": "JJGLASS สำนักงานใหญ่",
    "en": "JJGLASS Head Office"
  },
  "address": {
    "th": "101, 103 ซอยบางบอน 1 (ซอย 7) แขวงคลองบางพราน เขตบางบอน กรุงเทพฯ 10150",
    "en": "101, 103 Bang Bon 1 (Soi 7), Khlong Bang Phran, Bang Bon, Bangkok 10150"
  },
  "phone": "0636616194",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=16446922608382431262"
}, {
  "id": "bangbon",
  "name": {
    "th": "JJGLASS บางบอน",
    "en": "JJGLASS Bang Bon"
  },
  "address": {
    "th": "69, 77–78 ซอยธีระ 3 แขวงคลองบางพราน เขตบางบอน กรุงเทพฯ 10150",
    "en": "69, 77–78 Soi Thira 3, Khlong Bang Phran, Bang Bon, Bangkok 10150"
  },
  "phone": "0686616194",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=9033258717822859516"
}, {
  "id": "sampheng",
  "name": {
    "th": "JJGLASS สำเพ็ง",
    "en": "JJGLASS Sampheng"
  },
  "address": {
    "th": "574 ซอยวานิช 1 แขวงสัมพันธวงศ์ เขตสัมพันธวงศ์ กรุงเทพฯ 10100",
    "en": "574 Soi Wanit 1, Samphanthawong, Bangkok 10100"
  },
  "phone": "0896688789",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=9049447080388428377"
}, {
  "id": "plaza",
  "name": {
    "th": "JJGLASS พลาซ่า",
    "en": "JJGLASS Plaza"
  },
  "address": {
    "th": "ล็อค E4 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900 (ริมถนนกำแพงเพชร 2 ใกล้อีซี่มันนี่)",
    "en": "Lot E4, Chatuchak, Bangkok 10900 (Kamphaeng Phet 2 Road, near Easy Money)"
  },
  "phone": "0988896290",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=1684577282755074864"
}, {
  "id": "section-9",
  "name": {
    "th": "JJGLASS J1 โครงการ 9",
    "en": "JJGLASS J1 Section 9"
  },
  "address": {
    "th": "โครงการ 9 ซอย 13/3 แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
    "en": "Section 9, Soi 13/3, Lat Yao, Chatuchak, Bangkok 10900"
  },
  "phone": "0988699226",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=15482852745088857754"
}, {
  "id": "section-7",
  "name": {
    "th": "JJGLASS J2 โครงการ 7",
    "en": "JJGLASS J2 Section 7"
  },
  "address": {
    "th": "ตลาดนัดสวนจตุจักร โครงการ 7 ซอย 4 แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
    "en": "Chatuchak Weekend Market, Section 7, Soi 4, Lat Yao, Chatuchak, Bangkok 10900"
  },
  "phone": "0984549668",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=4572594381210266775"
}, {
  "id": "lynx",
  "name": {
    "th": "LYNX Glassware",
    "en": "LYNX Glassware"
  },
  "address": {
    "th": "599 ถนนกำแพงเพชร 2 แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
    "en": "599 Kamphaeng Phet 2 Road, Chatuchak, Bangkok 10900"
  },
  "phone": "0988699550",
  "hours": { "th": "เปิดทุกวัน 08:30–18:30 น.", "en": "Open daily, 8:30 AM–6:30 PM" },
  "lineId": "@jjglass",
  "mapUrl": "https://www.google.com/maps?cid=11548193001011633568"
}];
export const contact = {
  "phone": "+66871841844",
  "phoneDisplay": "087 184 1844",
  "email": "info@jjglass.com",
  "lineId": "@jjglass",
  "lineUrl": "https://line.me/R/ti/p/@jjglass",
  "website": "https://jjglass.com",
  "address": {
    "th": "101, 103 ถนนบางบอน 1 แขวงคลองบางพราน เขตบางบอน กรุงเทพฯ 10150",
    "en": "101, 103 Bang Bon 1 Road, Khlong Bang Phran, Bang Bon, Bangkok 10150"
  },
  "hours": {
    "th": "ทุกวัน 08:30–18:30 น.",
    "en": "Every day, 08:30–18:30"
  }
};
