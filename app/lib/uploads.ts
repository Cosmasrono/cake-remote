import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
export class ImageUploadError extends Error {}
export async function saveImage(file: File, folder: 'cakes' | 'courses' | 'custom-orders') {
  if (!(file instanceof File) || file.size < 1 || file.size > 5 * 1024 * 1024) throw new ImageUploadError('Choose an image smaller than 5 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  const extension = jpeg && file.type === 'image/jpeg' ? 'jpg' : png && file.type === 'image/png' ? 'png' : webp && file.type === 'image/webp' ? 'webp' : null;
  if (!extension) throw new ImageUploadError('Choose a JPEG, PNG, or WebP image.');
  const directory = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(directory, { recursive: true });
  const filename = randomUUID() + '.' + extension;
  await writeFile(path.join(directory, filename), bytes);
  return '/uploads/' + folder + '/' + filename;
}

