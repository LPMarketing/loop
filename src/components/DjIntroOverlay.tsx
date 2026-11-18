import { Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENCY_CONFIG } from '../data/agency';
import { playDjIntroSound, unlockDjAudio } from '../utils/djSound';

interface DjIntroOverlayProps {
  onComplete: () => void;
}

const EQ_BARS = [0.45, 0.85, 0.6, 1, 0.7, 0.9, 0.5, 0.8, 0.55];

export function DjIntroOverlay({ onComplete }: DjIntroOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [needsTapForSound, setNeedsTapForSound] = useState(false);
  const completedRef = useRef(false);
  const soundPlayedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsExiting(true);
    window.setTimeout(() => {
      onComplete();
    }, 340);
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
    }, 2200);

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
      }, 650);
    } else {
      finishIntro();
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Abertura Loop Talents"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleInteraction}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 select-none"
    >
      {/* Luz de palco radial */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_48%,rgba(255,255,255,0.14),transparent_70%)]"
      />

      {/* Botão discreto para pular entrada */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
        className="absolute right-4 top-4 z-20 inline-flex min-h-[44px] items-center px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
      >
        Pular
      </button>

      {/* Prato de DJ (vinil girando + braço de toca-discos + logo oficial no centro) */}
      <div className="relative flex items-center justify-center">
        {/* Anel giratório estilo prato Technics / vinil */}
        <motion.div
          aria-hidden="true"
          initial={{ rotate: -40, scale: 0.84, opacity: 0 }}
          animate={{ rotate: 320, scale: 1, opacity: 1 }}
          transition={{ duration: 2.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle,transparent_44%,rgba(255,255,255,0.035)_45%,transparent_46%,transparent_58%,rgba(255,255,255,0.04)_59%,transparent_60%,transparent_74%,rgba(255,255,255,0.05)_75%,transparent_76%)] sm:h-80 sm:w-80"
        >
          {/* Marcações estroboscópicas na borda do prato */}
          <span className="absolute inset-2 rounded-full border border-dashed border-white/20" />
          <span className="absolute top-3 h-2 w-2 rounded-full bg-white/70" />
          <span className="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-white/40" />
        </motion.div>

        {/* Braço do toca-discos entrando sobre o vinil */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 100 140"
          fill="none"
          initial={{ rotate: -22, opacity: 0 }}
          animate={{ rotate: 4, opacity: 0.7 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Logo oficial LOOP TALENTS centralizada em destaque */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          <img
            src={AGENCY_CONFIG.logo}
            alt={AGENCY_CONFIG.name}
            className="w-44 object-contain mix-blend-screen sm:w-56"
          />
        </motion.div>
      </div>

      {/* Equalizador de DJ animado */}
      <div
        aria-hidden="true"
        className="mt-7 flex h-6 items-end justify-center gap-1.5"
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
      </div>

      {/* Indicação sutil caso o navegador mobile peça um toque para liberar o som */}
      {needsTapForSound && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-300"
        >
          <Volume2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          <span>Toque para ativar o som</span>
        </motion.p>
      )}
    </motion.div>
  );
}
