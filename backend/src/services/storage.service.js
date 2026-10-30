import crypto from 'node:crypto';
import { supabase } from '../config/supabaseClient.js';

const BUCKET = 'Imagenes';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXTENSIONES = {
  'image/jpeg': 'jpg',
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

/** Detecta el tipo real mirando los primeros bytes del archivo (no lo que declara el cliente). */
function detectarTipo(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.length >= 6 && ['GIF87a', 'GIF89a'].includes(buf.subarray(0, 6).toString('ascii'))) return 'image/gif';
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

function errorImagen(mensaje) {
  const err = new Error(mensaje);
  err.status = 400;
  return err;
}

/**
 * HU-08: sube una imagen (Data URI o Base64 puro) a Supabase Storage y devuelve su URL pública.
 * Valida tamaño máximo y tipo real. No acepta URLs externas: la imagen debe venir en Base64.
 *
 * @param {string} imageInput - "data:image/png;base64,...." o Base64 puro
 * @param {string} [folder='subproductos'] - Carpeta dentro del bucket
 * @param {string|null} [existingUrl=null] - URL de la imagen anterior; se borra tras subir la nueva
 * @returns {Promise<string|null>} URL pública, o null si no se envió imagen
 */
export async function uploadImageToStorage(imageInput, folder = 'subproductos', existingUrl = null) {
  if (!imageInput || typeof imageInput !== 'string') return null;

  if (/^https?:\/\//i.test(imageInput)) {
    throw errorImagen('Envía la imagen en Base64, no una URL');
  }

  let base64 = imageInput;
  if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([\w/+.-]+);base64,(.+)$/s);
    if (!match) throw errorImagen('Formato de imagen inválido: se esperaba un Data URI en Base64');
    base64 = match[2];
  }

  // Tamaño estimado antes de decodificar
  if (Math.floor((base64.length * 3) / 4) > MAX_BYTES) {
    throw errorImagen('La imagen supera el tamaño máximo de 5 MB');
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw errorImagen('La imagen está vacía o el Base64 es inválido');
  if (buffer.length > MAX_BYTES) throw errorImagen('La imagen supera el tamaño máximo de 5 MB');

  const mimeType = detectarTipo(buffer);
  if (!mimeType) throw errorImagen('Tipo de imagen no permitido. Usa JPG, PNG, WEBP o GIF');

  const path = `${folder}/${crypto.randomUUID()}.${EXTENSIONES[mimeType]}`;

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