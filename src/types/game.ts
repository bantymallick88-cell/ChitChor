export type GameMode = 'classic4' | 'extended5';

export type RoleType = 'raja' | 'rani' | 'katual' | 'sipahi' | 'chor';

export interface RoleConfig {
  id: RoleType;
  nameEnglish: string;
  nameHindi: string;
  points: number;
  subtitle: string;
  color: string;
  badgeBg: string;
  borderGlow: string;
  description: string;
  duty: string;
  isImmune?: boolean; // Raja, Rani, Katual don't get investigated
}

export const ROLES_METADATA: Record<RoleType, RoleConfig> = {
  raja: {
    id: 'raja',
    nameEnglish: 'RAJA',
    nameHindi: 'राजा (King)',
    points: 1000,
    subtitle: 'Supreme Emperor of the Realm',
    color: 'text-amber-300',
    badgeBg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/30',
    borderGlow: 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    description: 'The ruler of the court. Demands order and declares: "Mera Sipahi Kaun Hai?!"',
    duty: 'Holds absolute royal majesty. Automatically receives 1,000 points.',
    isImmune: true,
  },
  rani: {
    id: 'rani',
    nameEnglish: 'RANI',
    nameHindi: 'रानी (Queen)',
    points: 500, // 500 in 4p, 700 in 5p
    subtitle: 'Empress of Grace & Wisdom',
    color: 'text-pink-300',
    badgeBg: 'bg-gradient-to-br from-pink-500/20 to-rose-600/30',
    borderGlow: 'border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)]',
    description: 'The Queen of the realm. Safe from criminal accusations and honored across the kingdom.',
    duty: 'Reigns beside the King. Receives 500 (or 700) points.',
    isImmune: true,
  },
  katual: {
    id: 'katual',
    nameEnglish: 'KATUAL',
    nameHindi: 'कोतवाल (Commander)',
    points: 500,
    subtitle: 'Commander of the Royal Guard',
    color: 'text-purple-300',
    badgeBg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/30',
    borderGlow: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    description: 'High defender of the fortress. Present in 5-Player Extended Court.',
    duty: 'Protects the inner sanctum. Receives 500 points.',
    isImmune: true,
  },
  sipahi: {
    id: 'sipahi',
    nameEnglish: 'SIPAHI',
    nameHindi: 'सिपाही (Police / Guard)',
    points: 100,
    subtitle: 'Royal Inquisitor & Detective',
    color: 'text-emerald-300',
    badgeBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30',
    borderGlow: 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]',
    description: 'Answers the King’s summons and must investigate the court to catch the hidden Chor!',
    duty: 'Guess correctly to earn 100 points! Guess wrong, and the Chor steals your bounty.',
    isImmune: false,
  },
  chor: {
    id: 'chor',
    nameEnglish: 'CHOR',
    nameHindi: 'चोर (Thief)',
    points: 0,
    subtitle: 'Master of Deception & Stealth',
    color: 'text-red-400',
    badgeBg: 'bg-gradient-to-br from-red-500/20 to-neutral-900/40',
    borderGlow: 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    description: 'The elusive rogue lurking in plain sight. Keep a stone-cold poker face!',
    duty: 'Stay undiscovered! If Sipahi suspects someone else, you steal the 100 points bounty.',
    isImmune: false,
  },
};

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot?: boolean;
  score: number;
  roundScore: number;
  role?: RoleType;
  isRevealed?: boolean;
}

export type GamePhase = 
  | 'lobby'
  | 'dealing'
  | 'secret_peek'
  | 'police_action'
  | 'round_result';

export interface GuessResult {
  guesserId: string;
  guesserName: string;
  suspectId: string;
  suspectName: string;
  suspectRole: RoleType;
  isCorrect: boolean;
}

export interface RoundRecord {
  round: number;
  scores: Record<string, { role: RoleType; points: number }>;
  guessResult: GuessResult;
}

export interface GameState {
  roomId: string;
  mode: GameMode;
  phase: GamePhase;
  players: Player[];
  round: number;
  activeGuesserId: string | null;
  guessResult: GuessResult | null;
  history: RoundRecord[];
  playMode: 'online' | 'pass_and_play';
  passAndPlayCurrentIndex?: number;
}

