import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { parseVideoSource } from '../utils/video';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  artistName: string;
  autoStartToken?: number;
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  artistName,
  autoStartToken = 0,
}: VideoPlayerProps) {
  const [isActivated, setIsActivated] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const parsed = parseVideoSource(videoUrl);

  useEffect(() => {
    if (autoStartToken > 0) {
      setIsActivated(true);
    }
  }, [autoStartToken]);

  // Encerra a reprodução ao sair do perfil
  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.removeAttribute('src');
        currentVideo.load();
      }
    };
  }, [videoUrl]);

  if (!parsed) return null;

  const hasPoster = Boolean(posterUrl?.trim()) && !posterError;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-[#09090B]">
      {!isActivated ? (
        <button
          type="button"
          onClick={() => setIsActivated(true)}
          aria-label={`Reproduzir vídeo de ${artistName}`}
          className="group relative flex h-full w-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {hasPoster ? (
            <img
              src={posterUrl}
              alt={`Capa do vídeo de ${artistName}`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setPosterError(true)}
              className="h-full w-full object-cover opacity-80 transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flyer-tile-texture absolute inset-0" aria-hidden="true" />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20"
          />

          <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/75 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-105 group-hover:bg-white group-hover:text-black">
            <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
          </span>

          <span className="sr-only">Reproduzir vídeo</span>
        </button>
      ) : parsed.type === 'youtube' ? (
        <iframe
          src={parsed.embedUrl}
          title={`Show de ${artistName}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <video
          ref={videoRef}
          src={parsed.src}
          poster={hasPoster ? posterUrl : undefined}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="h-full w-full bg-black object-contain"
        />
      )}
    </div>
  );
}
