import { useEffect, useMemo, useState } from 'react';
import { Upload, Link as LinkIcon, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;

  /**
   * Supabase Storage bucket name.
   * Default changed to "site-assets" to match your logo bucket.
   */
  bucketName?: string;

  /**
   * Optional folder path inside the bucket (e.g. "features", "hero", "logos").
   * Default: "uploads"
   */
  folder?: string;
}

const MAX_FILE_MB = 10;

function addHttpsIfMissing(raw: string) {
  const s = (raw || '').trim();
  if (!s) return s;

  // Keep existing scheme
  if (/^https?:\/\//i.test(s)) return s;

  // If user enters "www.xxx.com/..." or common domains without scheme
  if (/^(www\.|drive\.google\.com|dropbox\.com|1drv\.ms|onedrive\.live\.com)/i.test(s)) {
    return `https://${s}`;
  }

  // If it looks like a domain/path, add https
  if (/^[a-z0-9.-]+\.[a-z]{2,}\/?/i.test(s)) return `https://${s}`;

  return s;
}

function isLikelyImageUrl(url: string) {
  return /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(url);
}

function extractDriveFileId(url: string): string | null {
  // file/d/<id>
  let m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  // open?id=<id>
  m = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  // uc?id=<id>
  m = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  // any ...?id=<id>
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  return null;
}

function normalizeDropbox(url: string) {
  // Dropbox share -> direct download
  // https://www.dropbox.com/s/<id>/file.png?dl=0 -> dl=1
  try {
    const u = new URL(url);
    if (!u.hostname.includes('dropbox.com')) return url;
    u.searchParams.set('dl', '1');
    return u.toString();
  } catch {
    return url;
  }
}

function normalizeOneDrive(url: string) {
  // Best-effort conversion
  try {
    const u = new URL(url);
    if (!u.hostname.includes('1drv.ms') && !u.hostname.includes('onedrive.live.com')) return url;

    // For onedrive.live.com, add download=1
    if (u.hostname.includes('onedrive.live.com')) {
      u.searchParams.set('download', '1');
      return u.toString();
    }

    // For 1drv.ms short links, keep as-is (redirect is needed)
    return url;
  } catch {
    return url;
  }
}

function isGoogleDriveFolder(url: string) {
  return /drive\.google\.com\/drive\/folders/i.test(url);
}

function isPinterest(url: string) {
  return /pin\.it\/|pinterest\.com\/pin\//i.test(url);
}

function looksLikeHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function normalizeImageUrl(input: string): { url: string; error?: string; warning?: string; source?: string } {
  let url = addHttpsIfMissing(input);

  if (!url) return { url: '' };

  // If user typed something that isn't url-like, just return as warning (don’t break typing)
  if (!looksLikeHttpUrl(url)) {
    return { url, warning: 'Please enter a valid URL (starting with http/https) or use Upload.' };
  }

  // Pinterest short links are not images
  if (isPinterest(url)) {
    return {
      url,
      error:
        'Pinterest links are not direct image URLs. Use Upload, or paste a direct image link ending with .jpg/.png/.webp.',
      source: 'pinterest',
    };
  }

  // Google Drive folder links are not images
  if (isGoogleDriveFolder(url)) {
    return {
      url,
      error: 'Google Drive folder links are not images. Paste a Drive FILE link (drive.google.com/file/d/...).',
      source: 'drive',
    };
  }

  // Google Drive file -> convert to more reliable direct view URL
  if (url.includes('drive.google.com')) {
    const fileId = extractDriveFileId(url);
    if (!fileId) {
      return {
        url,
        error:
          'Could not detect Google Drive file ID. Use a file link like: drive.google.com/file/d/FILE_ID/view',
        source: 'drive',
      };
    }

    return {
      url: `https://drive.google.com/uc?export=view&id=${fileId}`,
      warning: 'If preview fails: In Drive → Share → set “Anyone with the link” = Viewer.',
      source: 'drive',
    };
  }

  // Dropbox share -> direct
  if (url.includes('dropbox.com')) {
    return {
      url: normalizeDropbox(url),
      warning: 'If preview fails for Dropbox, use Upload (some links may block hotlinking).',
      source: 'dropbox',
    };
  }

  // OneDrive -> best effort
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    return {
      url: normalizeOneDrive(url),
      warning: 'If preview fails for OneDrive, use Upload (OneDrive may block hotlinking).',
      source: 'onedrive',
    };
  }

  // Not a typical direct image url (some CDNs don’t end with extension)
  if (!isLikelyImageUrl(url)) {
    return {
      url,
      warning:
        'This does not look like a direct image link. If preview fails, use Upload or paste a direct image URL ending with .jpg/.png/.webp.',
      source: 'url',
    };
  }

  return { url, source: 'url' };
}

