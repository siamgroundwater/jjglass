import type { LocalizedText } from './i18n';

export const socialSectionCopy = {
  eyebrow: { th: 'เชื่อมต่อกับเรา', en: 'THE WORLD OF JJGLASS' },
  title: { th: 'ติดตามไอเดีย พบสิ่งที่คุณชอบ', en: 'Stay inspired. Stay connected.' },
  description: {
    th: 'พบกับ JJGLASS บนช่องทางที่คุณชอบ ทั้งเรื่องราวเครื่องแก้ว ไอเดีย และการเลือกซื้อ',
    en: 'Find JJGLASS on your favourite platforms for glassware, inspiration, and shopping.',
  },
  newTab: { th: 'เปิดในแท็บใหม่', en: 'Opens in a new tab' },
  loading: { th: 'กำลังโหลดหน้าต่างโซเชียล…', en: 'Loading social preview…' },
  unavailable: { th: 'ไม่สามารถโหลดตัวอย่างได้ในขณะนี้ เปิดดูจากช่องทางด้านล่างได้เลย', en: 'This preview is temporarily unavailable. You can open the profile below.' },
  tiktokUnavailable: { th: 'ตัวอย่าง TikTok ไม่พร้อมใช้งานชั่วคราว สามารถเปิดดูวิดีโอทั้งหมดบน TikTok ได้โดยตรง', en: 'The TikTok preview is temporarily unavailable. You can still view every video directly on TikTok.' },
  retry: { th: 'ลองโหลดอีกครั้ง', en: 'Try again' },
  previewHint: { th: 'หากหน้าต่างโซเชียลไม่แสดง สามารถเปิดดูผ่านปุ่มของแต่ละช่องทางได้', en: 'If a preview does not appear, use the button below it to open the profile.' },
  shopTitle: { th: 'เลือกซื้อกับ JJGLASS บน Shopee', en: 'Shop with JJGLASS on Shopee' },
} satisfies Record<string, LocalizedText>;

export type SocialPlatform = 'facebook' | 'tiktok' | 'shopee' | 'instagram';

type SocialChannel = {
  id: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  description: LocalizedText;
  action: LocalizedText;
};

export const socialChannels: readonly SocialChannel[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'JatujakGlass',
    url: 'https://www.facebook.com/JatujakGlass/',
    description: { th: 'ติดตามเรื่องราวและข่าวสารจาก JJGLASS', en: 'Keep in touch with news and stories from JJGLASS.' },
    action: { th: 'ติดตามบน Facebook', en: 'Follow on Facebook' },
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@jjglass_thailand',
    url: 'https://www.tiktok.com/@jjglass_thailand',
    description: { th: 'พบกับเครื่องแก้วในอีกมุมผ่านวิดีโอของเรา', en: 'See another side of glassware through our videos.' },
    action: { th: 'รับชมบน TikTok', en: 'Watch on TikTok' },
  },
  {
    id: 'shopee',
    name: 'Shopee',
    handle: 'jjglass_thailand',
    url: 'https://shopee.co.th/jjglass_thailand',
    description: { th: 'เลือกชมและสั่งซื้อจากร้าน JJGLASS บน Shopee', en: 'Browse and shop at the JJGLASS store on Shopee.' },
    action: { th: 'เลือกซื้อบน Shopee', en: 'Shop on Shopee' },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@jjglass_thailand',
    url: 'https://www.instagram.com/jjglass_thailand/',
    description: { th: 'เติมไอเดียให้ทุกมุมของคุณไปกับเครื่องแก้ว', en: 'Find glassware inspiration for your everyday spaces.' },
    action: { th: 'ติดตามบน Instagram', en: 'Follow on Instagram' },
  },
];
