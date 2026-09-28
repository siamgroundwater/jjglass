// Conservative display copy for products collected from jjglass.com.
// Source names and descriptions remain in data/jjglass-source for editorial review.

const categoryNames = {
  drinkware: { th: 'แก้วน้ำ', en: 'Drinking Glass' },
  stemware: { th: 'แก้วก้าน', en: 'Stemmed Glass' },
  vase: { th: 'แจกัน', en: 'Vase' },
  jar: { th: 'โหล', en: 'Jar' },
  tableware: { th: 'ภาชนะบนโต๊ะอาหาร', en: 'Tableware' },
  base: { th: 'ฐานรองหรือถาด', en: 'Base or Tray' },
  cover: { th: 'ฝาครอบ', en: 'Cover' },
  bottle: { th: 'ขวด', en: 'Bottle' },
  'candle-stand': { th: 'เชิงเทียน', en: 'Candle Holder' },
  others: { th: 'เครื่องแก้ว', en: 'Glassware' },
};

const englishNameTerms = [
  [/\bJUICE\s+DISPENSER\b/gi, 'เครื่องจ่ายน้ำผลไม้'],
  [/\bCAKE\s+STANDS?\b/gi, 'แท่นวางเค้ก'],
  [/\bCANDLE\s+(?:HOLDERS?|STANDS?)\b/gi, 'เชิงเทียน'],
  [/\bCHAMPAGNE\s+FLUTES?\b/gi, 'แก้วแชมเปญทรงฟลุต'],
  [/\bWINE\s+GLASSES?\b/gi, 'แก้วไวน์'],
  [/\bBEER\s+GLASSES?\b/gi, 'แก้วเบียร์'],
  [/\bDRINKING\s+GLASSES?\b/gi, 'แก้วน้ำ'],
  [/\bSTEMWARE\b/gi, 'แก้วก้าน'],
  [/\bTUMBLERS?\b/gi, 'แก้วน้ำ'],
  [/\bGOBLETS?\b/gi, 'แก้วกอบเล็ต'],
  [/\bPITCHERS?\b/gi, 'เหยือก'],
  [/\bDECANTERS?\b/gi, 'ขวดดีแคนเตอร์'],
  [/\bBOTTLES?\b/gi, 'ขวด'],
  [/\bVASES?\b/gi, 'แจกัน'],
  [/\bJARS?\b/gi, 'โหล'],
  [/\bBOWLS?\b/gi, 'ชาม'],
  [/\bPLATES?\b/gi, 'จาน'],
  [/\bGLASSES?\b/gi, 'แก้ว'],
  [/\bDOMES?\b/gi, 'ฝาครอบ'],
  [/\bCOVERS?\b/gi, 'ฝาครอบ'],
  [/\bTRAYS?\b/gi, 'ถาด'],
  [/\bSTANDS?\b/gi, 'แท่น'],
  [/\bCUPS?\b/gi, 'ถ้วย'],
  [/\bMUGS?\b/gi, 'แก้วมีหู'],
  [/\bSAUCERS?\b/gi, 'จานรอง'],
  [/\bSTEM\b/gi, 'ก้าน'],
  [/\bWITH\b/gi, 'พร้อม'],
  [/\bLIDS?\b/gi, 'ฝา'],
  [/\bCAPS?\b/gi, 'ฝา'],
  [/\bBEER\b/gi, 'เบียร์'],
  [/\bWINE\b/gi, 'ไวน์'],
  [/\bCHAMPAGNE\b/gi, 'แชมเปญ'],
  [/\bCHAMPANGE\b/gi, 'แชมเปญ'],
  [/\bWHISKY\b/gi, 'วิสกี้'],
  [/\bCOCKTAIL\b/gi, 'ค็อกเทล'],
  [/\bJUICE\b/gi, 'น้ำผลไม้'],
  [/\bWATER\b/gi, 'น้ำ'],
  [/\bCYLINDERS?\b/gi, 'ทรงกระบอก CYLINDER'],
  [/\bSQUARE\b/gi, 'ทรงสี่เหลี่ยม SQUARE'],
  [/\bROUND\b/gi, 'ทรงกลม ROUND'],
  [/\bCUBE\b/gi, 'ทรงลูกบาศก์ CUBE'],
  [/\bPYRAMID\b/gi, 'ทรงพีระมิด PYRAMID'],
  [/\bPENTAGON\b/gi, 'ทรงห้าเหลี่ยม PENTAGON'],
  [/\bOCTAGON\b/gi, 'ทรงแปดเหลี่ยม OCTAGON'],
  [/\bOVAL\b/gi, 'ทรงรี OVAL'],
  [/\bTRAPEZOID\b/gi, 'ทรงสี่เหลี่ยมคางหมู TRAPEZOID'],
  [/\bBLACK\b/gi, 'สีดำ'],
  [/\bWHITE\b/gi, 'สีขาว'],
  [/\bCLEAR\b/gi, 'ใส'],
  [/\bTRANSPARENT\b/gi, 'ใส'],
  [/\bBLUE\b/gi, 'สีน้ำเงิน'],
  [/\bGREEN\b/gi, 'สีเขียว'],
  [/\bYELLOW\b/gi, 'สีเหลือง'],
  [/\bRED\b/gi, 'สีแดง'],
  [/\bORANGE\b/gi, 'สีส้ม'],
  [/\bPURPLE\b/gi, 'สีม่วง'],
  [/\bPINK\b/gi, 'สีชมพู'],
  [/\b(?:GRAY|GREY)\b/gi, 'สีเทา'],
  [/\bAMBER\b/gi, 'สีอำพัน'],
  [/\bSILVER\b/gi, 'สีเงิน'],
  [/\bGOLD\b/gi, 'สีทอง'],
  [/\bCOPPER\b/gi, 'สีทองแดง'],
];

