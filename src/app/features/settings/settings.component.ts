import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { PreferencesService } from '../../core/services/preferences.service';
import { LessonService } from '../../core/services/lesson.service';
import { ActivityService } from '../../core/services/activity.service';
import { UserPreferences } from '../../core/models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, BottomNavComponent],
  template: `
    <div class="settings-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="settings-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back to profile" id="settings-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">App Settings</h1>

        <div class="header-placeholder"></div>
      </header>

      <!-- Scrollable Main Content -->
      <div class="settings-scroll-content animate-fade-in">
        <!-- Personal Info Card -->
        <section class="settings-card">
          <div class="card-section-header">
            <div class="section-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 class="card-section-title">Personal Profile</h2>
          </div>

          <div class="setting-row">
            <div class="setting-text">
              <label for="display-name-input" class="setting-label">Display Name</label>
              <span class="setting-desc">Shown in your daily greetings & dashboard</span>
            </div>
            <div class="input-wrap">
              <input
                id="display-name-input"
                type="text"
                class="text-input"
                [(ngModel)]="displayName"
                (blur)="updateDisplayName()"
                placeholder="Your name"
                maxlength="30"
              />
            </div>
          </div>
        </section>

        <!-- Appearance & Accessibility Card -->
        <section class="settings-card">
          <div class="card-section-header">
            <div class="section-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 0 0 20v-20z"/>
              </svg>
            </div>
            <h2 class="card-section-title">Appearance & Display</h2>
          </div>

          <!-- Theme Selector -->
          <div class="setting-block">
            <div class="setting-label">Theme Mode</div>
            <div class="segmented-control" role="radiogroup" aria-label="Theme mode selection">
              <!-- Light Button -->
              <button
                class="segment-btn"
                [class.active]="currentPrefs.theme === 'light'"
                (click)="setTheme('light')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.theme === 'light'"
                id="theme-light-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <span>Light</span>
              </button>

              <!-- Dark Button -->
              <button
                class="segment-btn"
                [class.active]="currentPrefs.theme === 'dark'"
                (click)="setTheme('dark')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.theme === 'dark'"
                id="theme-dark-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span>Dark</span>
              </button>

              <!-- System / Auto Button -->
              <button
                class="segment-btn"
                [class.active]="currentPrefs.theme === 'system'"
                (click)="setTheme('system')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.theme === 'system'"
                id="theme-system-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span>Auto</span>
              </button>
            </div>
          </div>

          <!-- Kannada Font Size Selector -->
          <div class="setting-block" style="margin-top: 1rem;">
            <div class="setting-label">Kannada Script Size</div>
            <div class="segmented-control" role="radiogroup" aria-label="Font size selection">
              <button
                class="segment-btn"
                [class.active]="currentPrefs.textSize === 'sm'"
                (click)="setTextSize('sm')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.textSize === 'sm'"
                id="font-sm-btn"
              >
                Standard
              </button>
              <button
                class="segment-btn"
                [class.active]="currentPrefs.textSize === 'md'"
                (click)="setTextSize('md')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.textSize === 'md'"
                id="font-md-btn"
              >
                Medium
              </button>
              <button
                class="segment-btn"
                [class.active]="currentPrefs.textSize === 'lg'"
                (click)="setTextSize('lg')"
                type="button"
                role="radio"
                [attr.aria-checked]="currentPrefs.textSize === 'lg'"
                id="font-lg-btn"
              >
                Large
              </button>
            </div>

            <!-- Interactive Script Size Preview -->
            <div class="font-preview-box">
              <span class="preview-label">Live Preview:</span>
              <span
                class="font-kannada preview-text"
                [class.preview-sm]="currentPrefs.textSize === 'sm'"
                [class.preview-md]="currentPrefs.textSize === 'md'"
                [class.preview-lg]="currentPrefs.textSize === 'lg'"
              >
                ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರ?
              </span>
            </div>
          </div>
        </section>

        <!-- Audio & Speech Card -->
        <section class="settings-card">
          <div class="card-section-header">
            <div class="section-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </div>
            <h2 class="card-section-title">Audio & Pronunciation</h2>
          </div>

          <div class="setting-row">
            <div class="setting-text">
              <div class="setting-label">Speech Pronunciation</div>
              <span class="setting-desc">Enable text-to-speech audio voice for phrases</span>
            </div>
            <label class="toggle-switch" aria-label="Toggle speech pronunciation">
              <input
                type="checkbox"
                [(ngModel)]="audioEnabled"
                (change)="toggleAudio()"
                id="toggle-audio-switch"
              />
              <span class="slider"></span>
            </label>
          </div>
        </section>

        <!-- Data & Storage Card -->
        <section class="settings-card">
          <div class="card-section-header">
            <div class="section-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <h2 class="card-section-title">Data & Storage</h2>
          </div>

          <div class="setting-row">
            <div class="setting-text">
              <div class="setting-label" style="color:#DC2626;">Reset Learning Progress</div>
              <span class="setting-desc">Clear lesson completion marks and practice stats</span>
            </div>
            <button class="danger-btn outline" (click)="confirmResetProgress()" id="btn-reset-progress">
              Reset
            </button>
          </div>

          <div class="setting-row">
            <div class="setting-text">
              <div class="setting-label" style="color:#DC2626;">Clear All App Data</div>
              <span class="setting-desc">Wipe all preferences, bookmarks, and restart setup</span>
            </div>
            <button class="danger-btn solid" (click)="confirmResetAll()" id="btn-clear-all">
              Clear All
            </button>
          </div>
        </section>

        <!-- About App Card -->
        <div class="about-card">
          <!-- Official Emblem Logo -->
          <div class="about-emblem" aria-hidden="true">
            <img src="assets/Namma_Logo.png" alt="Namma Kannada Logo" class="about-logo-img" />
          </div>

          <h3 class="about-app-name">Namma Kannada (ನಮ್ಮ ಕನ್ನಡ)</h3>
          <div class="about-badge-row">
            <span class="about-tag">Version 1.0.0</span>
            <span class="about-tag">100% Offline Ready</span>
          </div>

          <p class="about-tagline">
            Empowering tourists and newcomers to speak everyday Kannada with confidence, joy, and heart.
          </p>

          <div class="about-footer-info">
            Built for Karnataka • Mobile-First PWA
          </div>
        </div>
      </div>

      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      max-height: 100dvh;
      overflow: hidden;
      background: #F9FAF9;
    }

    .settings-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Dark Green Top Header with Curved Bottom */
    .settings-header {
      flex-shrink: 0;
      background: #176B57;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem 0.85rem;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.2);
      z-index: 10;
    }

    .header-back-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
      margin-left: -6px;
      flex-shrink: 0;
    }

    .header-back-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.01em;
      text-align: center;
    }

    .header-placeholder {
      width: 40px;
      flex-shrink: 0;
    }

    /* Scrollable Container */
    .settings-scroll-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5rem 1rem calc(var(--nav-height) + var(--safe-bottom) + 1.25rem);
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    /* Settings Group Card */
    .settings-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }

    .card-section-header {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin-bottom: 0.95rem;
    }

    .section-icon-box {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-section-title {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #176B57;
      margin: 0;
    }

    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #F3F4F6;
    }

    .setting-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .setting-row:first-of-type {
      padding-top: 0;
    }

    .setting-block {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 0.45rem 0;
    }

    .setting-text {
      flex: 1;
      text-align: left;
    }

    .setting-label {
      font-size: 0.92rem;
      font-weight: 700;
      color: #111827;
      line-height: 1.3;
    }

    .setting-desc {
      font-size: 0.76rem;
      color: #6B7280;
      display: block;
      margin-top: 2px;
      line-height: 1.35;
    }

    /* Text Input */
    .input-wrap {
      flex-shrink: 0;
    }

    .text-input {
      background: #F9FAF9;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 0.5rem 0.85rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #111827;
      width: 140px;
      text-align: right;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .text-input:focus {
      outline: none;
      border-color: #176B57;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(23, 107, 87, 0.12);
    }

    /* Segmented Control (Pills with icons) */
    .segmented-control {
      display: flex;
      background: #F3F4F6;
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
      border: 1px solid #E5E7EB;
    }

    .segment-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0.55rem 0.65rem;
      border: none;
      background: transparent;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #4B5563;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      white-space: nowrap;
    }

    .segment-btn:hover:not(.active) {
      color: #111827;
      background: rgba(255, 255, 255, 0.5);
    }

    .segment-btn.active {
      background: #176B57;
      color: #FFFFFF;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(23, 107, 87, 0.25);
    }

    /* Interactive Font Size Preview */
    .font-preview-box {
      margin-top: 0.45rem;
      padding: 0.65rem 0.85rem;
      background: #F9FAF9;
      border: 1px solid #EAEFEA;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .preview-label {
      font-size: 0.72rem;
      color: #9CA3AF;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .preview-text {
      color: #176B57;
      font-weight: 600;
      transition: font-size 0.2s ease;
    }

    .preview-sm {
      font-size: 1rem;
    }

    .preview-md {
      font-size: 1.25rem;
    }

    .preview-lg {
      font-size: 1.5rem;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #D1D5DB;
      transition: 0.25s ease;
      border-radius: 26px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: #FFFFFF;
      transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    input:checked + .slider {
      background-color: #176B57;
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    /* Danger Actions */
    .danger-btn {
      border-radius: 10px;
      padding: 0.45rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      white-space: nowrap;
    }

    .danger-btn.outline {
      background: #FEF2F2;
      color: #DC2626;
      border: 1.5px solid #FECACA;
    }

    .danger-btn.outline:hover {
      background: #FEE2E2;
      border-color: #F87171;
    }

    .danger-btn.solid {
      background: #DC2626;
      color: #FFFFFF;
      border: 1.5px solid #DC2626;
    }

    .danger-btn.solid:hover {
      background: #B91C1C;
      border-color: #B91C1C;
    }

    /* About Kannada Saathi Card */
    .about-card {
      text-align: center;
      padding: 1.5rem 1.25rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }

    .about-emblem {
      display: flex;
      justify-content: center;
      margin-bottom: 0.75rem;
    }

    .about-logo-img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .about-app-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .about-badge-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .about-tag {
      font-size: 0.72rem;
      font-weight: 600;
      background: #E8F5EF;
      color: #176B57;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid #B2E4D0;
    }

    .about-tagline {
      font-size: 0.82rem;
      color: #4B5563;
      margin: 0.75rem auto 0;
      line-height: 1.45;
      max-width: 310px;
    }

    .about-footer-info {
      font-size: 0.72rem;
      color: #9CA3AF;
      margin-top: 0.95rem;
      font-weight: 500;
    }
  `],
})
export class SettingsComponent implements OnInit {
  currentPrefs: UserPreferences;
  displayName = '';
  audioEnabled = true;

