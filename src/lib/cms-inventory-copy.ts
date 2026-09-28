import type { Locale } from './i18n';

const en = {
  title: 'Stock, ready for the day.', intro: 'Receive deliveries, record stock counts, and review every adjustment before saving.',
  inventory: 'Stock management', all: 'All products', attention: 'Published stock alerts', low: 'Low stock', out: 'Out of stock', healthy: 'Above alert threshold',
  history: 'Recent stock adjustments', historyHint: 'The latest stock changes in this workspace activity log.', noHistory: 'Your saved stock adjustments will appear here with quantities and reasons.',
  threshold: 'Low-stock alert at {count} units or fewer. Change this in Settings.',
  search: 'Search name, SKU, or brand', allBrands: 'All brands', sort: 'Sort by', recommended: 'Catalog order', name: 'Name A–Z', stockAsc: 'Stock: lowest first', stockDesc: 'Stock: highest first', priceAsc: 'Price: lowest first', priceDesc: 'Price: highest first',
  export: 'Export results (CSV)', exportHint: 'Exports all matching saved products, across every page.',
  adjust: 'Adjust stock', receive: 'Receive stock', remove: 'Remove stock', count: 'Set counted stock', mode: 'Adjustment type', amount: 'Quantity', reason: 'Reason / reference', reasonHint: 'e.g. Delivery INV-104, damaged glass, or stock count',
  current: 'Current stock', after: 'After saving', pending: 'Pending adjustments', review: 'Review changes', save: 'Save stock changes', discard: 'Discard changes', cancelReview: 'Continue editing',
  reviewHint: 'Check quantities and reasons below. All changes will be saved together.', invalid: 'Enter a valid whole quantity and a reason. Stock cannot fall below zero, and the new stock must differ from the current stock.',
  conflict: 'A product changed in another tab or is no longer available. Remove its pending adjustment and check its current stock before trying again.',
  saved: 'Stock updated', units: 'units', noChanges: 'Choose Adjust stock on a product to begin.',
  help: '1. Find a product · 2. Enter quantity and reason · 3. Review and save',
  pendingHint: 'Changes stay pending while you search or change pages. Nothing is saved until you review and confirm.',
  changed: 'Unsaved changes', clean: 'No unsaved changes', leave: 'You have unsaved changes. Leave this page and discard them?',
  guide: 'Product checklist', guideHint: 'Complete both names and add 3–5 images, then set the SKU, price, stock, category and brand. Save as a draft until ready.',
  stockLink: 'Manage stock', savedStock: 'Saved stock', noChange: 'No stock change', results: '{count} matching products',
};
const th: Record<keyof typeof en, string> = {
  title: 'จัดการสต็อกให้พร้อมขาย', intro: 'รับสินค้าเข้า ตรวจนับ และตรวจสอบการปรับสต็อกก่อนบันทึกทุกครั้ง',
  inventory: 'จัดการสต็อก', all: 'สินค้าทั้งหมด', attention: 'สต็อกที่เผยแพร่และต้องดูแล', low: 'สินค้าใกล้หมด', out: 'สินค้าหมด', healthy: 'สูงกว่าเกณฑ์แจ้งเตือน',
  history: 'การปรับสต็อกล่าสุด', historyHint: 'รายการปรับสต็อกล่าสุดจากประวัติการใช้งานในพื้นที่นี้', noHistory: 'เมื่อบันทึกสต็อก จะแสดงจำนวนและเหตุผลที่นี่',
  threshold: 'แจ้งเตือนเมื่อเหลือ {count} ชิ้นหรือน้อยกว่า เปลี่ยนเกณฑ์ได้ที่ตั้งค่า',
  search: 'ค้นหาชื่อ รหัส SKU หรือแบรนด์', allBrands: 'ทุกแบรนด์', sort: 'เรียงตาม', recommended: 'ลำดับในแคตตาล็อก', name: 'ชื่อสินค้า ก–ฮ / A–Z', stockAsc: 'สต็อก: น้อยไปมาก', stockDesc: 'สต็อก: มากไปน้อย', priceAsc: 'ราคา: ต่ำไปสูง', priceDesc: 'ราคา: สูงไปต่ำ',
  export: 'ส่งออกผลลัพธ์ (CSV)', exportHint: 'ส่งออกสินค้าที่บันทึกแล้วและตรงกับตัวกรองจากทุกหน้า',
  adjust: 'ปรับสต็อก', receive: 'รับสินค้าเข้า', remove: 'นำสินค้าออก', count: 'ระบุยอดตรวจนับ', mode: 'วิธีปรับสต็อก', amount: 'จำนวน', reason: 'เหตุผล / เลขอ้างอิง', reasonHint: 'เช่น รับสินค้า INV-104 แก้วชำรุด หรือตรวจนับสต็อก',
  current: 'สต็อกปัจจุบัน', after: 'หลังบันทึก', pending: 'รายการรอบันทึก', review: 'ตรวจสอบการเปลี่ยนแปลง', save: 'บันทึกสต็อก', discard: 'ยกเลิกการเปลี่ยนแปลง', cancelReview: 'กลับไปแก้ไข',
  reviewHint: 'ตรวจสอบจำนวนและเหตุผลด้านล่าง การเปลี่ยนแปลงทั้งหมดจะบันทึกพร้อมกัน', invalid: 'กรุณากรอกจำนวนเต็มและเหตุผล สต็อกต้องไม่ติดลบและต้องต่างจากจำนวนปัจจุบัน',
  conflict: 'สินค้าถูกแก้ไขในแท็บอื่นหรือไม่อยู่ในรายการแล้ว กรุณานำรายการรอบันทึกนั้นออกและตรวจสอบสต็อกปัจจุบันก่อนลองใหม่',
  saved: 'ปรับสต็อกแล้ว', units: 'ชิ้น', noChanges: 'เลือกปรับสต็อกบนสินค้าที่ต้องการเพื่อเริ่มต้น',
  help: '1. ค้นหาสินค้า · 2. กรอกจำนวนและเหตุผล · 3. ตรวจสอบและบันทึก',
  pendingHint: 'ค้นหาหรือเปลี่ยนหน้าได้โดยรายการยังรอบันทึก ข้อมูลจะบันทึกเมื่อคุณตรวจสอบและยืนยันแล้วเท่านั้น',
  changed: 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก', clean: 'ไม่มีการเปลี่ยนแปลงที่รอบันทึก', leave: 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้และยกเลิกการเปลี่ยนแปลงหรือไม่?',
  guide: 'ข้อมูลที่ต้องเตรียม', guideHint: 'กรอกชื่อทั้งสองภาษา เพิ่มรูป 3–5 รูป แล้วระบุรหัส SKU ราคา สต็อก หมวดหมู่ และแบรนด์ บันทึกเป็นฉบับร่างได้จนกว่าจะพร้อมเผยแพร่',
  stockLink: 'จัดการสต็อก', savedStock: 'สต็อกที่บันทึกแล้ว', noChange: 'สต็อกไม่เปลี่ยนแปลง', results: 'พบ {count} สินค้า',
};
export const cmsInventoryCopy: Record<Locale, Record<keyof typeof en, string>> = { th, en };