// Longest phrases come first so joined Thai product terms retain their meaning.
const thaiNameTerms = [
  ['แก้วขาแชมเปญ', 'Champagne Flute'],
  ['แก้วขามาร์ตินี่', 'Martini Glass'],
  ['แก้วขาโกเบท', 'Goblet'],
  ['แก้วไวน์แดง', 'Red Wine Glass'],
  ['แก้วไวน์ขาว', 'White Wine Glass'],
  ['แก้วค็อกเทล', 'Cocktail Glass'],
  ['แก้วแชมเปญ', 'Champagne Glass'],
  ['แก้วเบียร์', 'Beer Glass'],
  ['แก้วน้ำ', 'Drinking Glass'],
  ['แก้วขา', 'Stemmed Glass'],
  ['ชามโบว์', 'Bowl'],
  ['ฝาครอบเค้ก', 'Cake Dome'],
  ['เชิงเทียน', 'Candle Holder'],
  ['เมสัน จาร์', 'Mason Jar'],
  ['เมสัน', 'Mason'],
  ['ขวดอาหาร', 'Food Bottle'],
  ['ขวดน้ำผลไม้', 'Juice Bottle'],
  ['โหลยาดอง', 'Apothecary Jar'],
  ['โหล', 'Jar'],
  ['แจกัน', 'Vase'],
  ['เหยือก', 'Pitcher'],
  ['กร๊าฟ', 'Carafe'],
  ['ขวด', 'Bottle'],
  ['ชาม', 'Bowl'],
  ['ถ้วย', 'Cup'],
  ['จาน', 'Plate'],
  ['แก้ว', 'Glass'],
  ['พาน', 'Pedestal Tray'],
  ['หลอด', 'Straw'],
  ['หกเหลี่ยม', 'Hexagonal'],
  ['หยดน้ำ', 'Teardrop'],
  ['ปลากัด', 'Betta Fish'],
  ['เห็ด', 'Mushroom'],
  ['วงรี', 'Oval'],
  ['กลม', 'Round'],
  ['เหลี่ยม', 'Angular'],
  ['ทรงสูง', 'Tall'],
  ['ทรงเตี้ย', 'Short'],
  ['บิ๊ก', 'Big'],
  ['กลาง', 'Medium'],
  ['สูง', 'Tall'],
  ['เตี้ย', 'Short'],
  ['ใบไม้', 'Leaf'],
  ['ดอกบัว', 'Lotus'],
  ['ฝาทอง', 'Gold Lid'],
  ['ฝาเงิน', 'Silver Lid'],
  ['ฝาขาว', 'White Lid'],
  ['ลายจุด', 'Dot Pattern'],
  ['ลายแต้ม', 'Dotted Pattern'],
  ['เกล็ดแก้ว', 'Glass Flakes'],
  ['ฟอง', 'Bubble'],
  ['อาร์ท', 'Art'],
  ['สีดำ', 'Black'],
  ['สีขาว', 'White'],
  ['สีทอง', 'Gold'],
  ['สีเงิน', 'Silver'],
  ['น้ำเงิน', 'Blue'],
  ['เหลือง', 'Yellow'],
  ['เขียว', 'Green'],
  ['ม่วง', 'Purple'],
  ['ชมพู', 'Pink'],
  ['แดง', 'Red'],
  ['ส้ม', 'Orange'],
  ['เทา', 'Gray'],
  ['ดำ', 'Black'],
  ['ขาว', 'White'],
  ['ฟ้า', 'Sky Blue'],
  ['ชา', 'Tea Tint'],
  ['ทะเล', 'Sea'],
  ['หมอก', 'Mist'],
  ['ใส', 'Clear'],
  ['ลาย', 'Pattern'],
  ['ซม.', 'cm'],
  ['มล.', 'ml'],
  ['ลิตร', 'L'],
];