function sanitizeFolder(folder?: string) {
  const f = (folder || '').trim();
  if (!f) return 'uploads';
  // remove leading/trailing slashes
  return f.replace(/^\/+/, '').replace(/\/+$/, '');
}

export default function ImageUpload({
  label,
  value,
  onChange,
  bucketName = 'site-assets', // ✅ changed default
  folder = 'uploads', // ✅ new
}: ImageUploadProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const [msg, setMsg] = useState<{ type: 'error' | 'warning' | ''; text: string }>({ type: '', text: '' });
  const [urlInput, setUrlInput] = useState(value || '');

  // Keep local input in sync when editing an existing record
  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const normalized = useMemo(() => normalizeImageUrl(urlInput), [urlInput]);

  // When in URL mode: normalize + push to parent
  useEffect(() => {
    if (uploadMode !== 'url') return;

    if (normalized.error) setMsg({ type: 'error', text: normalized.error });
    else if (normalized.warning) setMsg({ type: 'warning', text: normalized.warning });
    else setMsg({ type: '', text: '' });

    onChange(normalized.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized.url, normalized.error, normalized.warning, uploadMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    const maxBytes = MAX_FILE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setMsg({ type: 'error', text: `Image too large. Max size is ${MAX_FILE_MB}MB.` });
      return;
    }

    setUploading(true);
    setMsg({ type: '', text: '' });

    try {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileBase = Math.random().toString(36).slice(2);
      const fileName = `${fileBase}-${Date.now()}.${fileExt}`;

      const safeFolder = sanitizeFolder(folder);
      const filePath = `${safeFolder}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (error) {
        const emsg = String(error.message || '');
        if (emsg.toLowerCase().includes('bucket')) {
          throw new Error(
            `Bucket "${bucketName}" not found. Create it in Supabase → Storage → Buckets (and make it Public).`
          );
        }
        throw new Error(emsg || 'Upload failed');
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error('Uploaded, but public URL not generated. Make the bucket public.');
      }

      onChange(publicUrl);
      setUrlInput(publicUrl);
      setMsg({ type: '', text: '' });
      setUploadMode('url'); // switch back to URL mode so user can copy/edit
    } catch (err: any) {
      console.error('Upload error:', err);
      setMsg({ type: 'error', text: err?.message || 'Failed to upload image. Please try again.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const clearImage = () => {
    onChange('');
    setUrlInput('');
    setMsg({ type: '', text: '' });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setUploadMode('url');
            setMsg({ type: '', text: '' });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            uploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <LinkIcon size={16} />
          URL
        </button>

        <button
          type="button"
          onClick={() => {
            setUploadMode('upload');
            setMsg({ type: '', text: '' });
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            uploadMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      {uploadMode === 'url' ? (
        <div className="space-y-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL or Drive/Dropbox/OneDrive link"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {normalized.source === 'drive' && normalized.url && (
            <a
              href={normalized.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              title="Open the generated direct-view URL"
            >
              <ExternalLink size={14} /> Open generated image URL
            </a>
          )}
        </div>
      ) : (
        <div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to {MAX_FILE_MB}MB</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
        </div>
      )}

      {msg.type === 'error' && <p className="text-sm text-red-600">{msg.text}</p>}
      {msg.type === 'warning' && <p className="text-sm text-amber-600">{msg.text}</p>}

      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
            onError={() =>
              setMsg({
                type: 'error',
                text:
                  'Preview failed to load. If using Google Drive: set file to “Anyone with the link”. Otherwise use Upload.',
              })
            }
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
