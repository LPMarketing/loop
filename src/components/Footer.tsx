import { Instagram } from 'lucide-react';
import { AGENCY_CONFIG } from '../data/agency';

export function Footer() {
  return (
    <footer className="mt-8 pt-2 text-center">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-zinc-400 sm:text-sm">
          {AGENCY_CONFIG.tagline}
        </p>
        <a
          href={AGENCY_CONFIG.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[36px] items-center justify-center gap-1.5 px-2 text-xs text-zinc-500 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{AGENCY_CONFIG.instagramHandle}</span>
        </a>
      </div>
    </footer>
  );
}
