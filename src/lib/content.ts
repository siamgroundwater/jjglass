import type { LocalizedText } from './i18n';
import { illustratedStoreGalleries } from './store-art';
type CatalogEntry = {
  title: string;
  description: LocalizedText;
  image: string;
  url: string;
};
type Story = {
  id: string;
  image: string;
  category: string;
  title: LocalizedText;
  label: LocalizedText;
  text: LocalizedText;
};
type PageIntroduction = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
};
export type ContentPage = 'brands' | 'catalog' | 'about' | 'stores' | 'contact' | 'inspiration';
// Conceptual illustrations; replace with verified branch photography when available.
export const storePreviewGalleries = illustratedStoreGalleries;
export const catalogs: CatalogEntry[] = [{
  "title": "LYNX Polycarbonate",
  "description": {
    "th": "คอลเลกชันโพลีคาร์บอเนต",
    "en": "The polycarbonate collection"
  },
  "image": "/images/catalog-polycarbonate.png",
  "url": "https://flipbooklets.com/pdfflipbooklets/lynx-polycarbonate#page1"
}, {
  "title": "Wooden Base",
  "description": {
    "th": "ฐานไม้สำหรับการจัดเสิร์ฟ",
    "en": "Wooden bases for your table"
  },
  "image": "/images/catalog-additional.png",
  "url": "https://flipbooklets.com/pdfflipbooklets/wooden-base#page1"
}, {
  "title": "JJGLASS × LYNX",
  "description": {
    "th": "เครื่องใช้สำหรับการจัดเสิร์ฟ",
    "en": "A collection for serving"
  },
  "image": "/images/catalog-wooden-base.png",
  "url": "https://flipbooklets.com/pdfflipbooklets/polycarbonate-theme-orange"
}, {
  "title": "Cake Cover",
  "description": {
    "th": "ฝาครอบเค้กและขนม",
    "en": "Covers for cakes and pastries"
  },
  "image": "/images/catalog-cake-cover.png",
  "url": "https://flipbooklets.com/pdfflipbooklets/cake-cover-copy#page1"
}, {
  "title": "Fancy Collection",
  "description": {
    "th": "เติมรายละเอียดให้โต๊ะของคุณ",
    "en": "A little character for your table"
  },
  "image": "/images/catalog-fancy.png",
  "url": "https://flipbooklets.com/pdfflipbooklets/fancy-double-page#page1"
}];
export const brandImages: Record<string, string> = {
  LYNX: 'brand-lynx.jpg',
  AMORN: 'brand-amorn.jpg',
  NUK: 'brand-nuk.jpg',
  LUCE: 'brand-luce.jpg',
  FAWLES: 'brand-fawles.png',
  'STONE ISLAND': 'brand-stone-island.png',
  'GREEN APPLE': 'brand-green-apple.png',
  IDELITA: 'brand-idelita.jpg',
  'KING CRYSTAL': 'brand-king-crystal.png',
  'KING DEALAY': 'brand-kling-dealay.png'
};
export const stories: Story[] = [{
  id: 'cafe',
  image: '/images/lifestyle-cafe.jpg',
  category: 'drinkware',
  title: {
    th: 'ทุกแก้ว มีเรื่องราวของร้านคุณ',
    en: 'Every glass tells your story.'
  },
  label: {
    th: 'คาเฟ่และร้านอาหาร',
    en: 'Cafés & restaurants'
  },
  text: {
    th: 'เลือกแก้วที่เข้ากับเครื่องดื่มและบรรยากาศของร้าน ตั้งแต่กาแฟแก้วโปรดไปจนถึงเมนูซิกเนเจอร์ พร้อมโหลเก็บวัตถุดิบให้มุมเคาน์เตอร์ดูเป็นระเบียบ',
    en: 'Find a glass that feels at home with your menu. From the daily coffee to your signature drink, thoughtful glassware brings character to every serve.'
  }
}, {
  id: 'wedding',
  image: '/images/lifestyle-wedding.jpg',
  category: 'vase',
  title: {
    th: 'รายละเอียดของวันที่พิเศษ',
    en: 'Details for a day to remember.'
  },
  label: {
    th: 'งานแต่งงานและงานจัดเลี้ยง',
    en: 'Weddings & celebrations'
  },
  text: {
    th: 'จัดวางแจกันหลากระดับเป็นจุดเด่นบนโต๊ะ ใช้เครื่องแก้วใสเพื่อให้สีสันของดอกไม้และแสงเทียนเป็นตัวเล่าเรื่องในวันสำคัญ',
    en: 'Build a centrepiece with vases at different heights. Clear glass lets flowers, candlelight and the occasion itself take centre stage.'
  }
}, {
  id: 'living',
  image: '/images/lifestyle-living.jpg',
  category: 'vase',
  title: {
    th: 'เติมความสวยงามให้วันธรรมดา',
    en: 'Make the everyday feel special.'
  },
  label: {
    th: 'บ้านและการใช้ชีวิต',
    en: 'Home & living'
  },
  text: {
    th: 'แจกันดอกไม้บนโต๊ะเล็ก หรือโหลแก้วที่เก็บของโปรด ช่วยเปลี่ยนมุมเดิมให้เป็นพื้นที่ที่อยากใช้เวลาอยู่ด้วยมากขึ้น',
    en: 'A vase of fresh stems. A glass jar holding your favourite things. Small, considered details can make a familiar corner feel new again.'
  }
}, {
  id: 'florist',
  image: '/images/lifestyle-florist.jpg',
  category: 'vase',
  title: {
    th: 'พื้นที่สำหรับความคิดสร้างสรรค์',
    en: 'Give your ideas room to bloom.'
  },
  label: {
    th: 'ร้านดอกไม้และนักจัดดอกไม้',
    en: 'Florists & flower lovers'
  },
  text: {
    th: 'ลองจับคู่ทรงแจกันกับรูปทรงของดอกไม้ เลือกปากแคบสำหรับกิ่งเดี่ยว หรือปากกว้างสำหรับช่อที่ต้องการพื้นที่ เพื่อสร้างงานจัดดอกไม้ในแบบของคุณ',
    en: 'Pair the shape of your vase with the shape of your arrangement. Try a narrow neck for a single stem, or an open silhouette for a generous bouquet.'
  }
}, {
  id: 'garden',
  image: '/images/lifestyle-garden.jpg',
  category: 'jar',
  title: {
    th: 'สวนเล็ก ๆ ในพื้นที่ของคุณ',
    en: 'A little world of green.'
  },
  label: {
    th: 'สวนและพื้นที่สีเขียว',
    en: 'Gardens & green spaces'
  },
  text: {
    th: 'ใช้โหลแก้วเป็นจุดเริ่มต้นของสวนจำลอง เลือกรูปทรงที่เห็นรายละเอียดของต้นไม้ และวางในมุมที่เหมาะกับแสงและการดูแล',
    en: 'Start a miniature garden with a glass vessel. Choose a shape that shows off the plants, then find a spot with the right light and room to care for them.'
  }
}];

