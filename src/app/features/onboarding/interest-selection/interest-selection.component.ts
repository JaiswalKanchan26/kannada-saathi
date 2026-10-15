import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../core/services/preferences.service';

interface InterestOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-interest-selection',
  standalone: true,
  template: `
    <div class="page-container onboarding-page" role="main">
      <header class="onboarding-header">
        <button class="btn-icon" id="btn-back-interests" (click)="goBack()" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="step-indicator" aria-label="Step 3 of 3">
          <span class="step done" aria-hidden="true"></span>
          <span class="step done" aria-hidden="true"></span>
          <span class="step active" aria-hidden="true"></span>
        </div>
        <button class="skip-btn" id="btn-skip-interests" (click)="skip()" aria-label="Skip to home screen">Skip</button>
      </header>

      <div class="page-content animate-fade-in" style="padding-bottom: 0.5rem;">
        <h1 class="onboarding-title">What would you like to explore?</h1>
        <p class="onboarding-subtitle">Select all that apply. This personalizes your experience.</p>

        <!-- Interest chips -->
        <div class="interest-grid" role="group" aria-label="Interest options">
          @for (interest of interests; track interest.id) {
            <button
              class="interest-chip"
              [class.selected]="isSelected(interest.id)"
              [id]="'interest-' + interest.id"
              (click)="toggleInterest(interest.id)"
              [attr.aria-pressed]="isSelected(interest.id)"
              [attr.aria-label]="interest.label + (isSelected(interest.id) ? ' selected' : '')">
              <span class="chip-icon" aria-hidden="true">
                @if (interest.id === 'travel') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 20 2.5c-1.5-1.5-3.5-1-5 1.5L11.5 7.5 3.3 5.7c-.5-.1-.9.1-1.2.4l-.7.7c-.4.4-.3 1 .1 1.4l5.6 4.3-3.4 3.4-2.3-.6c-.3-.1-.7 0-.9.3l-.4.4c-.3.3-.2.8.1 1.1l2.5 2 2 2.5c.3.3.8.4 1.1.1l.4-.4c.3-.3.4-.6.3-.9l-.6-2.3 3.4-3.4 4.3 5.6c.4.4 1 .5 1.4.1l.7-.7c.3-.3.5-.7.4-1.2z"/>
                  </svg>
                } @else if (interest.id === 'food') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2v20M21 2c0 2.5-1.5 4.5-3 5v15"/>
                    <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
                    <path d="M9 9v13"/>
                  </svg>
                } @else if (interest.id === 'shopping') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8h12l1.5 12H4.5L6 8z"/>
                    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                  </svg>
                } @else if (interest.id === 'study-work') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="7" width="18" height="13" rx="2"/>
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <path d="M12 12v2M3 12h18"/>
                  </svg>
                } @else if (interest.id === 'culture') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18M3 18h18"/>
                    <path d="M6 18V10M10 18V10M14 18V10M18 18V10"/>
                    <path d="M2 10h20"/>
                    <path d="M12 3L2 10h20L12 3z"/>
                  </svg>
                } @else if (interest.id === 'everyday') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12c0 4.4-4 8-9 8a9.9 9.9 0 0 1-4.3-.9L3 20l1.2-3.7A7.7 7.7 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/>
                    <circle cx="8.5" cy="12" r="0.9" fill="currentColor"/>
                    <circle cx="12" cy="12" r="0.9" fill="currentColor"/>
                    <circle cx="15.5" cy="12" r="0.9" fill="currentColor"/>
                  </svg>
                }
              </span>
              <span class="chip-label">{{ interest.label }}</span>
              <div class="chip-circle" [class.selected]="isSelected(interest.id)" aria-hidden="true">
                @if (isSelected(interest.id)) {
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
            </button>
          }
        </div>

        <!-- Level section -->
        <div class="level-section">
          <p class="section-heading">Kannada level</p>
          <div class="level-options" role="radiogroup" aria-label="Kannada language level">
            @for (level of levels; track level.id) {
              <button
                class="level-card"
                [class.selected]="selectedLevel() === level.id"
                [id]="'level-' + level.id"
                (click)="selectLevel(level.id)"
                role="radio"
                [attr.aria-checked]="selectedLevel() === level.id">
                <span class="level-icon-wrapper" aria-hidden="true">
                  @if (level.id === 'beginner') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22V12"/>
                      <path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"/>
                      <path d="M12 15c0-3-2-5-5-5 0 3 2 5 5 5z"/>
                    </svg>
                  } @else if (level.id === 'some') {
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 21c3.5-2 7.5-5.5 9.5-11"/>
                      <path d="M14.5 10c1-3 3.5-5 6.5-5-1 3-2.5 5.5-6.5 5z"/>
                      <path d="M8.5 17c-1-1.8-1-3.5.5-4.5 1.8.8 2 2.5-.5 4.5z"/>
                      <path d="M11.5 13.5c1-1.8 2.5-2.5 4-1.5-1 1.8-1.8 2.5-4 1.5z"/>
                      <path d="M13.5 9c-.8-1.5 0-3 1.5-3 .8 1.5.2 3-1.5 3z"/>
                    </svg>
                  }
                </span>
                <span class="level-label">{{ level.label }}</span>
                <div class="check-circle" [class.selected]="selectedLevel() === level.id" aria-hidden="true">
                  @if (selectedLevel() === level.id) {
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  }
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      <footer class="onboarding-footer">
        <button class="btn-primary" id="btn-continue-interests" (click)="continueNext()" aria-label="Finish onboarding">
          Continue
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
          </svg>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .interest-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.625rem;
      margin-bottom: 2rem;
    }

    .interest-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.65rem 0.95rem;
      border-radius: 9999px;
      border: 1.5px solid #E5E7EB;
      background: #FFFFFF;
      color: #374151;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: var(--font-sans);
      min-height: 42px;
    }

    .interest-chip:hover {
      border-color: var(--color-primary-200);
      background: #FFFFFF;
      color: var(--color-primary);
    }

    .interest-chip.selected {
      border: 2px solid var(--color-primary);
      background: #FFFFFF;
      color: var(--color-primary);
      font-weight: 600;
    }

    .chip-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .chip-label {
      line-height: 1.2;
    }

    .chip-circle {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      border: 1.5px solid #D1D5DB;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.25rem;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .chip-circle.selected {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .level-section {
      margin-top: 0.5rem;
    }

    .level-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .level-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.15rem;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: var(--font-sans);
      width: 100%;
    }

    .level-card:hover {
      border-color: var(--color-primary-200);
      background: #FFFFFF;
    }

    .level-card.selected {
      border: 2px solid var(--color-primary);
      background: #FFFFFF;
    }

    .level-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .level-label {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text-primary);
      text-align: left;
    }
  `],
})
export class InterestSelectionComponent {
  selectedInterests = signal<string[]>([]);
  selectedLevel = signal<'beginner' | 'some' | null>(null);

