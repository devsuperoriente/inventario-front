import { apiRequest } from '../../../services/apiClient.js'

const endpoint = '/lotes'
const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadBatchImage(file) {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error(
      'Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET para subir imágenes.',
    )
  }

  const uploadData = new FormData()
  uploadData.set('file', file)
  uploadData.set('upload_preset', cloudinaryUploadPreset)

  let response
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudinaryCloudName)}/image/upload`,
      { method: 'POST', body: uploadData },
    )
  } catch (error) {
    throw new Error('No se pudo conectar con Cloudinary para subir la imagen.', { cause: error })
  }

  let result
  try {
    result = await response.json()
  } catch (error) {
    throw new Error('Cloudinary devolvió una respuesta inválida.', { cause: error })
  }

  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary rechazó la imagen.')
  }
  if (typeof result.secure_url !== 'string' || result.secure_url.length === 0) {
    throw new Error('Cloudinary no devolvió la URL segura de la imagen.')
  }

  return result.secure_url
}

export function getBatches() {
  return apiRequest(endpoint)
}

export function createBatch(batchData) {
  console.log(batchData)
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(batchData),
  })
}

export function updateBatch(id, batchData) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(batchData),
  })
}

export function deleteBatch(id) {
  return apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
