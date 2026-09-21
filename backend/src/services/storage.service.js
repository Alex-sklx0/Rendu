// Servicio para manejo de archivos e imagenes en Supabase Storage

import crypto from 'node:crypto';
import { supabase } from '../config/db.js';

// Extrae la ruta de un archivo dentro del bucket desde su URL publica
export function extractStoragePath(url, bucketName = 'Imagenes') {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${bucketName}/`;
  if (!url.includes(marker)) return null;
  const parts = url.split(marker);
  if (!parts[1]) return null;
  const pathWithoutQuery = parts[1].split('?')[0];
  return decodeURIComponent(pathWithoutQuery);
}

// Elimina un archivo de Supabase Storage usando su URL o ruta
export async function deleteStorageFile(urlOrPath, bucketName = 'Imagenes') {
  if (!urlOrPath || typeof urlOrPath !== 'string') return;
  
  const path = (urlOrPath.includes('http://') || urlOrPath.includes('https://'))
    ? extractStoragePath(urlOrPath, bucketName)
    : urlOrPath;

  if (!path) return;

  try {
    const { data, error } = await supabase.storage.from(bucketName).remove([path]);
    if (error) {
      console.warn(`[StorageService] Error al eliminar archivo '${path}':`, error.message);
    } else {
      console.log(`[StorageService] Archivo '${path}' eliminado exitosamente.`, data);
    }
  } catch (err) {
    console.warn(`[StorageService] Excepción al eliminar archivo '${path}':`, err.message);
  }
}

// Sube o reemplaza una imagen en Supabase Storage
export async function uploadImageToStorage(imageInput, folder = 'subproductos', existingUrl = null) {
  if (!imageInput || (typeof imageInput !== 'string' && !Buffer.isBuffer(imageInput))) {
    return null;
  }

  // Si ya es una URL valida, no la procesamos de nuevo
  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    return imageInput;
  }

  let buffer;
  let ext = 'jpg';
  let mimeType = 'image/jpeg';

  // Convertir formato base64 o buffer a archivo usable
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

  // Borrar imagen anterior en caso de reemplazo
  if (existingUrl) {
    await deleteStorageFile(existingUrl, 'Imagenes');
  }

  // Generar nombre unico y subir archivo
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

  // Generar URL publica para guardar en la BD
  const { data: publicUrlData } = supabase.storage
    .from('Imagenes')
    .getPublicUrl(uploadData.path);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error('No se pudo generar la URL pública de la imagen.');
  }

  return publicUrl;
}

// Helper para subir imagen y registrar post
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

    // Subir imagen al bucket
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

    // Crear registro en la tabla indicada
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
