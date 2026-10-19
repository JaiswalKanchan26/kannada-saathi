import { Injectable } from '@angular/core';

/**
 * AudioService: abstraction for Kannada audio playback.
 * 
 * Multi-tier engine:
 * 1. Checks for on-device Kannada voice in Web Speech API (device TTS).
 * 2. If unsupported, language pack missing on mobile, or synthesis fails,
 *    seamlessly falls back to online streaming audio TTS.
 * 3. Works seamlessly on desktop, mobile Chrome, mobile Safari, and Capacitor Android WebView.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private _isPlaying = false;
  private kannadaVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initVoices();
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Initialize and discover Kannada voices if installed on the mobile device or browser.
   */
  private initVoices(): void {
    if (!this.isSupported()) return;

    const findVoice = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.kannadaVoice = voices.find(v => {
            const lang = (v.lang || '').toLowerCase().replace('_', '-');
            const name = (v.name || '').toLowerCase();
            return lang.startsWith('kn') || name.includes('kannada');
          }) || null;
        }
      } catch {
        // Ignore voice query errors
      }
    };

    findVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = findVoice;
    }
  }

  /**
   * Play any direct audio URL using an HTML5 Audio element
   */
  async playAudioUrl(url: string): Promise<void> {
    this.stop();
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      this._isPlaying = true;

      audio.onended = () => {
        this._isPlaying = false;
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        this._isPlaying = false;
        this.currentAudio = null;
        reject(new Error('Audio playback failed: ' + e));
      };

      audio.play().catch(e => {
        this._isPlaying = false;
        this.currentAudio = null;
        reject(e);
      });
    });
  }

  /**
   * Online TTS fallback using standard HTTP audio streaming.
   * Works on 100% of Android phones, iPhones, and Android WebViews without requiring
   * the user to download offline voice data.
   */
  private playOnlineTTS(text: string): Promise<void> {
    const encoded = encodeURIComponent(text.trim());
    // Google Translate TTS endpoint for Kannada (tl=kn)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=kn&q=${encoded}`;
    return this.playAudioUrl(url);
  }

  /**
   * Speak Kannada text using on-device TTS when possible, with automatic online fallback
   */
  async speakKannada(text: string): Promise<void> {
    if (!text || !text.trim()) return;

    this.stop();

    // If native speech synthesis is supported, attempt device TTS first
    if (this.isSupported()) {
      try {
        await this.speakViaWebSpeech(text);
        return;
      } catch (nativeErr) {
        // Native speech synthesis failed (often due to missing Kannada voice pack on mobile Android).
        // Fall through to online audio stream fallback.
        console.warn('Native speech synthesis failed or Kannada voice pack not installed on phone, using streaming TTS fallback:', nativeErr);
      }
    }

    // High-quality online audio fallback
    await this.playOnlineTTS(text);
  }

  private speakViaWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Resume if mobile Chrome's speech engine was paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'kn-IN';
        utter.rate = 0.85;
        utter.pitch = 1;

        if (this.kannadaVoice) {
          utter.voice = this.kannadaVoice;
        }

        let isDone = false;

        utter.onstart = () => {
          this._isPlaying = true;
        };

        utter.onend = () => {
          if (isDone) return;
          isDone = true;
          this._isPlaying = false;
          this.currentUtterance = null;
          resolve();
        };

        utter.onerror = (e) => {
          if (isDone) return;
          isDone = true;
          this._isPlaying = false;
          this.currentUtterance = null;
          reject(new Error(e.error || 'SpeechSynthesis failed'));
        };

        // Safety timeout in case mobile browser drops onend event
        const maxDuration = Math.max(4000, text.length * 250);
        const timeout = setTimeout(() => {
          if (!isDone && this._isPlaying) {
            isDone = true;
            this._isPlaying = false;
            this.currentUtterance = null;
            resolve();
          }
        }, maxDuration);

        this.currentUtterance = utter;
        this._isPlaying = true;

        // Slight microtask delay to prevent Android Chrome cancel-then-speak deadlock
        setTimeout(() => {
          try {
            window.speechSynthesis.speak(utter);
          } catch (speakErr) {
            clearTimeout(timeout);
            isDone = true;
            this._isPlaying = false;
            reject(speakErr);
          }
        }, 15);
      } catch (err) {
        reject(err);
      }
    });
  }

  speak(text: string): Promise<void> {
    return this.speakKannada(text);
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore stop error
      }
      this.currentAudio = null;
    }

    if (this.isSupported()) {
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore cancel error
      }
    }

    this._isPlaying = false;
    this.currentUtterance = null;
  }
}
