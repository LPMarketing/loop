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
import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { getArtistWhatsAppUrl } from '../data/agency';
import { getArtistBySlug, type Artist, type ArtistTrack } from '../data/artists';
import type { TileOrigin } from './FlyerMosaic';
import { SpotifyLogo } from './SpotifyLogo';
import { VideoPlayer } from './VideoPlayer';

interface ArtistFullscreenProfileProps {
  slug: string;
  origin?: TileOrigin | null;
  animateOnMount?: boolean;
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
        className="group flex min-h-[68px] touch-manipulation items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0D0D10] p-2.5 pr-3.5 transition-colors duration-150 hover:border-[#1DB954]/50 hover:bg-[#121216] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
  origin,
  animateOnMount = true,
  onBack,
}: ArtistFullscreenProfileProps) {
  const artist = getArtistBySlug(slug);

  useEffect(() => {
    if (artist) {
      document.title = `${artist.name} — Loop Talents`;
    } else {
      document.title = 'Artista não encontrado — Loop Talents';
    }
  }, [artist, slug]);

  const transformOrigin = origin
    ? `${origin.xPct}% ${origin.yPct}%`
    : '50% 35%';

  if (!artist) {
    return (
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Artista não encontrado"
        initial={animateOnMount ? { opacity: 0, y: 18 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-40 flex flex-col items-start justify-center bg-[#050505] px-5 py-16 text-white"
      >
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
            className="mt-6 inline-flex min-h-[48px] touch-manipulation items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Voltar ao casting</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ArtistProfileBody
      key={artist.slug}
      artist={artist}
      transformOrigin={transformOrigin}
      animateOnMount={animateOnMount}
      onBack={onBack}
    />
  );
}

function ArtistProfileBody({
  artist,
  transformOrigin,
  animateOnMount,
  onBack,
}: {
  artist: Artist;
  transformOrigin: string;
  animateOnMount: boolean;
  onBack: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [autoStartToken, setAutoStartToken] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll({ container: scrollContainerRef });
  const heroImageY = useTransform(scrollY, [0, 360], [0, 56]);
  const heroImageScale = useTransform(scrollY, [0, 360], [1, 1.08]);
  const heroTextY = useTransform(scrollY, [0, 260], [0, -18]);
  const heroTextOpacity = useTransform(scrollY, [0, 260], [1, 0.38]);

  const hasPhoto = Boolean(artist.image.trim()) && !imageError;
  const hasGenre = Boolean(artist.genre.trim());
  const hasBio = Boolean(artist.bio.trim());
  const hasVideo = Boolean(artist.video.trim());
  const hasInstagram = Boolean(artist.instagram.trim());
  const instagramHandle = artist.instagramHandle?.trim() || '';
  const hasSpotify = Boolean(artist.spotify.trim());
  const artistStreams = artist.streams?.trim() || '';
  const hasStreams = Boolean(artistStreams);
  const hasSpotifyCard = hasSpotify || hasStreams;
  const hasYoutube = Boolean(artist.youtube.trim());
  const hasPressKit = Boolean(artist.pressKit.trim());

  const topTracks = (artist.topTracks ?? [])
    .filter((track) => Boolean(track.title.trim()))
    .slice(0, 3);
  const hasTopTracks = topTracks.length > 0;

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

  const hasSocialPair = hasSpotifyCard || hasInstagram;
  const hasAnyProfileDetails =
    hasVideo || hasBio || hasSocialPair || hasTopTracks || extraLinks.length > 0;

  const handleWatchShow = () => {
    setAutoStartToken((token) => token + 1);
    const el = document.getElementById('artist-video');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Portfólio de ${artist.name}`}
      initial={animateOnMount ? { opacity: 0, scale: 0.94, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin }}
      className="fixed inset-0 z-40 bg-[#050505] text-[#FAFAFA] will-change-transform"
    >
      {/* Botão fixo Voltar ao casting no topo para retorno imediato de qualquer ponto */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between px-3 pt-3 sm:px-5 sm:pt-4">
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-white/20 bg-black/75 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors duration-150 hover:bg-black/95 active:scale-[0.97] sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Voltar ao casting</span>
          </button>
        </div>
      </div>

      {/* Área rolável independente do mosaico de fundo */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
      >
        <div className="mx-auto w-full max-w-[680px]">
          {/* Capa de impacto com retrato e parallax suave ao descer */}
          <section aria-label={`Perfil de ${artist.name}`} className="relative">
            <div className="relative aspect-[4/5] max-h-[72dvh] w-full overflow-hidden bg-[#09090B] sm:rounded-b-2xl">
              {hasPhoto ? (
                <motion.img
                  src={artist.image}
                  alt={artist.name}
                  fetchPriority="high"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  style={{
                    objectPosition: artist.imagePosition || 'center top',
                    y: heroImageY,
                    scale: heroImageScale,
                  }}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover will-change-transform"
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
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#050505] via-black/55 to-transparent"
              />

              <motion.div
                style={{ y: heroTextY, opacity: heroTextOpacity }}
                className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16 sm:px-6 sm:pb-6"
              >
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
                    className="mt-3.5 inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors duration-150 hover:bg-white hover:text-black active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" aria-hidden="true" />
                    <span>Assistir ao show</span>
                  </button>
                )}
              </motion.div>
            </div>
          </section>

          {/* Conteúdo do portfólio abaixo da capa */}
          <main className="space-y-5 px-4 pb-28 pt-4 sm:px-6 sm:pb-32">
            {/* Spotify e Instagram lado a lado */}
            {hasSocialPair && (
              <section aria-label="Spotify e Instagram">
                <div
                  className={`grid gap-2.5 ${
                    hasSpotifyCard && hasInstagram ? 'grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {hasSpotifyCard && (
                    hasSpotify ? (
                      <motion.a
                        href={artist.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 22, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        whileTap={{ scale: 0.985 }}
                        viewport={{ once: true, root: scrollContainerRef, amount: 0.1 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex min-h-[108px] touch-manipulation flex-col justify-between rounded-2xl border border-white/15 bg-[#0A0D0B] p-3.5 transition-colors duration-150 hover:border-[#1DB954]/60 hover:bg-[#0E1310] sm:p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1DB954]/25 bg-[#121A14]">
                            <SpotifyLogo className="h-4 w-4" />
                          </div>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="mt-3 min-w-0">
                          <p className="truncate font-display text-[1.35rem] font-extrabold leading-none tracking-tight text-white sm:text-2xl">
                            {hasStreams ? artistStreams : 'Spotify'}
                          </p>
                          <p className="mt-1 truncate text-xs font-medium text-[#1DB954]">
                            {hasStreams ? 'Ouvir no Spotify' : 'Perfil oficial'}
                          </p>
                        </div>
                      </motion.a>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 22, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, root: scrollContainerRef, amount: 0.1 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        className="flex min-h-[108px] flex-col justify-between rounded-2xl border border-white/15 bg-[#0A0D0B] p-3.5 sm:p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1DB954]/25 bg-[#121A14]">
                            <SpotifyLogo className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="mt-3 min-w-0">
                          <p className="truncate font-display text-[1.35rem] font-extrabold leading-none tracking-tight text-white sm:text-2xl">
                            {artistStreams}
                          </p>
                          <p className="mt-1 truncate text-xs font-medium text-[#1DB954]">
                            Spotify
                          </p>
                        </div>
                      </motion.div>
                    )
                  )}

                  {hasInstagram && (
                    <motion.a
                      href={artist.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 22, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      whileTap={{ scale: 0.985 }}
                      viewport={{ once: true, root: scrollContainerRef, amount: 0.1 }}
                      transition={{ duration: 0.38, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                      className="group flex min-h-[108px] touch-manipulation flex-col justify-between rounded-2xl border border-white/15 bg-[#0D0D10] p-3.5 transition-colors duration-150 hover:border-white/35 sm:p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04]">
                          <Instagram
                            className="h-4 w-4 text-zinc-200 group-hover:text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="mt-3 min-w-0">
                        <p className="truncate font-display text-[1.35rem] font-extrabold leading-none tracking-tight text-white sm:text-2xl">
                          Instagram
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-zinc-400 group-hover:text-zinc-300">
                          {instagramHandle || 'Perfil oficial'}
                        </p>
                      </div>
                    </motion.a>
                  )}
                </div>
              </section>
            )}

            {hasBio && (
              <motion.section
                aria-label="Informações do artista"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, root: scrollContainerRef, amount: 0.12 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2"
              >
                <h2 className="font-display text-lg font-bold tracking-tight text-white">
                  Informações
                </h2>
                <div className="space-y-2.5 text-[15px] leading-relaxed text-zinc-300">
                  {artist.bio.split('\n').map((paragraph, i) =>
                    paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                  )}
                </div>
              </motion.section>
            )}

            {hasVideo && (
              <motion.section
                id="artist-video"
                aria-label="Vídeo de apresentação"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, root: scrollContainerRef, amount: 0.12 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
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
              </motion.section>
            )}

            {/* Até 3 sucessos no Spotify (foto, nome e streams) quando cadastrados */}
            {hasTopTracks && (
              <motion.section
                aria-label="Destaques no Spotify"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, root: scrollContainerRef, amount: 0.12 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <h2 className="font-display text-lg font-bold tracking-tight text-white">
                  Destaques no Spotify
                </h2>
                <div className="space-y-2">
                  {topTracks.map((track, idx) => (
                    <TrackRow
                      key={`${track.title}-${idx}`}
                      track={track}
                      artistSpotifyUrl={artist.spotify}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {extraLinks.length > 0 && (
              <motion.section
                aria-label="Outros materiais"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, root: scrollContainerRef, amount: 0.12 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <h2 className="font-display text-lg font-bold tracking-tight text-white">
                  Materiais
                </h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {extraLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[52px] touch-manipulation items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0D0D10] px-3.5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
              </motion.section>
            )}

            {!hasAnyProfileDetails && (
              <p className="text-sm leading-relaxed text-zinc-400">
                Consulte disponibilidade de data e proposta comercial diretamente pelo WhatsApp da Loop Talents.
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Botão fixo na parte inferior para consultar data pelo WhatsApp */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto w-full max-w-[680px] px-4 sm:px-6">
          <a
            href={getArtistWhatsAppUrl(artist.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-lg transition-colors duration-150 hover:bg-zinc-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Consultar data</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
