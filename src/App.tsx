import { MotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArtistFullscreenProfile } from './components/ArtistFullscreenProfile';
import { DjIntroOverlay } from './components/DjIntroOverlay';
import { FlyerMosaic } from './components/FlyerMosaic';
import { getArtistBySlug } from './data/artists';
import { playDjTransitionSound, unlockDjAudio } from './utils/djSound';

const DEFAULT_TITLE = 'Loop Talents — Casting & Portfólio de Artistas';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

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
  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    parseArtistSlug(window.location.pathname)
  );
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    const initialArtist = parseArtistSlug(window.location.pathname);
    return !initialArtist && !prefersReducedMotion();
  });
  const [transitionSlug, setTransitionSlug] = useState<string | null>(null);
  const [useFallbackAnimation, setUseFallbackAnimation] = useState(false);

  const mosaicScrollYRef = useRef<number | null>(null);
  const lastOpenedSlugRef = useRef<string | null>(
    parseArtistSlug(window.location.pathname)
  );

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

  const restoreMosaicScrollSync = useCallback((slugToFocus: string | null) => {
    if (mosaicScrollYRef.current !== null) {
      window.scrollTo({ top: mosaicScrollYRef.current, behavior: 'auto' });
    } else if (slugToFocus) {
      const tile = document.getElementById(`tile-${slugToFocus}`);
      if (tile) {
        tile.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
  }, []);

  const focusMosaicTile = useCallback((slugToFocus: string | null) => {
    if (!slugToFocus) return;
    requestAnimationFrame(() => {
      const tile = document.getElementById(`tile-${slugToFocus}`);
      if (tile) {
        tile.focus({ preventScroll: true });
      }
    });
  }, []);

  const runTransition = useCallback(
    (
      slugForSharedElement: string | null,
      updateDom: () => void,
      afterDomFlush?: () => void,
      onDone?: () => void
    ) => {
      const doc = document as ViewTransitionDocument;
      const canUseViewTransition =
        Boolean(slugForSharedElement) &&
        typeof doc.startViewTransition === 'function' &&
        !prefersReducedMotion();

      if (canUseViewTransition && doc.startViewTransition) {
        try {
          setUseFallbackAnimation(false);
          flushSync(() => {
            setTransitionSlug(slugForSharedElement);
          });

          const transition = doc.startViewTransition(() => {
            flushSync(() => {
              updateDom();
            });
            afterDomFlush?.();
          });

          transition.finished
            .catch(() => {
              // Ignora abort caso o usuário navegue rapidamente
            })
            .finally(() => {
              setTransitionSlug(null);
              onDone?.();
            });
          return;
        } catch {
          setTransitionSlug(null);
        }
      }

      // Fallback curto para navegador interno do Instagram ou movimento reduzido
      setUseFallbackAnimation(!prefersReducedMotion());
      flushSync(() => {
        updateDom();
      });
      afterDomFlush?.();
      onDone?.();
    },
    []
  );

  const handleOpenArtist = useCallback(
    (slug: string) => {
      mosaicScrollYRef.current = window.scrollY;
      lastOpenedSlugRef.current = slug;
      void playDjTransitionSound();

      runTransition(
        slug,
        () => {
          const targetPath = `/artistas/${slug}`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState({ fromMosaic: true, slug }, '', targetPath);
          }
          setActiveSlug(slug);
        },
        () => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      );
    },
    [runTransition]
  );

  const handleBackToCasting = useCallback(() => {
    const slugToFocus = activeSlug || lastOpenedSlugRef.current;

    if (window.history.state && window.history.state.fromMosaic) {
      window.history.back();
      return;
    }

    runTransition(
      slugToFocus,
      () => {
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
        setActiveSlug(null);
      },
      () => {
        restoreMosaicScrollSync(slugToFocus);
      },
      () => {
        focusMosaicTile(slugToFocus);
      }
    );
  }, [activeSlug, focusMosaicTile, restoreMosaicScrollSync, runTransition]);

  // Sincroniza botão Voltar/Avançar do navegador (incluindo retorno ao mosaico)
  useEffect(() => {
    const handlePopState = () => {
      const nextSlug = parseArtistSlug(window.location.pathname);

      if (nextSlug) {
        lastOpenedSlugRef.current = nextSlug;
        runTransition(
          nextSlug,
          () => {
            setActiveSlug(nextSlug);
          },
          () => {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        );
      } else {
        const slugToFocus = lastOpenedSlugRef.current;
        runTransition(
          slugToFocus,
          () => {
            setActiveSlug(null);
          },
          () => {
            restoreMosaicScrollSync(slugToFocus);
          },
          () => {
            focusMosaicTile(slugToFocus);
          }
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [focusMosaicTile, restoreMosaicScrollSync, runTransition]);

  return (
    <MotionConfig reducedMotion="user">
      {showIntro && <DjIntroOverlay onComplete={() => setShowIntro(false)} />}

      {activeSlug ? (
        <ArtistFullscreenProfile
          slug={activeSlug}
          transitionSlug={transitionSlug}
          useFallbackAnimation={useFallbackAnimation}
          onBack={handleBackToCasting}
        />
      ) : (
        <FlyerMosaic
          transitionSlug={transitionSlug}
          onSelectArtist={handleOpenArtist}
        />
      )}
    </MotionConfig>
  );
}
