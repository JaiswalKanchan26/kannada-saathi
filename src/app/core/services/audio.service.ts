import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * AudioService: abstraction for Kannada audio playback.
 *
 * Multi-tier engine:
 * 1. On Android/iOS: Uses @capacitor-community/text-to-speech (native TTS engine).
 *    This works 100% reliably on any Android phone regardless of whether the user
 *    installed a specific Kannada voice — Android's built-in TTS engine handles it.
 * 2. On Web (desktop / browser): Uses Web Speech API or Google Translate TTS streaming fallback.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private _isPlaying = false;
  private kannadaVoice: SpeechSynthesisVoice | null = null;
  private nativeTTS: any = null;

  constructor() {
    this.initNativeTTS();
    this.initVoices();
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || Capacitor.isNativePlatform());
  }

  /**
   * Initialize native TTS plugin for Capacitor (Android/iOS).
   */
  private async initNativeTTS(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      this.nativeTTS = TextToSpeech;
    } catch (e) {
      console.warn('Native TTS plugin not available:', e);
    }
  }

  /**
   * Initialize and discover Kannada voices for Web Speech API fallback.
   */
  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

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
    if (window.speechSynthesis) {
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
   * Speak Kannada text.
   * - On mobile (Android/iOS): uses native TTS engine via Capacitor plugin.
   * - On web: tries Web Speech API first, then streams from Google Translate TTS.
   */
  async speakKannada(text: string): Promise<void> {
    if (!text || !text.trim()) return;

    this.stop();

    // === NATIVE ANDROID / iOS path ===
    if (Capacitor.isNativePlatform() && this.nativeTTS) {
      try {
        this._isPlaying = true;
        await this.nativeTTS.speak({
          text: text.trim(),
          lang: 'kn-IN',
          rate: 0.85,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        this._isPlaying = false;
        return;
      } catch (nativeErr) {
        console.warn('Native TTS failed, trying fallback:', nativeErr);
        this._isPlaying = false;
        // Fall through to web fallback
      }
    }

    // === WEB path: try Web Speech API first ===
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        await this.speakViaWebSpeech(text);
        return;
      } catch (webErr) {
        console.warn('Web Speech API failed, using streaming TTS fallback:', webErr);
      }
    }

    // === Ultimate fallback: Google Translate TTS streaming ===
    await this.playOnlineTTS(text);
  }

  /**
   * Online TTS fallback via Google Translate audio stream.
   * Works on desktop browsers without a Kannada voice installed.
   */
  private playOnlineTTS(text: string): Promise<void> {
    const encoded = encodeURIComponent(text.trim());
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=kn&q=${encoded}`;
    return this.playAudioUrl(url);
  }

  /**
   * Web Speech API TTS with mobile-specific workarounds.
   */
  private speakViaWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
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

        // Safety timeout in case mobile browser drops the onend event
        const maxDuration = Math.max(5000, text.length * 300);
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

        // Small delay to avoid Android Chrome cancel-then-speak deadlock
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

  /** Public alias — always speaks Kannada */
  speak(text: string): Promise<void> {
    return this.speakKannada(text);
  }

  stop(): void {
    // Stop native TTS if active
    if (Capacitor.isNativePlatform() && this.nativeTTS) {
      try {
        this.nativeTTS.stop();
      } catch { /* ignore */ }
    }

    // Stop HTML5 audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch { /* ignore */ }
      this.currentAudio = null;
    }

    // Stop Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch { /* ignore */ }
    }

    this._isPlaying = false;
    this.currentUtterance = null;
  }
}
