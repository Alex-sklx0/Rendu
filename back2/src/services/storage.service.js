import crypto from 'node:crypto';
import { supabase } from '../config/supabaseClient.js';

const BUCKET = 'Imagenes';

/**
 * Extrae la ruta relativa dentro del bucket (ej. "subproductos/uuid.jpg")
 * a partir de una URL pública de Supabase Storage.
 */
function extractStoragePath(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${BUCKET}/`;
  if (!url.includes(marker)) return null;
  const parts = url.split(marker);
  if (!parts[1]) return null;
  return decodeURIComponent(parts[1].split('?')[0]);
}

/**
 * Elimina un archivo de Supabase Storage a partir de su URL pública.
 * No lanza error si falla — solo lo registra (borrar la imagen vieja
 * nunca debe tumbar la operación principal, como actualizar el subproducto).
 */
export async function deleteStorageFile(url) {
  const path = extractStoragePath(url);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.warn(`[StorageService] No se pudo eliminar '${path}':`, error.message);
  }
}

/**
 * Sube una imagen recibida como Data URI y devuelve su URL pública.
 */
export async function uploadImageToStorage(imageBase64, folder = 'subproductos', previousUrl = null) {
  const match = String(imageBase64).match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
  if (!match) {
    const err = new Error('La imagen debe ser una Data URI válida en formato PNG, JPEG o WebP');
    err.status = 400;
    throw err;
  }

  const [, contentType, extension, encoded] = match;
  const path = `${folder}/${crypto.randomUUID()}.${extension === 'jpeg' ? 'jpg' : extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(encoded, 'base64'), {
    contentType,
    upsert: false,
  });

  if (error) {
    const err = new Error(`No se pudo subir la imagen: ${error.message}`);
    err.status = 500;
    throw err;
  }

  if (previousUrl) await deleteStorageFile(previousUrl);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}