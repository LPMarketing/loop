import { AnimatePresence, MotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArtistFullscreenProfile } from './components/ArtistFullscreenProfile';
import { DjIntroOverlay } from './components/DjIntroOverlay';
import { FlyerMosaic, type TileOrigin } from './components/FlyerMosaic';
import { getArtistBySlug } from './data/artists';
import { playDjTransitionSound, unlockDjAudio } from './utils/djSound';

const DEFAULT_TITLE = 'Loop Talents — Casting & Portfólio de Artistas';

function parseArtistSlug(pathname: string): string | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = clean.match(/^\/artistas\/([^/]+)$/);
  if (!match) return null;
  const decoded = decodeURIComponent(match[1]);
  return getArtistBySlug(decoded) ? decoded : null;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function App() {
  const initialSlug = parseArtistSlug(window.location.pathname);

  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug);
  const [tileOrigin, setTileOrigin] = useState<TileOrigin | null>(null);
  const [animateProfileMount, setAnimateProfileMount] = useState<boolean>(!initialSlug);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !initialSlug && !prefersReducedMotion();
  });

  const lastOpenedSlugRef = useRef<string | null>(initialSlug);
  const savedScrollYRef = useRef<number>(0);

  // Libera Web Audio no primeiro toque em navegadores móveis caso o autoplay inicial tenha sido bloqueado
  useEffect(() => {
    const handleFirstGesture = () => {
      unlockDjAudio();
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    return () => window.removeEventListener('pointerdown', handleFirstGesture);
  }, []);

  // Restaura título padrão quando na home
  useEffect(() => {
    if (!activeSlug) {
      document.title = DEFAULT_TITLE;
    }
  }, [activeSlug]);

  // Trava rolagem do mosaico em segundo plano enquanto o perfil está aberto, preservando a posição exata
  useEffect(() => {
    if (!activeSlug) return;

    savedScrollYRef.current = window.scrollY;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      if (window.scrollY !== savedScrollYRef.current) {
        window.scrollTo({ top: savedScrollYRef.current, behavior: 'auto' });
      }
    };
  }, [activeSlug]);

  const focusMosaicTile = useCallback((slugToFocus: string | null) => {
    if (!slugToFocus) return;
    requestAnimationFrame(() => {
      const tile = document.getElementById(`tile-${slugToFocus}`);
      if (tile) {
        tile.focus({ preventScroll: true });
      }
    });
  }, []);

  const handleOpenArtist = useCallback((slug: string, origin?: TileOrigin) => {
    lastOpenedSlugRef.current = slug;
    setTileOrigin(origin ?? null);
    setAnimateProfileMount(true);
    void playDjTransitionSound();

    const targetPath = `/artistas/${slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ fromMosaic: true, slug }, '', targetPath);
    }
    setActiveSlug(slug);
  }, []);

  const handleBackToCasting = useCallback(() => {
    const slugToFocus = activeSlug || lastOpenedSlugRef.current;

    if (window.history.state && window.history.state.fromMosaic) {
      window.history.back();
      return;
    }

    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    setActiveSlug(null);
    focusMosaicTile(slugToFocus);
  }, [activeSlug, focusMosaicTile]);

  // Fecha perfil com a tecla Escape no desktop
  useEffect(() => {
    if (!activeSlug) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackToCasting();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlug, handleBackToCasting]);

  // Sincroniza botão Voltar/Avançar do navegador
  useEffect(() => {
    const handlePopState = () => {
      const nextSlug = parseArtistSlug(window.location.pathname);

      if (nextSlug) {
        lastOpenedSlugRef.current = nextSlug;
        setAnimateProfileMount(true);
        setActiveSlug(nextSlug);
      } else {
        const slugToFocus = lastOpenedSlugRef.current;
        setActiveSlug(null);
        focusMosaicTile(slugToFocus);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [focusMosaicTile]);

  return (
    <MotionConfig reducedMotion="user">
      {showIntro && <DjIntroOverlay onComplete={() => setShowIntro(false)} />}

      <FlyerMosaic
        hideHeroLogo={showIntro}
        isBackgrounded={Boolean(activeSlug)}
        onSelectArtist={handleOpenArtist}
      />

      <AnimatePresence>
        {activeSlug && (
          <ArtistFullscreenProfile
            key={activeSlug}
            slug={activeSlug}
            origin={tileOrigin}
            animateOnMount={animateProfileMount}
            onBack={handleBackToCasting}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
