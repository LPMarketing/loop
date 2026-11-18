export interface ArtistTrack {
  title: string;
  cover: string;
  streams: string;
  url?: string;
}

export interface Artist {
  name: string;
  slug: string;
  image: string;
  imagePosition: string;
  wideImage?: string;
  wideImagePosition?: string;
  genre: string;
  bio: string;
  video: string;
  videoPoster: string;
  instagram: string;
  spotify: string;
  youtube: string;
  pressKit: string;
  // Até 3 sucessos no Spotify: { title, cover, streams (ex: '+10M Streams'), url }
  topTracks: ArtistTrack[];
}

export const ARTISTS: Artist[] = [
  {
    name: 'Vinicius C',
    slug: 'vinicius-c',
    image: '/assets/aistudio/Vinicius_Cavalcante_d82c46da.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Fxbriciu',
    slug: 'fxbriciu',
    image: '/assets/aistudio/Fxbriciu_9ad23907.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'LOW',
    slug: 'low',
    image: '/assets/aistudio/Low_f59dfeb8.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Cintia Souza',
    slug: 'cintia-souza',
    image: '/assets/aistudio/Cintia_Souza_52b1778f.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Manzzy',
    slug: 'manzzy',
    image: '/assets/aistudio/Manzzy_5b33efe5.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Bruno Fogueteiro',
    slug: 'bruno-fogueteiro',
    image: '/assets/aistudio/Bruno_Fogueteiro_b56d0519.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Anna Julia',
    slug: 'anna-julia',
    image: '/assets/aistudio/Anna_Julia_e3db63ea.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Vinicius Santos',
    slug: 'vinicius-santos',
    image: '/assets/aistudio/Vinicius_Santos_710d8652.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Unk',
    slug: 'unk',
    image: '/assets/aistudio/Unk_3159e48d.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Gabriella K',
    slug: 'gabriella-k',
    image: '/assets/aistudio/Gabriella_Kemilly_2790418d.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Ana Flávia',
    slug: 'ana-flavia',
    image: '/assets/aistudio/Ana_Fl_via_c951d351.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Douglas Sutra',
    slug: 'douglas-sutra',
    image: '/assets/aistudio/Douglas_Sutra_96a2b086.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Ferreira',
    slug: 'ferreira',
    image: '/assets/aistudio/Ferreira_3c9bd6ce.PNG',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
  {
    name: 'Tubas',
    slug: 'tubas',
    image: '/assets/aistudio/image_076e23d5.png',
    imagePosition: 'center top',
    genre: '',
    bio: '',
    video: '',
    videoPoster: '',
    instagram: '',
    spotify: '',
    youtube: '',
    pressKit: '',
    topTracks: [],
  },
];

export function getArtistBySlug(slug: string): Artist | undefined {
  return ARTISTS.find((artist) => artist.slug === slug);
}

export function getArtistIndex(slug: string): number {
  return ARTISTS.findIndex((artist) => artist.slug === slug);
}
