export const AGENCY_CONFIG = {
  name: 'Loop Talents',
  tagline: 'Mais que uma agência, somos um movimento.',
  logo: '/assets/aistudio/loop_logo_595970de.png',
  avatar: '/assets/aistudio/loop_logo_595970de.png',
  mark: '/loop/mark.svg',
  // Quando houver vídeo de show da capa, defina o caminho em /public/loop/ (ex: '/loop/hero.mp4')
  heroVideo: '',
  heroVideoPoster: '',
  // URL e capa oficial da playlist da Loop no Spotify
  playlistUrl: 'https://open.spotify.com/playlist/4tlPBCj1lEW8wSzKTHXlna?si=yXQkuyQYQEuswPz3d99eNw',
  playlistCover: '/assets/aistudio/Capa-Spotify-Loop-Talents-HD_1475dfd8.png',
  whatsappNumber: '5562984133623',
  whatsappDisplay: '(62) 98413-3623',
  instagramUrl: 'https://www.instagram.com/looptalents/',
  instagramHandle: '@looptalents',
} as const;

export function getGeneralWhatsAppUrl(): string {
  const message =
    'Olá! Vim pelo portfólio da Loop Talents e gostaria de informações sobre a contratação de um artista para meu evento.';
  return `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getArtistWhatsAppUrl(artistName: string): string {
  const message = `Olá! Vim pelo portfólio da Loop Talents e gostaria de consultar a disponibilidade de ${artistName} para um evento. A data é ___ e a cidade é ___.`;
  return `https://wa.me/${AGENCY_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
