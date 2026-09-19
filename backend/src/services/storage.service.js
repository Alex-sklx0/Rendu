import crypto from 'node:crypto';
import { supabase } from '../config/db.js';

/**
 * Extrae la ruta relativa dentro del bucket (ej. "subproductos/uuid.png")
 * a partir de cualquier URL pública de Supabase Storage.
 *
 * @param {string} url - URL pública completa de Supabase Storage
 * @param {string} [bucketName='Imagenes'] - Nombre del bucket
 * @returns {string|null} Ruta relativa dentro del bucket
 */
export function extractStoragePath(url, bucketName = 'Imagenes') {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${bucketName}/`;
  if (!url.includes(marker)) return null;
  const parts = url.split(marker);
  if (!parts[1]) return null;
  const pathWithoutQuery = parts[1].split('?')[0];
  return decodeURIComponent(pathWithoutQuery);
}

/**
 * Elimina un archivo de Supabase Storage a partir de su URL pública o su path relativo.
 *
 * @param {string} urlOrPath - URL pública completa o path relativo
 * @param {string} [bucketName='Imagenes'] - Nombre del bucket
 */
export async function deleteStorageFile(urlOrPath, bucketName = 'Imagenes') {
  if (!urlOrPath || typeof urlOrPath !== 'string') return;
  
  const path = (urlOrPath.includes('http://') || urlOrPath.includes('https://'))
    ? extractStoragePath(urlOrPath, bucketName)
    : urlOrPath;

  if (!path) return;

  try {
    const { data, error } = await supabase.storage.from(bucketName).remove([path]);
    if (error) {
      console.warn(`[StorageService] Error al eliminar archivo '${path}' de Supabase Storage:`, error.message);
    } else {
      console.log(`[StorageService] Archivo '${path}' eliminado exitosamente de Supabase Storage.`, data);
    }
  } catch (err) {
    console.warn(`[StorageService] Excepción al eliminar archivo '${path}':`, err.message);
  }
}

/**
 * Sube una nueva imagen o reemplaza una existente en Supabase Storage.
 * Si se especifica `existingUrl`, borra automáticamente la imagen vieja de Storage antes de guardar la nueva.
 *
 * @param {string|Buffer} imageInput - Base64, Data URI o Buffer de la imagen
 * @param {string} [folder='subproductos'] - Carpeta relativa dentro del bucket
 * @param {string|null} [existingUrl=null] - URL previa existente (para eliminar la imagen vieja)
 * @returns {Promise<string|null>} URL pública de la nueva imagen en Supabase Storage
 */
export async function uploadImageToStorage(imageInput, folder = 'subproductos', existingUrl = null) {
  if (!imageInput || (typeof imageInput !== 'string' && !Buffer.isBuffer(imageInput))) {
    return null;
  }

  // Si la entrada ya es una URL HTTP/HTTPS pública existente y no ha cambiado, mantenerla
  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    return imageInput;
  }

  let buffer;
  let ext = 'jpg';
  let mimeType = 'image/jpeg';

  if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    const matches = imageInput.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
      buffer = Buffer.from(matches[3], 'base64');
    } else {
      const base64Parts = imageInput.split(',');
      buffer = Buffer.from(base64Parts[1] || base64Parts[0], 'base64');
    }
  } else if (typeof imageInput === 'string') {
    buffer = Buffer.from(imageInput, 'base64');
  } else {
    buffer = imageInput;
  }

  // 1. SI EXISTE UNA IMAGEN VIEJA: Borrarla de Supabase Storage
  if (existingUrl) {
    await deleteStorageFile(existingUrl, 'Imagenes');
  }

  // 2. SUBIR LA NUEVA IMAGEN con ID único fresco (para refrescar caché inmediatamente)
  const uniqueFileName = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('Imagenes')
    .upload(uniqueFileName, buffer, {
      contentType: mimeType,
      upsert: true
    });

  if (uploadError) {
    console.error('[StorageService] Error al subir a Supabase Storage:', uploadError.message);
    throw new Error(`Error al subir imagen a Storage: ${uploadError.message}`);
  }

  // 3. OBTENER Y RETORNAR LA NUEVA URL PÚBLICA
  const { data: publicUrlData } = supabase.storage
    .from('Imagenes')
    .getPublicUrl(uploadData.path);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error('No se pudo generar la URL pública de la imagen.');
  }

  return publicUrl;
}

/**
 * Servicio completo para verificar usuario autenticado, subir/actualizar imagen en Supabase Storage y crear registro en BD.
 */
export async function subirImagenYCrearPost({
  fileBuffer,
  originalName = 'imagen.jpg',
  mimeType = 'image/jpeg',
  authToken,
  userId,
  tableName = 'posts',
  extraData = {}
}) {
  try {
    let authenticatedUser = null;

    if (authToken) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);
      if (userError || !user) {
        throw new Error('Debes iniciar sesión para publicar.');
      }
      authenticatedUser = user;
    } else if (userId) {
      authenticatedUser = { id: userId };
    } else {
      throw new Error('Debes iniciar sesión para publicar.');
    }

    const currentUserId = authenticatedUser.id;
    const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${currentUserId}/${crypto.randomUUID()}.${fileExt}`;

    let payload = fileBuffer;
    if (typeof fileBuffer === 'string' && fileBuffer.startsWith('data:')) {
      const base64Data = fileBuffer.split(',')[1];
      payload = Buffer.from(base64Data, 'base64');
    } else if (typeof fileBuffer === 'string') {
      payload = Buffer.from(fileBuffer, 'base64');
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Imagenes')
      .upload(filePath, payload, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Error al subir la imagen a Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('Imagenes')
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrlData.publicUrl;
    if (!imageUrl) {
      throw new Error('No se pudo generar la URL pública de la imagen.');
    }

    const rowToInsert = tableName === 'subproductos'
      ? {
          foto_url: imageUrl,
          ...extraData
        }
      : {
          user_id: currentUserId,
          image_url: imageUrl,
          ...extraData
        };

    const { data: dbData, error: dbError } = await supabase
      .from(tableName)
      .insert([rowToInsert])
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('Imagenes').remove([filePath]);
      throw new Error(`Error al guardar el registro en la base de datos: ${dbError.message}`);
    }

    return {
      imageUrl,
      dbRecord: dbData
    };
  } catch (error) {
    console.error('[StorageService] Error en el proceso:', error.message);
    throw error;
  }
}
