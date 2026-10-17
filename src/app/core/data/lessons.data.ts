import { Lesson } from '../models/models';

export const LESSONS: Lesson[] = [
  {
    id: 'l001',
    category: 'Basics',
    titleEn: 'Common Greetings',
    durationMinutes: 5,
    icon: 'hand',
    order: 1,
    phraseIds: ['l001-p1', 'l001-p2', 'l001-p3', 'l001-p4', 'l001-p5'],
  },
  {
    id: 'l002',
    category: 'Basics',
    titleEn: 'Numbers 1–10',
    durationMinutes: 8,
    icon: 'hash',
    order: 2,
    phraseIds: ['l002-p1', 'l002-p2', 'l002-p3', 'l002-p4'],
  },
  {
    id: 'l003',
    category: 'Travel',
    titleEn: 'Getting Around',
    durationMinutes: 6,
    icon: 'bus',
    order: 3,
    phraseIds: ['p001', 'p002', 'p003', 'p005', 'p006'],
  },
  {
    id: 'l004',
    category: 'Food',
    titleEn: 'At a Restaurant',
    durationMinutes: 7,
    icon: 'utensils',
    order: 4,
    phraseIds: ['p007', 'p008', 'p009', 'p010', 'p011'],
  },
  {
    id: 'l005',
    category: 'Daily Life',
    titleEn: 'Polite Expressions',
    durationMinutes: 5,
    icon: 'heart',
    order: 5,
    phraseIds: ['l005-p1', 'l005-p2', 'l005-p3'],
  },
];

// Lesson-specific phrases (not in the main phrase list)
export interface LessonPhrase {
  id: string;
  kannada: string;
  transliteration: string;
  english: string;
  hindi?: string;
}

export const LESSON_PHRASES: LessonPhrase[] = [
  // l001: Greetings
  { id: 'l001-p1', kannada: 'ನಮಸ್ತೆ', transliteration: 'Namaste', english: 'Hello / Greetings', hindi: 'नमस्ते' },
  { id: 'l001-p2', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavada', english: 'Thank you', hindi: 'धन्यवाद' },
  { id: 'l001-p3', kannada: 'ದಯವಿಟ್ಟು', transliteration: 'Dayavittu', english: 'Please', hindi: 'कृपया' },
  { id: 'l001-p4', kannada: 'ಕ್ಷಮಿಸಿ', transliteration: 'Kshamisi', english: 'Sorry / Excuse me', hindi: 'माफ करना' },
  { id: 'l001-p5', kannada: 'ಹೌದು / ಇಲ್ಲ', transliteration: 'Haudu / Illa', english: 'Yes / No', hindi: 'हाँ / नहीं' },
  // l002: Numbers
  { id: 'l002-p1', kannada: 'ಒಂದು, ಎರಡು, ಮೂರು', transliteration: 'Ondu, eradu, muru', english: 'One, Two, Three', hindi: 'एक, दो, तीन' },
  { id: 'l002-p2', kannada: 'ನಾಲ್ಕು, ಐದು, ಆರು', transliteration: 'Nalku, aidu, aru', english: 'Four, Five, Six', hindi: 'चार, पाँच, छह' },
  { id: 'l002-p3', kannada: 'ಏಳು, ಎಂಟು, ಒಂಬತ್ತು', transliteration: 'Elu, entu, ombattu', english: 'Seven, Eight, Nine', hindi: 'सात, आठ, नौ' },
  { id: 'l002-p4', kannada: 'ಹತ್ತು', transliteration: 'Hattu', english: 'Ten', hindi: 'दस' },
  // l005: Polite
  { id: 'l005-p1', kannada: 'ಚೆನ್ನಾಗಿದ್ದೀರಾ?', transliteration: 'Chennagidira?', english: 'How are you?', hindi: 'आप कैसे हैं?' },
  { id: 'l005-p2', kannada: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', transliteration: 'Nanu chennagiddene', english: 'I am fine', hindi: 'मैं ठीक हूँ' },
  { id: 'l005-p3', kannada: 'ಶುಭ ದಿನ', transliteration: 'Shubha dina', english: 'Good day', hindi: 'शुभ दिन' },
];