  constructor(
    private preferencesService: PreferencesService,
    private lessonService: LessonService,
    private activityService: ActivityService,
    private router: Router
  ) {
    this.currentPrefs = this.preferencesService.prefs();
  }

  ngOnInit(): void {
    this.currentPrefs = this.preferencesService.prefs();
    this.displayName = this.currentPrefs.displayName;
    this.audioEnabled = this.currentPrefs.audioEnabled;
  }

  updateDisplayName(): void {
    if (this.displayName.trim()) {
      this.preferencesService.update({ displayName: this.displayName.trim() });
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.preferencesService.update({ theme });
    this.currentPrefs = this.preferencesService.prefs();
  }

  setTextSize(textSize: 'sm' | 'md' | 'lg'): void {
    this.preferencesService.update({ textSize });
    this.currentPrefs = this.preferencesService.prefs();
  }

  toggleAudio(): void {
    this.preferencesService.update({ audioEnabled: this.audioEnabled });
    this.currentPrefs = this.preferencesService.prefs();
  }

  confirmResetProgress(): void {
    if (confirm('Are you sure you want to reset your lesson progress?')) {
      this.lessonService.resetProgress();
      alert('Lesson progress reset successfully.');
    }
  }

  confirmResetAll(): void {
    if (confirm('Are you sure you want to clear all data and start onboarding again?')) {
      this.preferencesService.reset();
      this.lessonService.resetProgress();
      this.activityService.clear();
      this.router.navigate(['/welcome']);
    }
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