const measurementTerms = [
  [/\bMaximum\s+Diameter\b/gi, 'เส้นผ่านศูนย์กลางสูงสุด'],
  [/\bDiameter\b/gi, 'เส้นผ่านศูนย์กลาง'],
  [/\bCapacity\b/gi, 'ความจุ'],
  [/\bHeight\b/gi, 'ความสูง'],
  [/\bWidth\b/gi, 'ความกว้าง'],
  [/\bLength\b/gi, 'ความยาว'],
  [/\bDepth\b/gi, 'ความลึก'],
  [/\bBase\b/gi, 'ฐาน'],
];

const hasThai = value => /[\u0E00-\u0E7F]/.test(value);
const hasLatin = value => /[A-Za-z]/.test(value);

function decodeEntities(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ', '&#39;': "'" };
    const lower = entity.toLowerCase();
    if (named[lower]) return named[lower];
    const number = lower.startsWith('&#x') ? parseInt(lower.slice(3, -1), 16) : parseInt(lower.slice(2, -1), 10);
    return Number.isInteger(number) && number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  });
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function categoryName(category) {
  const id = typeof category === 'string' ? category : category?.id;
  if (id && categoryNames[id]) return categoryNames[id];
  if (category?.name?.th && category?.name?.en) return category.name;
  if (category?.th && category?.en) return category;
  return categoryNames.others;
}

function thaiFromEnglish(sourceName, category) {
  let result = sourceName;
  for (const [pattern, replacement] of englishNameTerms) result = result.replace(pattern, ` ${replacement} `);
  result = result.replace(/(\d+(?:\.\d+)?)\s*cm\b\.?/gi, '$1 ซม.');
  result = result.replace(/(\d+(?:\.\d+)?)\s*ml\b\.?/gi, '$1 มล.');
  result = result.replace(/(\d+(?:\.\d+)?)\s*oz\b\.?/gi, '$1 ออนซ์');
  result = result.replace(/(\d+(?:\.\d+)?)\s*l\b\.?/gi, '$1 ลิตร');
  result = result.replace(/\s+/g, ' ').trim();
  if (category.th === 'แจกัน' && result.includes('แจกัน') && !result.startsWith('แจกัน')) {
    result = `แจกัน ${result.replace('แจกัน', '').trim()}`;
  }
  result = result.replace(/\s+/g, ' ').trim();
  if (!/(?:แก้ว|แจกัน|โหล|ขวด|ชาม|จาน|เหยือก|เชิงเทียน|ฝาครอบ|แท่น|ถาด|ภาชนะ|ฐานรอง|ถ้วย)/.test(result)) {
    result = `${category.th} ${result}`;
  }
  return result;
}

