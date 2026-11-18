export type ParsedVideoSource =
  | { type: 'youtube'; videoId: string; embedUrl: string }
  | { type: 'local'; src: string };

export function parseVideoSource(rawUrl: string): ParsedVideoSource | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // Detect YouTube URLs (watch, youtu.be, shorts, embed, live)
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`,
    };
  }

  return {
    type: 'local',
    src: url,
  };
}
