import { Injectable } from '@angular/core';

/**
 * AudioService: abstraction for audio playback.
 * Currently uses Web Speech API (TTS) as a fallback when no audio URL is available.
 * A real Kannada TTS provider can be injected here in the future.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private _isPlaying = false;

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  async playAudioUrl(url: string): Promise<void> {
    this.stop();
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this._isPlaying = true;
      audio.onended = () => { this._isPlaying = false; resolve(); };
      audio.onerror = () => { this._isPlaying = false; reject(new Error('Audio playback failed')); };
      audio.play().catch(e => { this._isPlaying = false; reject(e); });
    });
  }

  speakKannada(text: string): Promise<void> {
    if (!this.isSupported()) return Promise.reject(new Error('Speech synthesis not supported'));
    this.stop();
    return new Promise((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'kn-IN';
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.onend = () => { this._isPlaying = false; resolve(); };
      utter.onerror = (e) => { this._isPlaying = false; reject(new Error(e.error)); };
      this.currentUtterance = utter;
      this._isPlaying = true;
      window.speechSynthesis.speak(utter);
    });
  }

  speak(text: string): Promise<void> {
    return this.speakKannada(text);
  }

  stop(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
    this._isPlaying = false;
    this.currentUtterance = null;
  }
}