  interests: InterestOption[] = [
    { id: 'travel', label: 'Travel & Tourism' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'study-work', label: 'Study & Work' },
    { id: 'culture', label: 'Culture & Heritage' },
    { id: 'everyday', label: 'Everyday Communication' },
  ];

  levels = [
    { id: 'beginner' as const, label: 'Beginner — I\'m just starting' },
    { id: 'some' as const, label: 'I know a little Kannada' },
  ];

  constructor(private router: Router, private prefs: PreferencesService) {
    const p = this.prefs.prefs();
    this.selectedInterests.set(p.interests || []);
    this.selectedLevel.set(p.level);
  }

  isSelected(id: string): boolean {
    return this.selectedInterests().includes(id);
  }

  toggleInterest(id: string): void {
    const current = this.selectedInterests();
    if (current.includes(id)) {
      this.selectedInterests.set(current.filter(i => i !== id));
    } else {
      this.selectedInterests.set([...current, id]);
    }
  }

  selectLevel(level: 'beginner' | 'some'): void {
    this.selectedLevel.set(level);
  }

  goBack(): void {
    this.router.navigate(['/onboarding/purpose']);
  }

  skip(): void {
    this.prefs.update({ onboardingComplete: true });
    this.router.navigate(['/home']);
  }

  continueNext(): void {
    this.prefs.update({
      interests: this.selectedInterests(),
      level: this.selectedLevel(),
      onboardingComplete: true,
    });
    this.router.navigate(['/home']);
  }
}
