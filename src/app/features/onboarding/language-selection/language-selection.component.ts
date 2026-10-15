import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../core/services/preferences.service';

interface LanguageOption {
  code: 'en' | 'hi' | 'kn';
  nameNative: string;
  nameEn: string;
  badge: string;
  supported: boolean;
}

@Component({
  selector: 'app-language-selection',
  standalone: true,
  template: `
    <div class="page-container onboarding-page" role="main">
      <header class="onboarding-header">
        <button class="btn-icon" id="btn-back-lang" (click)="goBack()" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="step-indicator" aria-label="Step 1 of 3">
          <span class="step active" aria-hidden="true"></span>
          <span class="step" aria-hidden="true"></span>
          <span class="step" aria-hidden="true"></span>
        </div>
        <button class="skip-btn" id="btn-skip-lang" (click)="skip()" aria-label="Skip to home screen">Skip</button>
      </header>

      <div class="page-content animate-fade-in">
        <h1 class="onboarding-title">Choose your language</h1>
        <p class="onboarding-subtitle">We'll use this to show phrases and content in your preferred language.</p>

        <div class="lang-list" role="radiogroup" aria-label="Language options">
          @for (lang of languages; track lang.code) {
            <button
              class="selection-card"
              [class.selected]="selectedLang() === lang.code"
              [id]="'lang-' + lang.code"
              (click)="select(lang.code)"
              role="radio"
              [attr.aria-checked]="selectedLang() === lang.code"
              [attr.aria-label]="lang.nameEn">
              <span class="lang-badge" [class.font-kannada]="lang.code === 'kn'" aria-hidden="true">{{ lang.badge }}</span>
              <div class="lang-info">
                <span class="lang-native" [class.font-kannada]="lang.code === 'kn'">{{ lang.nameNative }}</span>
                <span class="lang-en">{{ lang.nameEn }}</span>
              </div>
              <div class="check-circle" [class.selected]="selectedLang() === lang.code" aria-hidden="true">
                @if (selectedLang() === lang.code) {
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
            </button>
          }
        </div>

        <div class="onboarding-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>You can change this later in Settings.</span>
        </div>
      </div>

      <footer class="onboarding-footer">
        <button class="btn-primary" id="btn-continue-lang" (click)="continueNext()" [disabled]="!selectedLang()" aria-label="Continue to next step">
          Continue
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
          </svg>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .lang-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .lang-badge {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #E8F5EF;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .lang-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lang-native {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .lang-en {
      font-size: 0.82rem;
      color: var(--color-text-muted);
    }

    .coming-soon {
      font-size: 0.7rem;
      margin-right: 0.5rem;
      border-radius: 99px;
      padding: 0.25rem 0.6rem;
    }

    .onboarding-note {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--color-text-muted);
      font-size: 0.85rem;
      padding: 0.8rem 1rem;
      background: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 12px;
    }
  `],
})
export class LanguageSelectionComponent {
  selectedLang = signal<'en' | 'hi' | 'kn' | null>(null);

  languages: LanguageOption[] = [
    { code: 'en', nameNative: 'English', nameEn: 'English', badge: 'E', supported: true },
    { code: 'hi', nameNative: 'हिन्दी', nameEn: 'Hindi', badge: 'हि', supported: true },
    { code: 'kn', nameNative: 'ಕನ್ನಡ', nameEn: 'Kannada', badge: 'ಕ', supported: false },
  ];

  constructor(private router: Router, private prefs: PreferencesService) {
    this.selectedLang.set(this.prefs.prefs().language);
  }

  select(code: 'en' | 'hi' | 'kn'): void {
    this.selectedLang.set(code);
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }

  skip(): void {
    const lang = this.selectedLang();
    this.prefs.update({
      ...(lang ? { language: lang } : {}),
      onboardingComplete: true,
    });
    this.router.navigate(['/home']);
  }

  continueNext(): void {
    const lang = this.selectedLang();
    if (!lang) return;
    this.prefs.update({ language: lang });
    this.router.navigate(['/onboarding/purpose']);
  }
}