function englishFromThai(sourceName, source, category) {
  let result = sourceName;
  for (const [thai, english] of thaiNameTerms) result = result.replaceAll(thai, ` ${english} `);
  // Untranslated modifiers are omitted rather than guessed. Codes, models,
  // quantities and units from the original name remain visible.
  result = result.replace(/[\u0E00-\u0E7F]+/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+-\s+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  result = result.replace(/^[-,.;:–—/\s]+|[-,.;:–—/\s]+$/g, '');
  if (!/\b(?:Glass|Goblet|Flute|Vase|Jar|Bottle|Bowl|Cup|Plate|Pitcher|Carafe|Tray|Straw|Dome|Holder|Stemware|Tableware)\b/i.test(result)) {
    result = `${category.en} ${result}`.trim();
  }
  if (!/[A-Za-z0-9]/.test(sourceName) || !/[\dA-Za-z]/.test(result.replace(category.en, '').trim())) {
    result = `${result} ${source?.sku ? `(SKU ${source.sku})` : `#${source?.id || 'unknown'}`}`;
  }
  return result.replace(/\s+/g, ' ').trim();
}

function thaiMeasurements(value) {
  let result = value;
  for (const [pattern, replacement] of measurementTerms) result = result.replace(pattern, replacement);
  return result
    .replace(/(\d+(?:\.\d+)?)\s*cm\b\.?/gi, '$1 ซม.')
    .replace(/(\d+(?:\.\d+)?)\s*ml\b\.?/gi, '$1 มล.')
    .replace(/(\d+(?:\.\d+)?)\s*oz\b\.?/gi, '$1 ออนซ์');
}

function englishDetail(value) {
  const cleaned = cleanText(value);
  if (!hasThai(cleaned) && hasLatin(cleaned)) return cleaned;
  return cleaned.split('\n').filter(line => !hasThai(line) && hasLatin(line)).join('\n').trim();
}

function lidColorConflicts(sourceName, description) {
  const silverTitle = /ฝาเงิน|silver\s+lid/i.test(sourceName);
  const goldTitle = /ฝาทอง|gold\s+lid/i.test(sourceName);
  const silverText = /ฝา(?:อะลูมิเนียม|อลูมิเนียม)?สีเงิน|ฝาเงิน|silver\s+lid/i.test(description);
  const goldText = /ฝา(?:อะลูมิเนียม|อลูมิเนียม)?สีทอง|ฝาทอง|gold\s+lid/i.test(description);
  return (silverTitle && goldText) || (goldTitle && silverText);
}

/**
 * Create bilingual presentation copy from one normalized source product.
 * `category` may be a mapped catalog ID or an object containing Thai/English names.
 * Factual source copy is retained; this is not a substitute for editorial translation.
 */
export function localizeSourceProduct(source, category) {
  const label = categoryName(category);
  const sourceName = cleanText(source?.sourceName) || `Product ${source?.id || ''}`.trim();
  const shortDescription = cleanText(source?.shortDescription);
  const sourceDescription = cleanText(source?.description);
  const name = hasThai(sourceName)
    ? { th: sourceName, en: englishFromThai(sourceName, source, label) }
    : { th: thaiFromEnglish(sourceName, label), en: sourceName };

  const conflictingShort = lidColorConflicts(sourceName, shortDescription);
  const thaiSource = !conflictingShort && hasThai(shortDescription)
    ? shortDescription
    : !lidColorConflicts(sourceName, sourceDescription) && hasThai(sourceDescription)
      ? sourceDescription
      : '';
  const measuredThai = thaiMeasurements(thaiSource || englishDetail(sourceDescription) || englishDetail(shortDescription));
  const th = measuredThai || `${name.th}${source?.sku ? `\nรหัสสินค้า ${source.sku}` : ''}`;
  const en = englishDetail(sourceDescription)
    || englishDetail(shortDescription)
    || `${name.en}${source?.sku ? `\nProduct code: ${source.sku}` : ''}`;

  return { name, description: { th, en } };
}
