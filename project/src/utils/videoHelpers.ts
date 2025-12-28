export function convertGoogleDriveLink(url: string): { embedUrl: string; thumbnailUrl: string } | null {
  if (!url) return null;

  // Check if it's a Google Drive link - handle multiple formats
  const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const driveViewRegex = /drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/;

  let match = url.match(driveFileRegex);
  if (!match) match = url.match(driveOpenRegex);
  if (!match) match = url.match(driveViewRegex);

  if (match) {
    const fileId = match[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    };
  }

  // Check if it's a YouTube link - handle multiple formats
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  return null;
}

export function isExternalVideoUrl(url: string): boolean {
  return url.includes('drive.google.com') ||
         url.includes('youtube.com') ||
         url.includes('youtu.be') ||
         url.includes('vimeo.com');
}
