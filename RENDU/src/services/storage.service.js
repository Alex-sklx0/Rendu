import crypto from 'node:crypto';
import { supabase } from '../config/supabaseClient.js';

const BUCKET = 'Imagenes';

// Tipos de imagen permitidos → extensión del archivo
const TIPOS_PERMITIDOS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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
 * HU-08: sube una imagen (Data URI o Base64 puro) a Supabase Storage y
 * devuelve su URL pública.
 *
 * @param {string} imageInput - "data:image/png;base64,...." o Base64 puro (se asume JPEG)
 * @param {string} [folder='subproductos'] - Carpeta dentro del bucket
 * @param {string|null} [existingUrl=null] - URL de la imagen anterior; se borra tras subir la nueva
 * @returns {Promise<string|null>} URL pública, o null si no se envió imagen
 */
export async function uploadImageToStorage(imageInput, folder = 'subproductos', existingUrl = null) {
  if (!imageInput || typeof imageInput !== 'string') return null;

  // Si ya es una URL pública (el front reenvía la actual sin cambios), se conserva.
  if (/^https?:\/\//i.test(imageInput)) return imageInput;

  let mimeType = 'image/jpeg';
  let base64 = imageInput;

  if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([\w/+.-]+);base64,(.+)$/s);
    if (!match) {
      const err = new Error('Formato de imagen inválido: se esperaba un Data URI en Base64');
      err.status = 400;
      throw err;
    }
    mimeType = match[1].toLowerCase();
    base64 = match[2];
  }

  const ext = TIPOS_PERMITIDOS[mimeType];
  if (!ext) {
    const err = new Error('Tipo de imagen no permitido. Usa JPG, PNG, WEBP o GIF');
    err.status = 400;
    throw err;
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) {
    const err = new Error('La imagen está vacía o el Base64 es inválido');
    err.status = 400;
    throw err;
  }

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (errorSubida) {
    const err = new Error('Error al subir la imagen: ' + errorSubida.message);
    err.status = 500;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) {
    const err = new Error('No se pudo generar la URL pública de la imagen');
    err.status = 500;
    throw err;
  }

  // La imagen nueva ya está guardada: recién ahora se borra la anterior.
  if (existingUrl) await deleteStorageFile(existingUrl);

  return publicUrl;
}