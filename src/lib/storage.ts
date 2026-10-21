import { supabase } from '@/lib/supabaseClient';

export const ATTACHMENT_BUCKET = 'post-attachments';
export const PROFILE_BUCKET = 'profile-media';

// Storage policies only allow writes under "<user id>/", so every path starts with it.
export const userFilePath = (userId: string, fileName: string) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-120) || 'file';
  return `${userId}/${Date.now()}-${safeName}`;
};

// Best-effort cleanup; a leftover file is not worth failing the user's action over.
export const removeStoredFile = async (bucket: string, path: string | null | undefined) => {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`Could not remove ${bucket}/${path}:`, error.message);
};

// Recovers the object path from a public URL of one of our buckets, or null for external URLs.
export const storagePathFromPublicUrl = (bucket: string, url: string | null | undefined) => {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
};

export const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;
export const MAX_POST_CHARS = 300;

// Mirrors the post-attachments bucket allowlist in supabase_setup.sql.
const DOCUMENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export type AttachmentKind = 'image' | 'video' | 'file';

// Returns the attachment kind and the content type to upload with, or an error message for the user.
export const checkAttachment = (
  file: File
): { kind: AttachmentKind; contentType: string } | { error: string } => {
  if (file.size > MAX_ATTACHMENT_BYTES) return { error: 'Attachments can be up to 50 MB.' };
  if (file.type.startsWith('image/')) return { kind: 'image', contentType: file.type };
  if (file.type.startsWith('video/')) return { kind: 'video', contentType: file.type };
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const documentType = DOCUMENT_TYPES[extension];
  if (documentType && (!file.type || file.type === documentType)) {
    return { kind: 'file', contentType: documentType };
  }
  return { error: 'Supported files: images, videos, PDF, TXT, Word and PowerPoint documents.' };
};
