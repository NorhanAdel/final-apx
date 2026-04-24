export interface PlayerPhoto {
  id: string;
  image_url: string;
}

export interface PlayerVideo {
  id: string;
  video_url: string;
  title?: string;
}

export interface Player {
  _id: string;
  name: string;
  position: string;
  country: string;
  age: number;
  description: string;

  images: string[] | PlayerPhoto[];

  personalInfo: {
    fullName: string;
    birthDate: string;
    birthPlace: string;
    nationality: string;
    height: string;
    weight: string;
  };

  clubCareer: {
    currentClub: string;
    previousClubs: string[];
    debut: string;
  };

  footballInfo: {
    preferredFoot: string;
    jerseyNumber: number;
    playingStyle: string;
    strengths: string[];
  };

  rating: number;
}

export interface GQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}


interface Sport {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
  category?: string;
  sport?: Sport;
}