import { Injectable } from '@angular/core';

/**
 * Curated offline dictionary of common Kannada signs, places,
 * transport terms, emergencies, and tourist phrases.
 */
const KAN_TO_EN_DICTIONARY: Record<string, { en: string; transliteration: string }> = {
  // Cities & Regions
  'ಬೆಂಗಳೂರು': { en: 'Bengaluru (Bangalore)', transliteration: 'Bengaluru' },
  'ಮೈಸೂರು': { en: 'Mysuru (Mysore)', transliteration: 'Mysuru' },
  'ಮಂಗಳೂರು': { en: 'Mangaluru (Mangalore)', transliteration: 'Mangaluru' },
  'ಹುಬ್ಬಳ್ಳಿ': { en: 'Hubballi (Hubli)', transliteration: 'Hubballi' },
  'ಧಾರವಾಡ': { en: 'Dharwad', transliteration: 'Dharawada' },
  'ಬೆಳಗಾವಿ': { en: 'Belagavi (Belgaum)', transliteration: 'Belagavi' },
  'ಉಡುಪಿ': { en: 'Udupi', transliteration: 'Udupi' },
  'ಶಿವಮೊಗ್ಗ': { en: 'Shivamogga (Shimoga)', transliteration: 'Shivamogga' },

  // Transit & Signboards
  'ನಿಲ್ದಾಣ': { en: 'Station / Stop', transliteration: 'Nildaana' },
  'ಬಸ್ ನಿಲ್ದಾಣ': { en: 'Bus Station / Stand', transliteration: 'Bus Nildaana' },
  'ರೈಲ್ವೆ ನಿಲ್ದಾಣ': { en: 'Railway Station', transliteration: 'Railway Nildaana' },
  'ವಿಮಾನ ನಿಲ್ದಾಣ': { en: 'Airport', transliteration: 'Vimaana Nildaana' },
  'ಮೆಟ್ರೋ ನಿಲ್ದಾಣ': { en: 'Metro Station', transliteration: 'Metro Nildaana' },
  'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್': { en: 'Platform', transliteration: 'Platform' },
  'ಟಿಕೆಟ್ ಕೌಂಟರ್': { en: 'Ticket Counter', transliteration: 'Ticket Counter' },
  'ದಾರಿ': { en: 'Way / Road', transliteration: 'Daari' },
  'ರಸ್ತೆ': { en: 'Road / Street', transliteration: 'Raste' },
  'ಪ್ರವೇಶ': { en: 'Entrance / Entry', transliteration: 'Pravesha' },
  'ನಿರ್ಗಮನ': { en: 'Exit', transliteration: 'Nirgamana' },
  'ನಿಲ್ಲಿಸಿ': { en: 'Stop', transliteration: 'Nillisi' },
  'ನಿಧಾನವಾಗಿ ಚಲಿಸಿ': { en: 'Drive Slowly', transliteration: 'Nidhaanavaagi Chalisi' },
  'ಪಾರ್ಕಿಂಗ್': { en: 'Parking', transliteration: 'Parking' },
  'ಪಾರ್ಕಿಂಗ್ ಇಲ್ಲ': { en: 'No Parking', transliteration: 'Parking Illa' },

  // Public Places & Services
  'ಆಸ್ಪತ್ರೆ': { en: 'Hospital', transliteration: 'Aaspatre' },
  'ಔಷಧಿ ಅಂಗಡಿ': { en: 'Pharmacy / Chemist', transliteration: 'Aushadhi Angadi' },
  'ವೈದ್ಯರು': { en: 'Doctor', transliteration: 'Vaidyaru' },
  'ಪೊಲೀಸ್ ಠಾಣೆ': { en: 'Police Station', transliteration: 'Police Thaane' },
  'ಶೌಚಾಲಯ': { en: 'Restroom / Toilet', transliteration: 'Shouchaalaya' },
  'ಕುಡಿಯುವ ನೀರು': { en: 'Drinking Water', transliteration: 'Kudiyuva Neeru' },
  'ಹೋಟೆಲ್': { en: 'Hotel / Restaurant', transliteration: 'Hotel' },
  'ಊಟದ ಮನೆ': { en: 'Restaurant / Eatery', transliteration: 'Ootada Mane' },
  'ತಿಂಡಿ': { en: 'Snacks / Breakfast', transliteration: 'Thindi' },
  'ಬ್ಯಾಂಕ್': { en: 'Bank', transliteration: 'Bank' },
  'ಎಟಿಎಂ': { en: 'ATM', transliteration: 'ATM' },
  'ಅಂಚೆ ಕಚೇರಿ': { en: 'Post Office', transliteration: 'Anche Kacheri' },

  // Instructions & Actions
  'ಎಳೆಯಿರಿ': { en: 'Pull', transliteration: 'Eleyiri' },
  'ತಳ್ಳಿರಿ': { en: 'Push', transliteration: 'Thalliri' },
  'ತೆರೆದಿದೆ': { en: 'Open', transliteration: 'Theredide' },
  'ಮುಚ್ಚಲಾಗಿದೆ': { en: 'Closed', transliteration: 'Mucchalaagide' },
  'ಅಪಾಯ': { en: 'Danger', transliteration: 'Apaaya' },
  'ಎಚ್ಚರಿಕೆ': { en: 'Caution / Warning', transliteration: 'Eccharike' },
  'ಮಾಹಿತಿ': { en: 'Information', transliteration: 'Maahithi' },
  'ಸಹಾಯ': { en: 'Help', transliteration: 'Sahaaya' },

  // Polite & Common Words
  'ನಮಸ್ಕಾರ': { en: 'Hello / Greetings', transliteration: 'Namaskaara' },
  'ಧನ್ಯವಾದ': { en: 'Thank You', transliteration: 'Dhanyavaada' },
  'ಸ್ವಾಗತ': { en: 'Welcome', transliteration: 'Svaagatha' },
  'ಹೌದು': { en: 'Yes', transliteration: 'Houdu' },
  'ಇಲ್ಲ': { en: 'No', transliteration: 'Illa' },
  'ದಯವಿಟ್ಟು': { en: 'Please', transliteration: 'Dayavittu' },
  'ಎಷ್ಟು': { en: 'How much?', transliteration: 'Eshtu' },
  'ಎಲ್ಲಿ': { en: 'Where?', transliteration: 'Elli' },
};

