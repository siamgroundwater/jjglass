import { cmsId, type CmsMedia } from './cms-types';

export async function prepareCmsImage(file: File, options: { maxDataUrlLength?: number } = {}): Promise<CmsMedia> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024) throw new Error('Invalid image');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = objectUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 50000000) throw new Error('Image too large');
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image conversion unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const limit = options.maxDataUrlLength ?? 1500000;
    let src = canvas.toDataURL('image/webp', .8);
    let quality = .8;
    for (let attempt = 0; src.length > limit && attempt < 8; attempt += 1) {
      if (Math.max(canvas.width, canvas.height) > 700) {
        canvas.width = Math.max(1, Math.round(canvas.width * .82));
        canvas.height = Math.max(1, Math.round(canvas.height * .82));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      } else quality = Math.max(.55, quality - .08);
      src = canvas.toDataURL('image/webp', quality);
    }
    if (src.length > limit) throw new Error('Compressed image too large');
    return { id: cmsId('media'), name: file.name.replace(/\.[^.]+$/, '') + '.webp', src, alt: { th: '', en: '' }, uploaded: true, created: new Date().toISOString() };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function withPreparedCmsMedia(media: CmsMedia[], pending: CmsMedia[], sources: Iterable<string>, alt: CmsMedia['alt']): CmsMedia[] {
  const referenced = new Set(sources);
  const saved = new Set(media.map(item => item.src));
  const additions = pending.filter(item => {
    if (!referenced.has(item.src) || saved.has(item.src)) return false;
    saved.add(item.src);
    return true;
  });
  return [...additions.map(item => ({ ...item, alt: { ...alt } })), ...media];
}