// The five enduring decoration ideas from the previous JJGLASS homepage.
// Links on the new homepage lead to the matching sections of /inspiration.
export const homeJournalArticles: {
  id: 'living' | 'florist' | 'wedding' | 'cafe' | 'garden';
  image: string;
  title: LocalizedText;
  summary: LocalizedText;
}[] = [{
  id: 'living',
  image: '/images/lifestyle-living.jpg',
  title: { th: 'ห้องนั่งเล่น', en: 'Living room' },
  summary: {
    th: 'แจกันดอกไม้ แก้วเทียน ถาด และโหลแก้ว ช่วยเติมรายละเอียดให้ห้องนั่งเล่นเป็นพื้นที่ที่น่าพักผ่อนและต้อนรับแขก',
    en: 'Flower vases, candle holders, trays and glass jars add thoughtful details to a living room for relaxing and welcoming guests.'
  }
}, {
  id: 'florist',
  image: '/images/lifestyle-florist.jpg',
  title: { th: 'ร้านดอกไม้', en: 'Flower shop' },
  summary: {
    th: 'รูปทรงแจกันที่หลากหลายและเครื่องแก้วรูปแบบอื่น ๆ เปิดทางให้ร้านดอกไม้สร้างสรรค์งานจัดดอกไม้ในสไตล์ของตนเอง',
    en: 'Different vase shapes and other glass vessels give florists more ways to create arrangements in their own style.'
  }
}, {
  id: 'wedding',
  image: '/images/lifestyle-wedding.jpg',
  title: { th: 'งานแต่งงาน', en: 'Weddings' },
  summary: {
    th: 'แจกันทรงสูงช่วยสร้างจุดเด่นบนโต๊ะเลี้ยงรับรองและโต๊ะ VIP ในวันแต่งงาน',
    en: 'Tall vases can create a striking centrepiece for wedding reception and VIP tables.'
  }
}, {
  id: 'cafe',
  image: '/images/lifestyle-cafe.jpg',
  title: { th: 'คาเฟ่', en: 'Cafés' },
  summary: {
    th: 'แก้วหลากดีไซน์ช่วยนำเสนอเครื่องดื่มของร้าน พร้อมโหลเก็บวัตถุดิบ ถาด และฝาครอบเค้กสำหรับมุมคาเฟ่',
    en: 'A range of glass designs can present café drinks, while jars, trays and cake covers help furnish the counter.'
  }
}, {
  id: 'garden',
  image: '/images/lifestyle-garden.jpg',
  title: { th: 'สวนและพื้นที่สีเขียว', en: 'Gardens & green spaces' },
  summary: {
    th: 'โหลแก้วใช้สร้างสวนจำลองในบ้าน และเครื่องแก้วแบบแขวนช่วยเพิ่มพื้นที่สีเขียวในมุมที่มีพื้นที่จำกัด',
    en: 'Glass jars can hold miniature indoor gardens, while hanging glass vessels bring greenery to spaces with limited room.'
  }
}];
export const pageIntro: Record<ContentPage, PageIntroduction> = {
  brands: {
    eyebrow: {
      th: 'แบรนด์และคอลเลกชัน',
      en: 'Brands & Collections'
    },
    title: {
      th: 'ค้นพบแบรนด์ที่คุณชอบ',
      en: 'Discover Brands You’ll Love'
    },
    description: {
      th: 'เลือกชมเครื่องแก้วจากแต่ละแบรนด์\nพร้อมคอลเลกชันและดีไซน์ที่แตกต่างกัน',
      en: 'Explore glassware from different brands,\neach with its own collections and distinctive designs.'
    }
  },
  catalog: {
    eyebrow: {
      th: 'สำรวจรายละเอียดเพิ่มเติม',
      en: 'Explore in More Detail'
    },
    title: {
      th: 'พบกับคอลเลกชันในแคตตาล็อกของเรา',
      en: 'Discover Our Catalog Collections'
    },
    description: {
      th: 'เปิดดูเครื่องแก้วจากหลากหลายแบรนด์\nพร้อมรูปแบบและคอลเลกชันสำหรับการใช้งานที่ต่างกัน',
      en: 'Browse glassware from a variety of brands,\nwith designs and collections for different uses.'
    }
  },
  about: {
    eyebrow: {
      th: 'ทำความรู้จัก JJGLASS',
      en: 'GET TO KNOW JJGLASS'
    },
    title: {
      th: 'เครื่องแก้วสำหรับทุกเรื่องราว',
      en: 'Glassware for the way you live.'
    },
    description: {
      th: 'จากโต๊ะอาหารที่บ้าน สู่คาเฟ่ที่มีเอกลักษณ์ และงานสำคัญของคุณ เลือกเครื่องแก้วที่ทำให้ทุกรายละเอียดลงตัว',
      en: 'From a quiet table at home to a lively café or a special celebration. Find the glassware that brings it all together.'
    }
  },
  stores: {
    eyebrow: {
      th: 'พบกันที่หน้าร้าน',
      en: 'Visit Us In Store'
    },
    title: {
      th: 'เลือกดูสินค้าจริงได้ที่สาขาของเรา',
      en: 'Explore Our Products in Person'
    },
    description: {
      th: 'แวะชมเครื่องแก้วและสินค้าที่สาขา\nเพื่อเลือกแบบ ขนาด และดีไซน์ที่เหมาะกับคุณ',
      en: 'Visit our stores to browse glassware\nand choose the style, size, and design that suits you.'
    }
  },
  contact: {
    eyebrow: {
      th: 'ยินดีพูดคุยกับคุณ',
      en: 'LET’S TALK'
    },
    title: {
      th: 'ชิ้นที่ใช่ เริ่มจากการพูดคุย',
      en: 'Something in mind?'
    },
    description: {
      th: 'สอบถามสินค้า ราคา หรือเลือกเครื่องแก้วสำหรับธุรกิจของคุณ ติดต่อทีมงานได้ตามช่องทางด้านล่าง',
      en: 'A question about a product, an order or glassware for your business? Here is how to reach our team.'
    }
  },
  inspiration: {
    eyebrow: {
      th: 'ไอเดียจากการใช้งานจริง',
      en: 'Ideas Inspired by Everyday Use'
    },
    title: {
      th: 'เครื่องแก้วที่เข้ากับพื้นที่ของคุณ',
      en: 'Glassware That Fits Your Space'
    },
    description: {
      th: 'ค้นหาไอเดียสำหรับโต๊ะอาหาร มุมกาแฟ\nร้านอาหาร และการจัดเสิร์ฟในรูปแบบต่าง ๆ',
      en: 'Explore ideas for dining tables, coffee corners,\nrestaurants, and different serving styles.'
    }
  }
};
