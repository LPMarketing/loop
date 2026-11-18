import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENCY_CONFIG } from '../data/agency';
import { playDjIntroSound, unlockDjAudio } from '../utils/djSound';

interface DjIntroOverlayProps {
  onComplete: () => void;
}

interface LogoTargetTransform {
  x: number;
  y: number;
  scale: number;
}

const EQ_BARS = [0.45, 0.85, 0.6, 1, 0.7, 0.9, 0.5, 0.8, 0.55];

export function DjIntroOverlay({ onComplete }: DjIntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState<LogoTargetTransform>({
    x: 0,
    y: -140,
    scale: 1.25,
  });
  const [needsTapForSound, setNeedsTapForSound] = useState(false);

  const logoBoxRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);
  const soundPlayedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    const currentEl = logoBoxRef.current;
    const heroLogoEl = document.getElementById('hero-loop-logo');

    if (currentEl && heroLogoEl) {
      const fromRect = currentEl.getBoundingClientRect();
      const toRect = heroLogoEl.getBoundingClientRect();

      if (fromRect.width > 0 && toRect.width > 0) {
        const fromCenterX = fromRect.left + fromRect.width / 2;
        const fromCenterY = fromRect.top + fromRect.height / 2;
        const toCenterX = toRect.left + toRect.width / 2;
        const toCenterY = toRect.top + toRect.height / 2;

        setExitTarget({
          x: toCenterX - fromCenterX,
          y: toCenterY - fromCenterY,
          scale: toRect.width / fromRect.width,
        });
      }
    }

    setIsExiting(true);

    window.setTimeout(() => {
      onComplete();
    }, 520);
  }, [onComplete]);

  useEffect(() => {
    let active = true;

    // Tenta reproduzir o som de entrada imediatamente; se bloqueado pelo celular, oferece ativação por toque
    playDjIntroSound().then((played) => {
      if (!active) return;
      if (played) {
        soundPlayedRef.current = true;
      } else {
        setNeedsTapForSound(true);
      }
    });

    const timer = window.setTimeout(() => {
      if (active) {
        finishIntro();
      }
    }, 2000);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [finishIntro]);

  const handleInteraction = async () => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      setNeedsTapForSound(false);
      await unlockDjAudio();
      await playDjIntroSound();
      window.setTimeout(() => {
        finishIntro();
      }, 600);
    } else {
      finishIntro();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Abertura Loop Talents"
      onClick={handleInteraction}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden px-6 select-none ${
        isExiting ? 'pointer-events-none' : ''
      }`}
    >
      {/* Fundo escuro que se abre revelando a página inicial */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-[#050505]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_48%,rgba(255,255,255,0.14),transparent_70%)]" />
      </motion.div>

      {/* Botão discreto para pular entrada */}
      <motion.button
        type="button"
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        className="absolute right-4 top-4 z-20 inline-flex min-h-[44px] items-center px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
      >
        Pular
      </motion.button>

      {/* Prato de DJ (vinil girando + braço) que dissolve enquanto a logo se expande até o topo da home */}
      <div className="relative flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          initial={{ rotate: -40, scale: 0.84, opacity: 0 }}
          animate={
            isExiting
              ? { rotate: 360, scale: 1.12, opacity: 0 }
              : { rotate: 320, scale: 1, opacity: 1 }
          }
          transition={
            isExiting
              ? { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
              : { duration: 2.0, ease: [0.16, 1, 0.3, 1] }
          }
          className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle,transparent_44%,rgba(255,255,255,0.035)_45%,transparent_46%,transparent_58%,rgba(255,255,255,0.04)_59%,transparent_60%,transparent_74%,rgba(255,255,255,0.05)_75%,transparent_76%)] sm:h-80 sm:w-80"
        >
          <span className="absolute inset-2 rounded-full border border-dashed border-white/20" />
          <span className="absolute top-3 h-2 w-2 rounded-full bg-white/70" />
          <span className="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-white/40" />
        </motion.div>

        {/* Braço do toca-discos */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 100 140"
          fill="none"
          initial={{ rotate: -22, opacity: 0 }}
          animate={
            isExiting ? { rotate: -14, opacity: 0 } : { rotate: 4, opacity: 0.7 }
          }
          transition={
            isExiting
              ? { duration: 0.25, ease: 'easeOut' }
              : { duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }
          }
          style={{ transformOrigin: '78px 18px' }}
          className="pointer-events-none absolute -right-4 -top-6 h-32 w-24 sm:-right-6 sm:-top-8 sm:h-40 sm:w-28"
        >
          <circle cx="78" cy="18" r="9" stroke="#FFFFFF" strokeWidth="2" fill="#0A0A0C" />
          <path
            d="M76 26 L62 86 L46 112"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="40"
            y="109"
            width="10"
            height="16"
            rx="2"
            transform="rotate(28 40 109)"
            fill="#FFFFFF"
          />
        </motion.svg>

        {/* Contêiner de medida natural + expansão suave até a posição exata da logo na página inicial */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div ref={logoBoxRef} className="w-44 sm:w-56">
            <motion.img
              src={AGENCY_CONFIG.logo}
              alt={AGENCY_CONFIG.name}
              initial={{ scale: 0.88, opacity: 0, x: 0, y: 0 }}
              animate={
                isExiting
                  ? {
                      x: exitTarget.x,
                      y: exitTarget.y,
                      scale: exitTarget.scale,
                      opacity: 1,
                    }
                  : { scale: 1, opacity: 1, x: 0, y: 0 }
              }
              transition={
                isExiting
                  ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
              className="w-full object-contain mix-blend-screen"
            />
          </div>
        </div>
      </div>

      {/* Equalizador de DJ animado */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 mt-7 flex h-6 items-end justify-center gap-1.5"
      >
        {EQ_BARS.map((height, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0.2, opacity: 0.3 }}
            animate={{
              scaleY: [0.25, height, 0.35, height * 0.8, 0.3],
              opacity: [0.4, 1, 0.6, 0.95, 0.5],
            }}
            transition={{
              duration: 0.85,
              delay: i * 0.06,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: 'bottom' }}
            className="h-6 w-1 rounded-full bg-white"
          />
        ))}
      </motion.div>

      {/* Indicação sutil caso o navegador mobile peça um toque para liberar o som */}
      {needsTapForSound && !isExiting && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 mt-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-300"
        >
          <Volume2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          <span>Toque para ativar o som</span>
        </motion.p>
      )}
    </div>
  );
}
