import {
  ArrowLeft,
  ArrowUpRight,
  Disc3,
  FileText,
  Instagram,
  MessageCircle,
  Play,
  Youtube,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getArtistWhatsAppUrl } from '../data/agency';
import { getArtistBySlug, type ArtistTrack } from '../data/artists';
import { SpotifyLogo } from './SpotifyLogo';
import { VideoPlayer } from './VideoPlayer';

interface ArtistFullscreenProfileProps {
  slug: string;
  transitionSlug: string | null;
  useFallbackAnimation: boolean;
  onBack: () => void;
}

function TrackArtwork({ cover, title }: { cover: string; title: string }) {
  const [error, setError] = useState(false);
  const hasCover = Boolean(cover.trim()) && !error;

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#141418]">
      {hasCover ? (
        <img
          src={cover}
          alt={`Capa de ${title}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Disc3 className="h-5 w-5 text-zinc-500" aria-hidden="true" />
      )}
    </div>
  );
}

function TrackRow({
  track,
  artistSpotifyUrl,
}: {
  track: ArtistTrack;
  artistSpotifyUrl: string;
}) {
  const href = track.url?.trim() || artistSpotifyUrl.trim();
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3.5">
        <TrackArtwork cover={track.cover} title={track.title} />
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-white sm:text-[15px]">
            {track.title}
          </p>
          {track.streams.trim() && (
            <p className="mt-0.5 font-mono text-xs font-medium tabular-nums text-[#1DB954]">
              {track.streams}
            </p>
          )}
        </div>
      </div>

      {href && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-h-[68px] items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0D0D10] p-2.5 pr-3.5 transition-colors duration-150 hover:border-[#1DB954]/50 hover:bg-[#121216] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-h-[68px] items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0D0D10] p-2.5 pr-3.5">
      {content}
    </div>
  );
}

export function ArtistFullscreenProfile({
  slug,
  transitionSlug,
  useFallbackAnimation,
  onBack,
}: ArtistFullscreenProfileProps) {
  const artist = getArtistBySlug(slug);
  const [imageError, setImageError] = useState(false);
  const [autoStartToken, setAutoStartToken] = useState(0);

  useEffect(() => {
    setImageError(false);
    setAutoStartToken(0);
    if (artist) {
      document.title = `${artist.name} — Loop Talents`;
    } else {
      document.title = 'Artista não encontrado — Loop Talents';
    }
  }, [artist, slug]);

  if (!artist) {
    return (
      <div className="flex min-h-dvh flex-col items-start justify-center bg-[#050505] px-5 py-16 text-white">
        <div className="mx-auto w-full max-w-[680px]">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Artista não encontrado
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Este perfil não faz parte do casting atual da Loop Talents.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Voltar ao casting</span>
          </button>
        </div>
      </div>
    );
  }

  const hasPhoto = Boolean(artist.image.trim()) && !imageError;
  const hasGenre = Boolean(artist.genre.trim());
  const hasBio = Boolean(artist.bio.trim());
  const hasVideo = Boolean(artist.video.trim());
  const hasInstagram = Boolean(artist.instagram.trim());
  const hasSpotify = Boolean(artist.spotify.trim());
  const hasYoutube = Boolean(artist.youtube.trim());
  const hasPressKit = Boolean(artist.pressKit.trim());

  const topTracks = (artist.topTracks ?? [])
    .filter((track) => Boolean(track.title.trim()))
    .slice(0, 3);
  const hasTopTracks = topTracks.length > 0;
  const hasSpotifySection = hasSpotify || hasTopTracks;

  const extraLinks = [
    hasYoutube
      ? {
          key: 'youtube',
          label: 'YouTube',
          url: artist.youtube.trim(),
          icon: Youtube,
        }
      : null,
    hasPressKit
      ? {
          key: 'pressKit',
          label: 'Press Kit',
          url: artist.pressKit.trim(),
          icon: FileText,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const hasAnyProfileDetails =
    hasVideo || hasBio || hasInstagram || hasSpotifySection || extraLinks.length > 0;

  const handleWatchShow = () => {
    setAutoStartToken((token) => token + 1);
    const el = document.getElementById('artist-video');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.div
      key={artist.slug}
      initial={useFallbackAnimation ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-dvh bg-[#050505] text-[#FAFAFA]"
    >
      <div className="mx-auto w-full max-w-[680px]">
        {/* Capa de impacto com retrato e botão Voltar ao casting no topo */}
        <section aria-label={`Perfil de ${artist.name}`} className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3 sm:px-5 sm:pt-4">
            <button
              type="button"
              onClick={onBack}
              className="pointer-events-auto inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-black/70 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors duration-150 hover:bg-black/90 active:scale-[0.98] sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Voltar ao casting</span>
            </button>
          </div>

          <div
            style={
              transitionSlug === artist.slug
                ? { viewTransitionName: 'artist-hero-cover' }
                : undefined
            }
            className="relative aspect-[4/5] max-h-[76dvh] w-full overflow-hidden bg-[#09090B] sm:rounded-b-2xl"
          >
            {hasPhoto ? (
              <img
                src={artist.image}
                alt={artist.name}
                fetchPriority="high"
                decoding="async"
                referrerPolicy="no-referrer"
                style={{ objectPosition: artist.imagePosition || 'center top' }}
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flyer-tile-texture relative h-full w-full">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 240 240"
                  fill="none"
                  className="pointer-events-none absolute left-1/2 top-[40%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 opacity-[0.09] sm:h-64 sm:w-64"
                >
                  <circle cx="92" cy="120" r="64" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="148" cy="120" r="64" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#050505] via-black/55 to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16 sm:px-6 sm:pb-6">
              {hasGenre && (
                <p className="mb-1 text-xs font-medium text-zinc-300 sm:text-sm">
                  {artist.genre}
                </p>
              )}

              <h1 className="font-display text-[2.65rem] font-extrabold leading-[0.94] tracking-tight text-white sm:text-5xl">
                {artist.name}
              </h1>

              {hasVideo && (
                <button
                  type="button"
                  onClick={handleWatchShow}
                  className="mt-3.5 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors duration-150 hover:bg-white hover:text-black active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Play className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
                  <span>Assistir ao show</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Conteúdo do portfólio abaixo da capa */}
        <main className="space-y-6 px-4 pb-28 pt-5 sm:px-6 sm:pb-32">
          {hasBio && (
            <section aria-label="Informações do artista" className="space-y-2">
              <h2 className="font-display text-lg font-bold tracking-tight text-white">
                Informações
              </h2>
              <div className="space-y-2.5 text-[15px] leading-relaxed text-zinc-300">
                {artist.bio.split('\n').map((paragraph, i) =>
                  paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                )}
              </div>
            </section>
          )}

          {hasVideo && (
            <section id="artist-video" aria-label="Vídeo de apresentação" className="space-y-2.5">
              <h2 className="font-display text-lg font-bold tracking-tight text-white">
                Apresentação
              </h2>
              <VideoPlayer
                key={artist.slug}
                videoUrl={artist.video}
                posterUrl={artist.videoPoster || artist.image}
                artistName={artist.name}
                autoStartToken={autoStartToken}
              />
            </section>
          )}

          {/* Spotify com até 3 sucessos (foto, nome e streams) */}
          {hasSpotifySection && (
            <section aria-label="Sucessos no Spotify" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SpotifyLogo className="h-5 w-5 shrink-0" />
                  <h2 className="font-display text-lg font-bold tracking-tight text-white">
                    Spotify
                  </h2>
                </div>

                {hasSpotify && (
                  <a
                    href={artist.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>Ouvir perfil</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </div>

              {hasTopTracks && (
                <div className="space-y-2">
                  {topTracks.map((track, idx) => (
                    <TrackRow
                      key={`${track.title}-${idx}`}
                      track={track}
                      artistSpotifyUrl={artist.spotify}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Instagram e demais links oficiais cadastrados */}
          {(hasInstagram || extraLinks.length > 0) && (
            <section aria-label="Redes e links oficiais" className="space-y-2.5">
              <h2 className="font-display text-lg font-bold tracking-tight text-white">
                Redes e materiais
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {hasInstagram && (
                  <a
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0D0D10] px-3.5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Instagram
                        className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white"
                        aria-hidden="true"
                      />
                      <span className="truncate">Instagram</span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </a>
                )}

                {extraLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0D0D10] px-3.5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          className="h-4 w-4 shrink-0 text-zinc-400 group-hover:text-white"
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {!hasAnyProfileDetails && (
            <p className="text-sm leading-relaxed text-zinc-400">
              Consulte disponibilidade de data e proposta comercial diretamente pelo WhatsApp da Loop Talents.
            </p>
          )}
        </main>
      </div>

      {/* Botão fixo na parte inferior para consultar data pelo WhatsApp */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto w-full max-w-[680px] px-4 sm:px-6">
          <a
            href={getArtistWhatsAppUrl(artist.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-lg transition-colors duration-150 hover:bg-zinc-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Consultar data</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
