import { ArrowUpRight, Instagram, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { AGENCY_CONFIG, getGeneralWhatsAppUrl } from '../data/agency';
import { ARTISTS, type Artist } from '../data/artists';
import { isSoundMuted, setSoundMuted, unlockDjAudio } from '../utils/djSound';
import { Footer } from './Footer';
import { SpotifyLogo } from './SpotifyLogo';

export interface TileOrigin {
  xPct: number;
  yPct: number;
}

interface FlyerMosaicProps {
  hideHeroLogo?: boolean;
  isBackgrounded?: boolean;
  onSelectArtist: (slug: string, origin?: TileOrigin) => void;
}

interface FlyerTileProps {
  artist: Artist;
  index: number;
  onSelectArtist: (slug: string, origin?: TileOrigin) => void;
}

function FlyerTile({ artist, index, onSelectArtist }: FlyerTileProps) {
  const [imageError, setImageError] = useState(false);
  const [wideImageError, setWideImageError] = useState(false);

  const hasWidePhoto = Boolean(artist.wideImage?.trim()) && !wideImageError;
  const hasPortraitPhoto = Boolean(artist.image.trim()) && !imageError;
  const activePhoto = hasWidePhoto ? artist.wideImage! : hasPortraitPhoto ? artist.image : '';
  const activePosition = hasWidePhoto
    ? artist.wideImagePosition || 'center center'
    : artist.imagePosition || 'center top';

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const xPct = Math.round(((rect.left + rect.width / 2) / vw) * 100);
    const yPct = Math.round(((rect.top + rect.height / 2) / vh) * 100);
    onSelectArtist(artist.slug, { xPct, yPct });
  };

  return (
    <a
      id={`tile-${artist.slug}`}
      href={`/artistas/${artist.slug}`}
      onClick={handleClick}
      aria-label={`Abrir portfólio de ${artist.name}`}
      className={`group relative block w-full touch-manipulation overflow-hidden rounded-lg border border-white/10 bg-[#09090B] transition-[border-color,transform] duration-150 ease-out hover:border-white/35 active:scale-[0.975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        hasWidePhoto ? 'col-span-2 aspect-[16/10]' : 'col-span-1 aspect-[4/5]'
      }`}
    >
      <div className="relative h-full w-full">
        {activePhoto ? (
          <img
            src={activePhoto}
            alt={artist.name}
            loading="eager"
            fetchPriority={index < 4 ? 'high' : 'auto'}
            decoding="async"
            referrerPolicy="no-referrer"
            style={{ objectPosition: activePosition }}
            onError={() => {
              if (hasWidePhoto) {
                setWideImageError(true);
              } else {
                setImageError(true);
              }
            }}
            className="h-full w-full object-cover transition-transform duration-300 ease-out sm:group-hover:scale-[1.03]"
          />
        ) : (
          /* Capa tipográfica provisória com o nome completo e o motivo dos elos da Loop */
          <div className="flyer-tile-texture relative h-full w-full">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              fill="none"
              className="pointer-events-none absolute left-1/2 top-[38%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 opacity-[0.09] transition-opacity duration-200 group-hover:opacity-[0.16] sm:h-44 sm:w-44"
            >
              <circle cx="76" cy="100" r="52" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="124" cy="100" r="52" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>
          </div>
        )}

        {/* Degradê localizado atrás do nome para garantir leitura sobre qualquer foto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/45 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          {artist.genre.trim() && (
            <p className="mb-0.5 truncate text-[11px] font-medium text-zinc-300 sm:text-xs">
              {artist.genre}
            </p>
          )}
          <h2 className="font-display text-[1.45rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-[1.95rem]">
            {artist.name}
          </h2>
        </div>
      </div>
    </a>
  );
}

export function FlyerMosaic({
  hideHeroLogo = false,
  isBackgrounded = false,
  onSelectArtist,
}: FlyerMosaicProps) {
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const hasPlaylist = Boolean(AGENCY_CONFIG.playlistUrl.trim());

  const handleToggleSound = async () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      await unlockDjAudio();
    }
  };

  return (
    <div
      aria-hidden={isBackgrounded || undefined}
      className={`min-h-dvh origin-top bg-[#050505] text-[#FAFAFA] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isBackgrounded ? 'pointer-events-none scale-[0.97] opacity-40' : 'scale-100 opacity-100'
      }`}
    >
      <div className="mx-auto w-full max-w-[680px] px-3 pb-28 pt-2 sm:px-5 sm:pb-32 sm:pt-3">
        {/* Barra utilitária discreta: controle de som à esquerda e Instagram oficial à direita */}
        <header className="flex h-11 items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={muted ? 'Ativar som de transição' : 'Silenciar som de transição'}
            className="-ml-2 inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <a
            href={AGENCY_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram oficial da Loop Talents"
            className="-mr-2 inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-zinc-200 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
          </a>
        </header>

        <main className="mt-1">
          {/* Palco principal destacando a logo oficial da Loop Talents no início da página */}
          <section
            aria-label="Apresentação Loop Talents"
            className="relative mb-3 overflow-hidden rounded-2xl border border-white/15 bg-[#070709] px-5 py-5 text-center sm:mb-4 sm:py-7"
          >
            {/* Luz de palco radial e sulcos sutis de vinil */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.03)_50%,transparent_75%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] sm:h-68 sm:w-68"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05] sm:h-48 sm:w-48"
            />

            <div className="relative z-10 flex flex-col items-center">
              <img
                id="hero-loop-logo"
                src={AGENCY_CONFIG.logo}
                alt={AGENCY_CONFIG.name}
                fetchPriority="high"
                className={`w-[205px] max-w-full object-contain mix-blend-screen sm:w-[280px] ${
                  hideHeroLogo ? 'opacity-0' : 'opacity-100'
                }`}
              />

              <p className="mt-2.5 text-xs font-medium tracking-wide text-zinc-300 sm:text-sm">
                {AGENCY_CONFIG.tagline}
              </p>
            </div>
          </section>

          {/* Destaque compacto da Playlist Oficial no Spotify com a capa oficial */}
          {hasPlaylist && (
            <section aria-label="Playlist oficial no Spotify" className="mb-4">
              <a
                href={AGENCY_CONFIG.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[76px] touch-manipulation items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#0A0D0B] p-2.5 transition-colors duration-150 hover:border-[#1DB954]/60 hover:bg-[#0E1310] sm:p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:w-28">
                    <img
                      src={AGENCY_CONFIG.playlistCover}
                      alt="Capa da Playlist Oficial Loop Talents no Spotify"
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <SpotifyLogo className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11px] font-semibold text-[#1DB954]">
                        Spotify
                      </span>
                    </div>
                    <p className="mt-0.5 truncate font-display text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
                      Playlist oficial da Loop
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1 pr-1 text-xs font-semibold text-zinc-300 transition-colors group-hover:text-white">
                  <span>Ouvir</span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </section>
          )}

          {/* Cabeçalho do casting */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-3.5">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Nossos artistas
            </h1>
          </div>

          {/* Mosaico de 2 colunas com estética de flyer de festival */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {ARTISTS.map((artist, index) => (
              <FlyerTile
                key={artist.slug}
                artist={artist}
                index={index}
                onSelectArtist={onSelectArtist}
              />
            ))}
          </div>
        </main>

        <Footer />
      </div>

      {/* Botão fixo perto do polegar na parte inferior da tela */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-opacity duration-200 ${
          isBackgrounded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-[680px] px-3 sm:px-5">
          <a
            href={getGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-lg transition-colors duration-150 hover:bg-zinc-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Contratar artistas</span>
          </a>
        </div>
      </div>
    </div>
  );
}
