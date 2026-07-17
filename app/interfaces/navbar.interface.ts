export interface User {
  id: string;
  email: string;
  username: string;
  role: "PLAYER" | "CLUB" | "ADMIN" | "SCOUT" | "AGENT" | "USER";
  has_active_subscription?: boolean;
  playerProfile?: { id: string; full_name: string };
  clubProfile?: { id: string; club_name: string };
  scoutProfile?: { id: string; full_name: string };
  agentProfile?: { id: string; full_name: string };
}

export interface Language {
  id: string;
  code: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
  image_url?: string;
}

export interface NavbarProps {
  lang: string;
  setLang: React.Dispatch<React.SetStateAction<string>>;
}