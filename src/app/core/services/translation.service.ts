import { Injectable } from '@angular/core';

/**
 * TranslationService — Live English → Kannada translation.
 *
 * Uses the free Google Translate unofficial endpoint (no API key needed).
 * Works on web and in the Capacitor WebView (internet connection required).
 * Falls back gracefully if offline.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private cache = new Map<string, TranslationResult>();

  /**
   * Translate English text to Kannada using Google Translate.
   * Returns both the Kannada script and a romanized transliteration.
   */
  async translate(englishText: string): Promise<TranslationResult> {
    const key = englishText.trim().toLowerCase();
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result = await this.fetchFromGoogle(englishText.trim());
    this.cache.set(key, result);
    return result;
  }

  private async fetchFromGoogle(text: string): Promise<TranslationResult> {
    // Google Translate unofficial JSON endpoint — free, no API key needed
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&dt=rm&q=${encodeURIComponent(text)}`;

    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();

      // Parse Kannada translation from response[0]
      let kannada = '';
      if (Array.isArray(data[0])) {
        kannada = data[0]
          .filter((seg: any[]) => seg && seg[0])
          .map((seg: any[]) => seg[0])
          .join('');
      }

      // Parse transliteration from response[0][x][3] or response[1]
      let transliteration = '';
      if (Array.isArray(data[0])) {
        transliteration = data[0]
          .filter((seg: any[]) => seg && seg[3])
          .map((seg: any[]) => seg[3])
          .join(' ');
      }
      // Some Google Translate responses put romanization in data[0][i][2] or data[1]
      if (!transliteration && Array.isArray(data[1]) && data[1][0]) {
        transliteration = Array.isArray(data[1][0]) ? data[1][0][1] : '';
      }

      return {
        kannada: kannada || text,
        transliteration: transliteration || this.toRomanApprox(kannada),
        english: text,
        isLive: true,
      };
    } catch (err) {
      console.warn('Google Translate fetch failed:', err);
      return {
        kannada: text,
        transliteration: '',
        english: text,
        isLive: false,
        error: 'Translation unavailable — check your internet connection.',
      };
    }
  }

  /**
   * Very rough phonetic approximation for Kannada script
   * when transliteration is missing (fallback only).
   */
  private toRomanApprox(kannada: string): string {
    const map: Record<string, string> = {
      'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ii', 'ಉ': 'u', 'ಊ': 'uu',
      'ಎ': 'e', 'ಏ': 'ee', 'ಐ': 'ai', 'ಒ': 'o', 'ಓ': 'oo', 'ಔ': 'au',
      'ಕ': 'ka', 'ಖ': 'kha', 'ಗ': 'ga', 'ಘ': 'gha', 'ಙ': 'nga',
      'ಚ': 'cha', 'ಛ': 'chha', 'ಜ': 'ja', 'ಝ': 'jha',
      'ಟ': 'ta', 'ಡ': 'da', 'ಣ': 'na',
      'ತ': 'tha', 'ದ': 'dha', 'ನ': 'na',
      'ಪ': 'pa', 'ಫ': 'pha', 'ಬ': 'ba', 'ಭ': 'bha', 'ಮ': 'ma',
      'ಯ': 'ya', 'ರ': 'ra', 'ಲ': 'la', 'ವ': 'va',
      'ಶ': 'sha', 'ಷ': 'sha', 'ಸ': 'sa', 'ಹ': 'ha', 'ಳ': 'la',
      '?': '?', '!': '!', ' ': ' ',
    };
    return [...kannada].map(c => map[c] || '').join('');
  }
}

export interface TranslationResult {
  kannada: string;
  transliteration: string;
  english: string;
  isLive: boolean;
  error?: string;
}
