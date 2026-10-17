export interface UserPreferences {
  language: 'en' | 'hi' | 'kn';
  purpose: 'tourist' | 'resident' | 'both' | null;
  interests: string[];
  level: 'beginner' | 'some' | null;
  theme: 'light' | 'dark' | 'system';
  textSize: 'sm' | 'md' | 'lg';
  audioEnabled: boolean;
  displayName: string;
  isGuest: boolean;
  onboardingComplete: boolean;
}

export interface Situation {
  id: string;
  icon: string;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  color: string;
  phraseCount?: number;
}

export interface Phrase {
  id: string;
  situationId: string;
  kannada: string;
  transliteration: string;
  english: string;
  hindi?: string;
  audioUrl?: string;
  note?: string;
  verified: boolean;
  tags?: string[];
  relatedPhraseIds?: string[];
}

export interface Lesson {
  id: string;
  category: string;
  titleEn: string;
  durationMinutes: number;
  phraseIds: string[];
  order: number;
  icon: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface SavedPhrase {
  phraseId: string;
  savedAt: string;
}

export interface RecentActivity {
  type: 'phrase_viewed' | 'phrase_saved' | 'lesson_completed' | 'event_viewed' | 'translation';
  referenceId: string;
  label: string;
  timestamp: string;
}

export interface FestivalGreeting {
  kannada: string;
  transliteration: string;
  english: string;
  culturalNote?: string;
}

export interface FestivalVisitorTips {
  bestTime?: string;
  celebrations?: string;
  source?: string;
  sourceUrl?: string;
}

export interface Festival {
  id: string;
  nameEn: string;
  nameKn: string;
  dateStr: string;          // ISO date string YYYY-MM-DD
  endDateStr?: string;      // For multi-day events
  location: string;
  locationKn?: string;
  category: 'festival' | 'cultural' | 'holiday';
  significance: string;
  culturalInsight?: string;
  visitorTips?: FestivalVisitorTips;
  greetings?: FestivalGreeting[];
  officialLink?: string;
  confirmed: boolean;       // true = confirmed date, false = approximate
  relatedPhraseIds?: string[];
  relatedLessonIds?: string[];
}

export interface TranslationResult {
  sourceText: string;
  sourceLang: string;
  targetText: string;
  targetLang: string;
  isDemo: boolean;
  timestamp: string;
}
