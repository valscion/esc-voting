/**
 * Shared constants and types for ESC Voting app.
 * Safe to import from both server and client code.
 */

export const RATINGS = {
  "🔥": "Fire – absolute banger",
  "❤️": "Heart – really love it",
  "😊": "Smile – it's good",
  "😐": "Meh – not feeling it",
  "💀": "Dead – please no",
} as const;

export type RatingEmoji = keyof typeof RATINGS;

export interface Game {
  id: string;
  token: string;
  closed: number;
  created_at: string;
}

export interface Song {
  id: string;
  country: string;
  artist: string;
  song: string;
  flag: string;
  runningOrder: number;
}

export interface Voter {
  id: string;
  name: string;
}

export interface Vote {
  id: string;
  voter: string;
  country: string;
  rating: RatingEmoji;
}

/**
 * The set of ESC 2025 songs. Used as source of truth when creating a new game.
 */
export const ESC_SONGS = [
  { country: "Sweden", artist: "KAJ", song: "Bara bansen", flag: "🇸🇪" },
  { country: "Finland", artist: "Erika Vikman", song: "Ich komme", flag: "🇫🇮" },
  { country: "Norway", artist: "Kyle Alessandro", song: "Lighter", flag: "🇳🇴" },
  { country: "Denmark", artist: "Sissal", song: "Hallucination", flag: "🇩🇰" },
  { country: "Iceland", artist: "VÆB", song: "Róa", flag: "🇮🇸" },
  { country: "France", artist: "Louane", song: "Maman", flag: "🇫🇷" },
  { country: "Germany", artist: "Abor & Tynsky", song: "Baller", flag: "🇩🇪" },
  { country: "Spain", artist: "Melody", song: "Esa diva", flag: "🇪🇸" },
  { country: "Italy", artist: "Lucio Corsi", song: "Volevo essere un duro", flag: "🇮🇹" },
  { country: "United Kingdom", artist: "Remember Monday", song: "What the Hell Just Happened?", flag: "🇬🇧" },
  { country: "Ukraine", artist: "Ziferblat", song: "Bird of Pray", flag: "🇺🇦" },
  { country: "Israel", artist: "Yuval Raphael", song: "New Day Will Rise", flag: "🇮🇱" },
  { country: "Australia", artist: "Go-Jo", song: "Milkshake Man", flag: "🇦🇺" },
  { country: "Switzerland", artist: "Zoë Më", song: "Voyage", flag: "🇨🇭" },
  { country: "Portugal", artist: "Napa", song: "Deslocado", flag: "🇵🇹" },
  { country: "Croatia", artist: "Marko Bošnjak", song: "Lying to Myself", flag: "🇭🇷" },
  { country: "Greece", artist: "Klavdia", song: "Asteromáta", flag: "🇬🇷" },
  { country: "Austria", artist: "JJ", song: "Wasted Love", flag: "🇦🇹" },
  { country: "Netherlands", artist: "Claude", song: "C'est la vie", flag: "🇳🇱" },
  { country: "Ireland", artist: "Emmy and the Gem", song: "Laika", flag: "🇮🇪" },
  { country: "Poland", artist: "Justyna Steczkowska", song: "Gaja", flag: "🇵🇱" },
  { country: "Lithuania", artist: "Katarsis", song: "Tavo žodžiai", flag: "🇱🇹" },
  { country: "Czech Republic", artist: "Adonxs", song: "Kiss Kiss Goodbye", flag: "🇨🇿" },
  { country: "Estonia", artist: "Tommy Cash", song: "Espresso Macchiato", flag: "🇪🇪" },
  { country: "Belgium", artist: "Red Sebastian", song: "Strobe Lights", flag: "🇧🇪" },
  { country: "Malta", artist: "Miriana Conte", song: "Serving", flag: "🇲🇹" },
  { country: "Albania", artist: "Shkodra Elektronike", song: "Zjerm", flag: "🇦🇱" },
  { country: "Armenia", artist: "Parg", song: "Survivor", flag: "🇦🇲" },
  { country: "Azerbaijan", artist: "Mamagama", song: "Run With U", flag: "🇦🇿" },
  { country: "Cyprus", artist: "Theo Evan", song: "Breaking My Heart", flag: "🇨🇾" },
  { country: "Georgia", artist: "Mariam Shengelia", song: "Freedom", flag: "🇬🇪" },
  { country: "Latvia", artist: "Tautumeitas", song: "Bur man laime", flag: "🇱🇻" },
  { country: "Moldova", artist: "Sasha Bognibov", song: "SOS", flag: "🇲🇩" },
  { country: "Montenegro", artist: "Nina Žižić", song: "Dobrodošli", flag: "🇲🇪" },
  { country: "San Marino", artist: "Gabry Ponte", song: "Speed of Light", flag: "🇸🇲" },
  { country: "Serbia", artist: "Breskvica", song: "Midas", flag: "🇷🇸" },
  { country: "Slovenia", artist: "Klemen", song: "How Much Time Do We Have Left", flag: "🇸🇮" },
] as const;
