import { supabase, isSupabaseConfigured } from '../lib/supabase'

const BUCKET_NAME = 'avatars'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type UploadResult = {
  url: string | null
  error: string | null
}

// Upload avatar image to Supabase Storage
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  console.log('Starting avatar upload for user:', userId)

  if (!supabase || !isSupabaseConfigured()) {
    console.error('Supabase not configured')
    return { url: null, error: 'Supabase nicht konfiguriert.' }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error('Invalid file type:', file.type)
    return { url: null, error: 'Nur JPG, PNG, WebP und GIF erlaubt.' }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    console.error('File too large:', file.size)
    return { url: null, error: 'Bild darf maximal 2MB gross sein.' }
  }

  // Create unique filename - simple flat structure without subfolder
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${userId}/avatar.${fileExt}`

  console.log('Uploading file:', fileName)

  try {
    // Before uploading, get current avatar to delete it later
    const { data: profileData, error: profileGetError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()

    if (profileGetError) {
      console.warn('Could not get current avatar url', profileGetError)
    }

    // Upload new avatar directly (upsert will overwrite)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return { url: null, error: `Upload fehlgeschlagen: ${uploadError.message}` }
    }

    console.log('Upload successful:', uploadData)

    // If there was an old avatar, remove it from storage
    if (profileData?.avatar_url) {
      try {
        const url = new URL(profileData.avatar_url)
        const path = url.pathname.split(`/`).slice(-2).join('/')
        if (path) {
          await supabase.storage.from(BUCKET_NAME).remove([path])
        }
      } catch (err) {
        console.warn('Could not delete old avatar file:', err)
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      console.error('Could not get public URL')
      return { url: null, error: 'Fehler beim Abrufen der Bild-URL.' }
    }

    console.log('Public URL:', urlData.publicUrl)

    // Update profile with new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return { url: null, error: `Profil-Update fehlgeschlagen: ${profileError.message}` }
    }

    console.log('Profile updated successfully')
    return { url: urlData.publicUrl, error: null }

  } catch (err) {
    console.error('Unexpected error during upload:', err)
    return { url: null, error: 'Unerwarteter Fehler beim Hochladen.' }
  }
}

// Delete avatar from storage and clear profile
export async function deleteAvatar(userId: string, avatarUrl: string): Promise<{ error: string | null }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { error: 'Supabase nicht konfiguriert.' }
  }

  // Extract path from URL. e.g. "https://<project>.supabase.co/storage/v1/object/public/avatars/user-id/avatar.png"
  try {
    const url = new URL(avatarUrl)
    const path = url.pathname.split(`/`).slice(-2).join('/')

    if (path) {
      await supabase.storage.from(BUCKET_NAME).remove([path])
    }
  } catch (err) {
    console.warn('Could not delete avatar file:', err)
  }

  // Clear avatar URL in profile
  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { error: 'Fehler beim Entfernen des Avatars.' }
  }

  return { error: null }
}
