import { ArrowUpRight, Instagram, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
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

interface LogoDockMetrics {
  heroTopDoc: number;
  heroWidth: number;
  heroHeight: number;
  dockTopY: number;
  targetScale: number;
  dockDistance: number;
}

const DEFAULT_DOCK_METRICS: LogoDockMetrics = {
  heroTopDoc: 72,
  heroWidth: 205,
  heroHeight: 62,
  dockTopY: -7,
  targetScale: 0.42,
  dockDistance: 86,
};

function FlyerTile({ artist, index, onSelectArtist }: FlyerTileProps) {
  const [imageError, setImageError] = useState(false);
  const [wideImageError, setWideImageError] = useState(false);
  const tileRef = useRef<HTMLAnchorElement | null>(null);

  const hasWidePhoto = Boolean(artist.wideImage?.trim()) && !wideImageError;
  const hasPortraitPhoto = Boolean(artist.image.trim()) && !imageError;
  const activePhoto = hasWidePhoto ? artist.wideImage! : hasPortraitPhoto ? artist.image : '';
  const activePosition = hasWidePhoto
    ? artist.wideImagePosition || 'center center'
    : artist.imagePosition || 'center top';

  // Parallax contínuo sutil dentro da moldura conforme o usuário desce pelos DJs
  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  });
  const photoParallaxY = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  const isLeftColumn = index % 2 === 0;
  const isFirstRow = index < 2;

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
    <motion.a
      ref={tileRef}
      id={`tile-${artist.slug}`}
      href={`/artistas/${artist.slug}`}
      onClick={handleClick}
      aria-label={`Abrir portfólio de ${artist.name}`}
      initial={
        isFirstRow
          ? false
          : {
              opacity: 0,
              y: 72,
              scale: 0.86,
              rotateX: 16,
              rotateY: isLeftColumn ? 9 : -9,
              rotateZ: isLeftColumn ? -2.4 : 2.4,
              transformPerspective: 950,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      }}
      whileTap={{ scale: 0.975 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.88,
        delay: isFirstRow ? 0 : isLeftColumn ? 0 : 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative block w-full touch-manipulation overflow-hidden rounded-lg border border-white/10 bg-[#09090B] transition-colors duration-200 hover:border-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white will-change-transform ${
        hasWidePhoto ? 'col-span-2 aspect-[16/10]' : 'col-span-1 aspect-[4/5]'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden">
        {activePhoto ? (
          <motion.div
            initial={isFirstRow ? false : { scale: 1.2, opacity: 0.25 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 1.05,
              delay: isFirstRow ? 0 : isLeftColumn ? 0.04 : 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-full w-full will-change-transform"
          >
            <motion.img
              src={activePhoto}
              alt={artist.name}
              loading="eager"
              fetchPriority={index < 4 ? 'high' : 'auto'}
              decoding="async"
              referrerPolicy="no-referrer"
              style={{
                objectPosition: activePosition,
                y: photoParallaxY,
                scale: 1.07,
              }}
              onError={() => {
                if (hasWidePhoto) {
                  setWideImageError(true);
                } else {
                  setImageError(true);
                }
              }}
              className="h-full w-full object-cover will-change-transform"
            />
          </motion.div>
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

        {/* Feixe de luz diagonal de palco ao revelar o artista */}
        {!isFirstRow && (
          <motion.div
            aria-hidden="true"
            initial={{ x: '-130%', opacity: 0 }}
            whileInView={{ x: '220%', opacity: [0, 0.85, 0] }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 1.05,
              delay: isLeftColumn ? 0.18 : 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}

        {/* Degradê localizado atrás do nome para garantir leitura sobre qualquer foto */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/45 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 overflow-hidden p-3 sm:p-4">
          {artist.genre.trim() && (
            <motion.p
              initial={isFirstRow ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{
                duration: 0.55,
                delay: isFirstRow ? 0 : isLeftColumn ? 0.2 : 0.32,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-0.5 truncate text-[11px] font-medium text-zinc-300 sm:text-xs"
            >
              {artist.genre}
            </motion.p>
          )}
          <motion.h2
            initial={isFirstRow ? false : { y: '115%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{
              duration: 0.68,
              delay: isFirstRow ? 0 : isLeftColumn ? 0.24 : 0.36,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-display text-[1.45rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-[1.95rem]"
          >
            {artist.name}
          </motion.h2>
        </div>
      </div>
    </motion.a>
  );
}

export function FlyerMosaic({
  hideHeroLogo = false,
  isBackgrounded = false,
  onSelectArtist,
}: FlyerMosaicProps) {
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const [isDocked, setIsDocked] = useState(false);
  const [metrics, setMetrics] = useState<LogoDockMetrics>(DEFAULT_DOCK_METRICS);

  const heroLogoRef = useRef<HTMLImageElement | null>(null);
  const stickySlotRef = useRef<HTMLDivElement | null>(null);

  const hasPlaylist = Boolean(AGENCY_CONFIG.playlistUrl.trim());
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    if (isBackgrounded) return;

    const measure = () => {
      const heroEl = heroLogoRef.current;
      const slotEl = stickySlotRef.current;
      if (!heroEl || !slotEl) return;

      const heroRect = heroEl.getBoundingClientRect();
      const slotRect = slotEl.getBoundingClientRect();
      if (heroRect.width <= 0 || heroRect.height <= 0 || slotRect.width <= 0) return;

      const heroTopDoc = heroRect.top + window.scrollY;
      const headerCenterY = slotRect.top + slotRect.height / 2;
      const dockTopY = headerCenterY - heroRect.height / 2;
      const dockDistance = Math.max(40, heroTopDoc - dockTopY);
      const targetScale = slotRect.width / heroRect.width;

      setMetrics({
        heroTopDoc,
        heroWidth: heroRect.width,
        heroHeight: heroRect.height,
        dockTopY,
        targetScale,
        dockDistance,
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (heroLogoRef.current) ro.observe(heroLogoRef.current);
    if (stickySlotRef.current) ro.observe(stickySlotRef.current);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isBackgrounded]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextDocked = latest >= metrics.dockDistance * 0.72;
    setIsDocked((prev) => (prev === nextDocked ? prev : nextDocked));
  });

  // Logo acompanha o scroll saindo do palco principal, diminuindo e atracando no centro do topo
  const floatingLogoY = useTransform(
    scrollY,
    [0, metrics.dockDistance],
    [metrics.heroTopDoc, metrics.dockTopY]
  );
  const floatingLogoScale = useTransform(
    scrollY,
    [0, metrics.dockDistance * 0.88, metrics.dockDistance],
    [1, metrics.targetScale * 1.06, metrics.targetScale]
  );

  // Tagline e fundo da barra superior respondem suavemente ao movimento da logo
  const heroTaglineOpacity = useTransform(
    scrollY,
    [0, metrics.dockDistance * 0.65],
    [1, 0]
  );
  const heroTaglineY = useTransform(
    scrollY,
    [0, metrics.dockDistance * 0.65],
    [0, -8]
  );
  const headerBackdropOpacity = useTransform(
    scrollY,
    [metrics.dockDistance * 0.3, metrics.dockDistance],
    [0, 1]
  );

  const handleToggleSound = async () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) {
      await unlockDjAudio();
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Barra fixa no topo: controle de som, espaço central para a logo e Instagram oficial */}
      <header
        aria-hidden={isBackgrounded || undefined}
        className={`fixed inset-x-0 top-0 z-30 h-12 transition-opacity duration-200 ${
          isBackgrounded ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity: headerBackdropOpacity }}
          className="pointer-events-none absolute inset-0 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-md"
        />

        <div className="relative mx-auto flex h-12 w-full max-w-[680px] items-center justify-between px-4 sm:px-6">
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

          {/* Referência central para o encaixe exato da logo ao rolar */}
          <div
            ref={stickySlotRef}
            aria-hidden="true"
            className="h-7 w-[90px] sm:w-[106px]"
          />

          <a
            href={AGENCY_CONFIG.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram oficial da Loop Talents"
            className="-mr-2 inline-flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-zinc-200 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Logo viva que parte da logo principal, reduz de tamanho e acompanha o topo ao rolar */}
      {!hideHeroLogo && !isBackgrounded && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center">
          <motion.button
            type="button"
            onClick={handleScrollToTop}
            tabIndex={isDocked ? 0 : -1}
            aria-label="Voltar ao topo da Loop Talents"
            style={{
              width: metrics.heroWidth,
              y: floatingLogoY,
              scale: floatingLogoScale,
              transformOrigin: 'center center',
            }}
            className={`will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-md ${
              isDocked ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
            }`}
          >
            <img
              src={AGENCY_CONFIG.logo}
              alt={AGENCY_CONFIG.name}
              onLoad={() => {
                if (heroLogoRef.current && stickySlotRef.current) {
                  const heroRect = heroLogoRef.current.getBoundingClientRect();
                  const slotRect = stickySlotRef.current.getBoundingClientRect();
                  if (heroRect.width > 0 && heroRect.height > 0 && slotRect.width > 0) {
                    const heroTopDoc = heroRect.top + window.scrollY;
                    const headerCenterY = slotRect.top + slotRect.height / 2;
                    const dockTopY = headerCenterY - heroRect.height / 2;
                    setMetrics({
                      heroTopDoc,
                      heroWidth: heroRect.width,
                      heroHeight: heroRect.height,
                      dockTopY,
                      targetScale: slotRect.width / heroRect.width,
                      dockDistance: Math.max(40, heroTopDoc - dockTopY),
                    });
                  }
                }
              }}
              className="w-full object-contain mix-blend-screen select-none"
            />
          </motion.button>
        </div>
      )}

      {/* Conteúdo principal do casting */}
      <div
        aria-hidden={isBackgrounded || undefined}
        className={`min-h-dvh origin-top bg-[#050505] text-[#FAFAFA] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isBackgrounded ? 'pointer-events-none scale-[0.96] opacity-35' : 'opacity-100'
        }`}
      >
        <div className="mx-auto w-full max-w-[680px] px-4 pb-24 pt-12 sm:px-6 sm:pb-28 sm:pt-12">
          <main className="mt-1">
            {/* Palco principal mantendo a geometria exata da logo oficial da Loop Talents */}
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
                {/* Âncora espacial para a entrada inicial e ponto de partida da logo ao rolar */}
                <img
                  ref={heroLogoRef}
                  id="hero-loop-logo"
                  src={AGENCY_CONFIG.logo}
                  alt={AGENCY_CONFIG.name}
                  fetchPriority="high"
                  className="pointer-events-none w-[205px] max-w-full object-contain opacity-0 mix-blend-screen sm:w-[280px]"
                />

                <motion.p
                  style={{ opacity: heroTaglineOpacity, y: heroTaglineY }}
                  className="mt-2.5 text-xs font-medium tracking-wide text-zinc-300 sm:text-sm"
                >
                  {AGENCY_CONFIG.tagline}
                </motion.p>
              </div>
            </section>

            {/* Destaque compacto da Playlist Oficial no Spotify com equalizador musical animado */}
            {hasPlaylist && (
              <section aria-label="Playlist oficial no Spotify" className="mb-4">
                <a
                  href={AGENCY_CONFIG.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex min-h-[76px] touch-manipulation items-center justify-between gap-3 overflow-hidden rounded-2xl border border-white/15 bg-[#0A0D0B] p-2.5 transition-colors duration-200 hover:border-[#1DB954]/60 hover:bg-[#0E1310] sm:p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {/* Pulso sutil de grave / onda sonora Spotify ao fundo */}
                  <motion.div
                    aria-hidden="true"
                    animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute -left-8 -top-10 h-36 w-56 rounded-full bg-[radial-gradient(circle,rgba(29,185,84,0.18),transparent_70%)]"
                  />

                  <div className="relative z-10 flex min-w-0 items-center gap-3">
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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <SpotifyLogo className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[11px] font-semibold text-[#1DB954]">
                            Spotify
                          </span>
                        </div>

                        {/* Equalizador animado de batida musical */}
                        <div
                          aria-hidden="true"
                          className="flex h-3 items-end gap-[2px]"
                        >
                          {[
                            { keys: [0.35, 1, 0.45, 0.85, 0.35], dur: 1.05 },
                            { keys: [0.85, 0.4, 1, 0.55, 0.85], dur: 0.9 },
                            { keys: [0.5, 0.95, 0.3, 1, 0.5], dur: 1.15 },
                            { keys: [0.9, 0.35, 0.8, 0.45, 0.9], dur: 0.95 },
                          ].map((bar, barIdx) => (
                            <motion.span
                              key={barIdx}
                              animate={{ scaleY: bar.keys }}
                              transition={{
                                duration: bar.dur,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: barIdx * 0.08,
                              }}
                              style={{ transformOrigin: 'bottom' }}
                              className="h-3 w-[2px] rounded-full bg-[#1DB954]"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-0.5 truncate font-display text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
                        Playlist oficial da Loop
                      </p>
                    </div>
                  </div>

                  <span className="relative z-10 inline-flex shrink-0 items-center gap-1 pr-1 text-xs font-semibold text-zinc-300 transition-colors group-hover:text-white">
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
            <div className="mb-3.5 flex items-center justify-between gap-3 sm:mb-4">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Nossos artistas
              </h1>
            </div>

            {/* Mosaico de 2 colunas com espaçamento confortável entre os artistas */}
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-4 sm:gap-5">
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
      </div>

      {/* Botão fixo perto do polegar na parte inferior da tela */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] transition-opacity duration-200 ${
          isBackgrounded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="pointer-events-auto mx-auto w-full max-w-[680px] px-4 sm:px-6">
          <a
            href={getGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg transition-colors duration-150 hover:bg-zinc-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Contratar artistas</span>
          </a>
        </div>
      </div>
    </>
  );
}
