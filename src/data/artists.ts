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
    name: 'Manzzy',
    slug: 'manzzy',
    image: '',
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
    image: '',
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
    image: '',
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
    name: 'Vinicius C',
    slug: 'vinicius-c',
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
    image: '',
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
