import { Injectable, signal, effect } from '@angular/core';
import { UserPreferences } from '../models/models';
import { StorageService } from './storage.service';

const PREFS_KEY = 'ks_preferences';

const DEFAULT_PREFS: UserPreferences = {
  language: 'en',
  purpose: null,
  interests: [],
  level: null,
  theme: 'light',
  textSize: 'md',
  audioEnabled: true,
  displayName: 'Guest',
  isGuest: true,
  onboardingComplete: false,
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private _prefs = signal<UserPreferences>(DEFAULT_PREFS);
  readonly prefs = this._prefs.asReadonly();

  constructor(private storage: StorageService) {
    const saved = this.storage.get<UserPreferences>(PREFS_KEY, DEFAULT_PREFS);
    // Always default to light mode — override any old 'system' saved preference
    const effectiveTheme = saved.theme === 'system' ? 'light' : (saved.theme ?? 'light');
    this._prefs.set({ ...DEFAULT_PREFS, ...saved, theme: effectiveTheme });
    this.applyTheme(this._prefs().theme);
    this.applyTextSize(this._prefs().textSize);
  }

  update(partial: Partial<UserPreferences>): void {
    const updated = { ...this._prefs(), ...partial };
    this._prefs.set(updated);
    this.storage.set(PREFS_KEY, updated);
    if (partial.theme) this.applyTheme(partial.theme);
    if (partial.textSize) this.applyTextSize(partial.textSize);
  }

  reset(): void {
    this._prefs.set(DEFAULT_PREFS);
    this.storage.remove(PREFS_KEY);
    this.applyTheme('light');
    this.applyTextSize('md');
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const matchMediaSupported = typeof window.matchMedia === 'function';
    const prefersDark = matchMediaSupported ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  private applyTextSize(size: 'sm' | 'md' | 'lg'): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('text-sm', 'text-md', 'text-lg');
    if (size !== 'md') {
      document.documentElement.classList.add(`text-${size}`);
    }
  }

  listenSystemTheme(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql && mql.addEventListener) {
      mql.addEventListener('change', () => {
        if (this._prefs().theme === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }
}
