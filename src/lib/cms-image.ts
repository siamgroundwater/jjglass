import { cmsId, type CmsMedia } from './cms-types';

export async function prepareCmsImage(file: File): Promise<CmsMedia> {
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
    const src = canvas.toDataURL('image/webp', .8);
    if (src.length > 1500000) throw new Error('Compressed image too large');
    return { id: cmsId('media'), name: file.name.replace(/\.[^.]+$/, '') + '.webp', src, alt: { th: '', en: '' }, uploaded: true, created: new Date().toISOString() };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
