
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum Sensitivity {
  LOW = 'low', // أذكى وأكثر مرونة
  MEDIUM = 'medium',
  HIGH = 'high' // حساس جداً للحركات والمخارج
}

export interface WordAlignment {
  word: string;
  start_ms: number;
  end_ms: number;
}

export interface Hadith {
  id: string;
  collection: string;
  number: number;
  text_plain: string;
  text_diacritic: string;
  narrator: string;
  isnad: string;
  translation?: string;
  explanation?: string;
}

export interface UserProgress {
  hadithId: string;
  status: 'new' | 'learning' | 'mastered';
  score: number;
  lastPracticed: string;
  wordsMastered: number;
  totalWords: number;
}

export type AppView = 'news' | 'practice' | 'library' | 'progress' | 'settings';