/**
 * Reverse mapping for English -> Kannada instant dictionary
 */
const EN_TO_KAN_DICTIONARY: Record<string, { kn: string; transliteration: string }> = {};
for (const [kn, val] of Object.entries(KAN_TO_EN_DICTIONARY)) {
  const cleanEn = val.en.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  for (const part of cleanEn.split(/\s+/)) {
    if (part.length > 2 && !EN_TO_KAN_DICTIONARY[part]) {
      EN_TO_KAN_DICTIONARY[part] = { kn, transliteration: val.transliteration };
    }
  }
}

/**
 * TranslationService — Real-time English ⇄ Kannada translation with offline dictionary,
 * MyMemory open API, and phonetic transliteration engine.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private cache = new Map<string, TranslationResult>();

  /**
   * Translate English text to Kannada.
   * If input is already in Kannada script, automatically translates to English.
   */

async translate(text: string): Promise<TranslationResult> {
  const raw = text.trim();

  if (!raw) {
    return this.emptyResult();
  }

  // If input is Kannada, translate to English.
  if (this.isKannadaScript(raw)) {
    return this.translateToEnglish(raw);
  }

  const key = `en2kn:${raw.toLowerCase()}`;

  if (this.cache.has(key)) {
    return this.cache.get(key)!;
  }

  // Only use dictionary for exact word matches.
  const dictMatch = this.lookupEnDictionary(raw);

  if (dictMatch) {
    const result: TranslationResult = {
      kannada: dictMatch.kn,
      transliteration: dictMatch.transliteration,
      english: raw,
      isLive: false
    };

    this.cache.set(key, result);
    return result;
  }

  // Send complete sentence to translation API.
  const result = await this.translateOnline(raw, 'en', 'kn');

  if (result.kannada) {
    this.cache.set(key, result);
  }

  return result;
}


  /**
   * Translate Kannada (or any detected text) to English.
   * If input is in Roman / English script, automatically translates to Kannada.
   */

