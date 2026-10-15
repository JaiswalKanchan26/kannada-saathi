import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../core/services/preferences.service';

interface PurposeOption {
  id: 'tourist' | 'resident' | 'both';
  titleEn: string;
  descEn: string;
}

@Component({
  selector: 'app-purpose-selection',
  standalone: true,
  template: `
    <div class="page-container onboarding-page" role="main">
      <header class="onboarding-header">
        <button class="btn-icon" id="btn-back-purpose" (click)="goBack()" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="step-indicator" aria-label="Step 2 of 3">
          <span class="step done" aria-hidden="true"></span>
          <span class="step active" aria-hidden="true"></span>
          <span class="step" aria-hidden="true"></span>
        </div>
        <button class="skip-btn" id="btn-skip-purpose" (click)="skip()" aria-label="Skip to home screen">Skip</button>
      </header>

      <div class="page-content animate-fade-in">
        <h1 class="onboarding-title">Why are you here?</h1>
        <p class="onboarding-subtitle">This helps us show the most relevant phrases and situations.</p>

        <div class="purpose-grid" role="radiogroup" aria-label="Purpose options">
          @for (option of purposes; track option.id) {
            <button
              class="selection-card"
              [class.selected]="selectedPurpose() === option.id"
              [id]="'purpose-' + option.id"
              (click)="select(option.id)"
              role="radio"
              [attr.aria-checked]="selectedPurpose() === option.id"
              [attr.aria-label]="option.titleEn">
              <div class="purpose-icon-wrapper" aria-hidden="true">
                @if (option.id === 'tourist') {
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="6" height="8.5" rx="1.5"/>
                    <path d="M5.5 11V8.5a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1V11"/>
                    <circle cx="4.5" cy="20.5" r="0.75" fill="currentColor"/>
                    <circle cx="7.5" cy="20.5" r="0.75" fill="currentColor"/>
                    <circle cx="16" cy="4.5" r="2.2"/>
                    <path d="M16 7v6.5l-2.2 3.5-1.8 4"/>
                    <path d="M16 13.5l2.2 3.5 1.5 4"/>
                    <path d="M16 8.5l-7.5 4"/>
                  </svg>
                } @else if (option.id === 'resident') {
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20v-9.5z"/>
                    <path d="M9 21.5V13h6v8.5"/>
                  </svg>
                } @else if (option.id === 'both') {
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4.5"/>
                    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>
                  </svg>
                }
              </div>

              <div class="purpose-info">
                <span class="purpose-title">{{ option.titleEn }}</span>
                <span class="purpose-desc">{{ option.descEn }}</span>
              </div>

              <div class="check-circle" [class.selected]="selectedPurpose() === option.id" aria-hidden="true">
                @if (selectedPurpose() === option.id) {
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
            </button>
          }
        </div>
      </div>

      <footer class="onboarding-footer">
        <button class="btn-primary" id="btn-continue-purpose" (click)="continueNext()" [disabled]="!selectedPurpose()" aria-label="Continue to next step">
          Continue
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
          </svg>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .purpose-grid {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .purpose-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--color-primary);
    }

    .purpose-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }

    .purpose-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .purpose-desc {
      font-size: 0.82rem;
      color: var(--color-text-muted);
    }
  `],
})
export class PurposeSelectionComponent {
  selectedPurpose = signal<'tourist' | 'resident' | 'both' | null>(null);

  purposes: PurposeOption[] = [
    { id: 'tourist', titleEn: 'Visiting Karnataka', descEn: 'Tourist, traveller, or short stay' },
    { id: 'resident', titleEn: 'Living, Studying, or Working', descEn: 'Newcomer settling into Karnataka' },
    { id: 'both', titleEn: 'Both', descEn: 'Exploring and building my life here' },
  ];

  constructor(private router: Router, private prefs: PreferencesService) {
    this.selectedPurpose.set(this.prefs.prefs().purpose);
  }

  select(id: 'tourist' | 'resident' | 'both'): void {
    this.selectedPurpose.set(id);
  }

  goBack(): void {
    this.router.navigate(['/onboarding/language']);
  }

  skip(): void {
    const purpose = this.selectedPurpose();
    this.prefs.update({
      ...(purpose ? { purpose } : {}),
      onboardingComplete: true,
    });
    this.router.navigate(['/home']);
  }

  continueNext(): void {
    const purpose = this.selectedPurpose();
    if (!purpose) return;
    this.prefs.update({ purpose });
    this.router.navigate(['/onboarding/interests']);
  }
}