async translateToEnglish(text: string): Promise<TranslationResult> {
  const raw = text.trim();

  if (!raw) {
    return this.emptyResult();
  }

  // If input is English, translate to Kannada.
  if (!this.isKannadaScript(raw)) {
    return this.translate(raw);
  }

  const key = `kn2en:${raw}`;

  if (this.cache.has(key)) {
    return this.cache.get(key)!;
  }

  // Only use dictionary for exact phrase matches.
  const dictMatch = this.lookupKnDictionary(raw);

  if (dictMatch) {
    const result: TranslationResult = {
      kannada: raw,
      transliteration: dictMatch.transliteration,
      english: dictMatch.en,
      isLive: false
    };

    this.cache.set(key, result);
    return result;
  }

  // Send complete sentence to translation API.
  const result = await this.translateOnline(raw, 'kn', 'en');

  if (result.english) {
    this.cache.set(key, result);
  }

  return result;
}


  /** Returns true if the text contains Kannada Unicode characters (U+0C80–U+0CFF). */
  isKannadaScript(text: string): boolean {
    return /[\u0C80-\u0CFF]/.test(text);
  }

  /**
   * Fast rule-based Kannada → Roman script transliteration.
   * Translates phonetic syllables into English characters so tourist can read & pronounce it.
   */
  transliterateKannada(text: string): string {
    const vowels: Record<string, string> = {
      'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u', 'ಊ': 'oo',
      'ಋ': 'ru', 'ಎ': 'e', 'ಏ': 'ee', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oo', 'ಔ': 'au',
    };
    const consonants: Record<string, string> = {
      'ಕ': 'k', 'ಖ': 'kh', 'ಗ': 'g', 'ಘ': 'gh', 'ಙ': 'ng',
      'ಚ': 'ch', 'ಛ': 'chh', 'ಜ': 'j', 'ಝ': 'jh', 'ಞ': 'ny',
      'ಟ': 't', 'ಠ': 'th', 'ಡ': 'd', 'ಢ': 'dh', 'ಣ': 'n',
      'ತ': 'th', 'ಥ': 'th', 'ದ': 'd', 'ಧ': 'dh', 'ನ': 'n',
      'ಪ': 'p', 'ಫ': 'ph', 'ಬ': 'b', 'ಭ': 'bh', 'ಮ': 'm',
      'ಯ': 'y', 'ರ': 'r', 'ಲ': 'l', 'ವ': 'v', 'ಶ': 'sh', 'ಷ': 'sh', 'ಸ': 's', 'ಹ': 'h', 'ಳ': 'l',
    };
    const matras: Record<string, string> = {
      'ಾ': 'a', 'ಿ': 'i', 'ೀ': 'ee', 'ು': 'u', 'ೂ': 'oo', 'ೃ': 'ru',
      'ೆ': 'e', 'ೇ': 'ee', 'ೈ': 'ai', 'ೊ': 'o', 'ೋ': 'oo', 'ೌ': 'au',
    };
    const virama = '್';
    const anusvara = 'ಂ';
    const visarga = 'ಃ';

    let res = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (vowels[ch]) {
        res += vowels[ch];
      } else if (consonants[ch]) {
        const base = consonants[ch];
        if (next === virama) {
          res += base;
          i++; // skip virama
        } else if (next && matras[next]) {
          res += base + matras[next];
          i++; // skip matra
        } else {
          res += base + 'a';
        }
      } else if (ch === anusvara) {
        res += 'n';
      } else if (ch === visarga) {
        res += 'h';
      } else {
        res += ch;
      }
    }

    // Capitalize first letter of each word
    return res
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  }

  // --------------------------------------------------------------------------
  // Private API Methods
  // --------------------------------------------------------------------------

  private lookupKnDictionary(text: string): { en: string; transliteration: string } | null {
    const clean = text.trim().replace(/[?.!,]/g, '');
    if (KAN_TO_EN_DICTIONARY[clean]) {
      return KAN_TO_EN_DICTIONARY[clean];
    }
    // Only exact match - never hijack full sentences with substring matching
    return null;
  }

  private lookupEnDictionary(text: string): { kn: string; transliteration: string } | null {
    const clean = text.trim().toLowerCase().replace(/[?.!,]/g, '');
    if (EN_TO_KAN_DICTIONARY[clean]) {
      return EN_TO_KAN_DICTIONARY[clean];
    }
    // Only exact match - never hijack full sentences with substring matching
    return null;
  }

  
private isValidTranslation(
  translated: string,
  targetLang: string
): boolean {
  if (!translated || !translated.trim()) {
    return false;
  }

  if (targetLang === 'kn') {
    return this.isKannadaScript(translated);
  }

  if (targetLang === 'en') {
    return (
      /[a-zA-Z]/.test(translated) &&
      !this.isKannadaScript(translated)
    );
  }

  return false;
}

private createResult(
  original: string,
  translated: string,
  isToKannada: boolean
): TranslationResult {
  const kannada = isToKannada ? translated : original;
  const english = isToKannada ? original : translated;

  return {
    kannada,
    english,
    transliteration: this.transliterateKannada(kannada),
    isLive: true
  };
}

private emptyResult(): TranslationResult {
  return {
    kannada: '',
    english: '',
    transliteration: '',
    isLive: false
  };
}



private async translateOnline(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {

  const isToKannada = targetLang === 'kn';

  // Provider 1: Google Translate
  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      q: text
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params}`,
        { signal: controller.signal }
      );

      if (response.ok) {
        const data = await response.json();

        const translated = Array.isArray(data?.[0])
          ? data[0]
              .filter((segment: any) =>
                Array.isArray(segment) &&
                typeof segment[0] === 'string'
              )
              .map((segment: any) => segment[0])
              .join('')
              .trim()
          : '';

        if (this.isValidTranslation(translated, targetLang)) {
          return this.createResult(
            text,
            translated,
            isToKannada
          );
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.warn('Google translation failed:', error);
  }

  // Provider 2: MyMemory
  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${sourceLang}|${targetLang}`
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?${params}`,
        { signal: controller.signal }
      );

      if (response.ok) {
        const data = await response.json();

        const translated =
          data?.responseData?.translatedText?.trim() || '';

        if (
          !translated.startsWith('MYMEMORY WARNING') &&
          this.isValidTranslation(translated, targetLang)
        ) {
          return this.createResult(
            text,
            translated,
            isToKannada
          );
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.warn('MyMemory translation failed:', error);
  }

  // Both APIs failed.
  return {
    kannada: isToKannada ? '' : text,
    english: isToKannada ? text : '',
    transliteration: isToKannada
      ? ''
      : this.transliterateKannada(text),
    isLive: false,
    error: 'Translation is currently unavailable. Please try again.'
  };
}

}

export interface TranslationResult {
  kannada: string;
  transliteration: string;
  english: string;
  isLive: boolean;
  error?: string;
}
