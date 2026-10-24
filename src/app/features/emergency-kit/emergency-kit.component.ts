import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { EmergencyKitService, EmergencyCategory, EmergencyPhrase } from '../../core/data/emergency-kit.data';
import { AudioService } from '../../core/services/audio.service';

type ViewMode = 'list' | 'phrases' | 'show-to-someone';

@Component({
  selector: 'app-emergency-kit',
  standalone: true,
  imports: [BottomNavComponent, NgTemplateOutlet],
  template: `
    <div class="ek-viewport">

      <!-- SHOW-TO-SOMEONE FULLSCREEN MODE -->
      @if (viewMode() === 'show-to-someone' && selectedPhrase()) {
        <div class="show-screen animate-fade-in">
          <button class="show-close" id="btn-ek-close-show" (click)="exitShowMode()" aria-label="Close show mode">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="show-content">
            <p class="show-english">{{ selectedPhrase()!.english }}</p>
            <p class="show-kannada font-kannada">{{ selectedPhrase()!.kannada }}</p>
            <p class="show-translit">{{ selectedPhrase()!.transliteration }}</p>
          </div>
          <button class="show-speak-btn" id="btn-ek-show-speak" (click)="speakPhrase(selectedPhrase()!)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            Speak Out Loud
          </button>
        </div>
      }

      <!-- CATEGORY PHRASES VIEW -->
      @if (viewMode() === 'phrases' && selectedCategory()) {
        <header class="ek-header">
          <button class="back-btn" id="btn-ek-back-cat" (click)="backToList()" aria-label="Back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-cat-info">
            <h1 class="header-title">{{ selectedCategory()!.label }}</h1>
            <span class="header-sub font-kannada">{{ selectedCategory()!.labelKannada }}</span>
          </div>
          <div style="width: 38px"></div>
        </header>

        <div class="phrases-scroll animate-fade-in">
          @for (phrase of selectedCategory()!.phrases; track phrase.id) {
            <div class="phrase-card" [id]="'phrase-' + phrase.id">
              <div class="phrase-body" (click)="openShowMode(phrase)" role="button" tabindex="0" [attr.aria-label]="phrase.english">
                <p class="phrase-kn font-kannada">{{ phrase.kannada }}</p>
                <p class="phrase-tr">{{ phrase.transliteration }}</p>
                <p class="phrase-en">{{ phrase.english }}</p>
              </div>
              <div class="phrase-actions">
                <button class="ph-btn" [id]="'btn-speak-' + phrase.id" (click)="speakPhrase(phrase)" aria-label="Speak phrase">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  Speak
                </button>
                <button class="ph-btn ph-btn--show" [id]="'btn-show-' + phrase.id" (click)="openShowMode(phrase)" aria-label="Show to someone">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Show to Someone
                </button>
              </div>
            </div>
          }
        </div>
        <app-bottom-nav />
      }

      <!-- MAIN LIST VIEW (MATCHING MOCKUP) -->
      @if (viewMode() === 'list') {
        <header class="ek-header">
          <button class="back-btn" id="btn-ek-back-home" (click)="router.navigate(['/home'])" aria-label="Back to home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 class="header-title">Offline Mode + Emergency Kit</h1>
          <div style="width:38px"></div>
        </header>

        <div class="list-scroll animate-fade-in">
          <!-- CARD 1: Offline Mode Card with Toggle Switch -->
          <div class="offline-mode-card">
            <div class="om-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
                <path d="M9 7h6M9 11h6"/>
              </svg>
            </div>
            <div class="om-text">
              <span class="om-title">Offline Mode</span>
              <span class="om-sub">Available offline<br>Key features work without internet.</span>
            </div>
            <button
              class="ios-switch"
              [class.checked]="isOfflineEnabled()"
              (click)="toggleOfflineMode()"
              role="switch"
              [attr.aria-checked]="isOfflineEnabled()"
              id="switch-offline-mode"
              aria-label="Toggle offline mode"
            >
              <div class="ios-knob"></div>
            </button>
          </div>

          <!-- CARD 2: Emergency Kit Section -->
          <div class="emergency-kit-container">
            <div class="ek-header-box">
              <div class="ek-red-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="ek-header-text">
                <h2 class="ek-title">Emergency Kit</h2>
                <span class="ek-sub">Quick access for urgent situations</span>
              </div>
            </div>

            <!-- 4 List Rows (Police, Hospital, Help, Fire) -->
            <div class="ek-list-box">
              @for (cat of categories(); track cat.id; let last = $last) {
                <button
                  class="cat-row"
                  [id]="'btn-cat-' + cat.id"
                  (click)="openCategory(cat)"
                  [attr.aria-label]="cat.label + ' emergency phrases'"
                  [class.no-border]="last"
                >
                  <span class="cat-icon-badge" [style.background]="cat.color">
                    <ng-container [ngTemplateOutlet]="iconTpl" [ngTemplateOutletContext]="{icon: cat.icon}"></ng-container>
                  </span>
                  <div class="cat-text">
                    <span class="cat-label">{{ cat.label }}</span>
                    <span class="cat-sub font-kannada">{{ cat.labelKannada }}</span>
                  </div>
                  <svg class="cat-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              }
            </div>
          </div>
        </div>

        <app-bottom-nav />
      }

      <!-- Proper SVG icons for Police, Hospital, Help, Fire -->
      <ng-template #iconTpl let-icon="icon">
        @switch (icon) {
          @case ('police') {
            <!-- Police officer cap / shield badge icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v5M9.5 10.5h5"/>
            </svg>
          }
          @case ('hospital') {
            <!-- Hospital / medical cross icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <line x1="12" y1="7" x2="12" y2="17"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
          }
          @case ('help') {
            <!-- Help / exclamation dialog icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
          @case ('fire') {
            <!-- Fire flame icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          }
        }
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      max-height: 100dvh;
      overflow: hidden;
      background: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .ek-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: #F8F9FA;
      overflow: hidden;
      position: relative;
    }

    /* Uniform Emerald Header matching Home Screen */
    .ek-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      min-height: 56px;
      flex-shrink: 0;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.15);
      z-index: 10;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.18);
      border: none;
      color: #FFFFFF;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }

    .back-btn:active {
      background: rgba(255, 255, 255, 0.3);
    }

    .header-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      text-align: center;
      flex: 1;
    }

    .header-cat-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .header-sub {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.88);
      margin-top: 1px;
    }

    .list-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 1.1rem 1rem calc(var(--nav-height, 64px) + 2rem);
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    /* CARD 1: Offline Mode Card */
    .offline-mode-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 18px;
      padding: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .om-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 3px 8px rgba(23, 107, 87, 0.25);
    }

    .om-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .om-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1F2937;
    }

    .om-sub {
      font-size: 0.78rem;
      color: #6B7280;
      line-height: 1.35;
    }

    /* iOS style switch */
    .ios-switch {
      width: 48px;
      height: 28px;
      border-radius: 14px;
      background: #D1D5DB;
      border: none;
      padding: 2px;
      cursor: pointer;
      position: relative;
      transition: background 0.25s ease;
      flex-shrink: 0;
    }

    .ios-switch.checked {
      background: var(--color-primary, #176B57);
    }

    .ios-knob {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ios-switch.checked .ios-knob {
      transform: translateX(20px);
    }

    /* CARD 2: Emergency Kit Container */
    .emergency-kit-container {
      background: #FFFBFB;
      border: 1px solid #FEE2E2;
      border-radius: 20px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      box-shadow: 0 2px 10px rgba(220, 38, 38, 0.04);
    }

    .ek-header-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ek-red-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #EF4444;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
    }

    .ek-header-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ek-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .ek-sub {
      font-size: 0.8rem;
      color: #6B7280;
    }

    /* Enclosed list box */
    .ek-list-box {
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
    }

    .cat-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.95rem 1rem;
      width: 100%;
      background: #FFFFFF;
      border: none;
      border-bottom: 1px solid #F3F4F6;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }

    .cat-row.no-border {
      border-bottom: none;
    }

    .cat-row:active {
      background: #F9FAFB;
    }

    .cat-icon-badge {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    .cat-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cat-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1F2937;
    }

    .cat-sub {
      font-size: 0.84rem;
      color: #4B5563;
      font-weight: 500;
    }

    .cat-chevron {
      flex-shrink: 0;
    }

    /* Category Phrases View */
    .phrases-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 1rem 1rem calc(var(--nav-height, 64px) + 2rem);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .phrase-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .phrase-body {
      cursor: pointer;
    }

    .phrase-kn {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-primary, #176B57);
      margin: 0 0 0.35rem;
      line-height: 1.3;
    }

    .phrase-tr {
      font-size: 0.88rem;
      color: #6B7280;
      font-style: italic;
      margin: 0 0 0.35rem;
    }

    .phrase-en {
      font-size: 0.95rem;
      color: #1F2937;
      font-weight: 600;
      margin: 0;
    }

    .phrase-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.85rem;
      border-top: 1px solid #F3F4F6;
      padding-top: 0.75rem;
    }

    .ph-btn {
      flex: 1;
      height: 40px;
      border-radius: 10px;
      background: #F0FAF6;
      border: 1px solid #D9F2E8;
      color: var(--color-primary, #176B57);
      font-size: 0.85rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
    }

    .ph-btn--show {
      background: #FFFFFF;
      border-color: #D1D5DB;
      color: #374151;
    }

    /* Show mode fullscreen */
    .show-screen {
      position: fixed;
      inset: 0;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      z-index: 999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .show-close {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: none;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      align-self: flex-end;
    }

    .show-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.25rem;
      margin: auto 0;
    }

    .show-english {
      font-size: 1.15rem;
      opacity: 0.9;
      margin: 0;
    }

    .show-kannada {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.3;
      margin: 0;
    }

    .show-translit {
      font-size: 1.1rem;
      opacity: 0.85;
      font-style: italic;
      margin: 0;
    }

    .show-speak-btn {
      height: 56px;
      width: 100%;
      border-radius: 16px;
      background: #FFFFFF;
      color: var(--color-primary, #176B57);
      font-size: 1.05rem;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }

    .font-kannada {
      font-family: 'Noto Sans Kannada', system-ui, -apple-system, sans-serif;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class EmergencyKitComponent implements OnInit {
  viewMode = signal<ViewMode>('list');
  selectedCategory = signal<EmergencyCategory | null>(null);
  selectedPhrase = signal<EmergencyPhrase | null>(null);
  categories = signal<EmergencyCategory[]>([]);
  isOfflineEnabled = signal<boolean>(true);

  private service = inject(EmergencyKitService);
  private audioService = inject(AudioService);
  router = inject(Router);

  ngOnInit(): void {
    this.categories.set(this.service.getCategories());
    this.isOfflineEnabled.set(this.service.isOfflineModeEnabled());
  }

  toggleOfflineMode(): void {
    const next = !this.isOfflineEnabled();
    this.isOfflineEnabled.set(next);
    this.service.setOfflineModeEnabled(next);
  }

  openCategory(cat: EmergencyCategory): void {
    this.selectedCategory.set(cat);
    this.viewMode.set('phrases');
  }

  backToList(): void {
    this.selectedCategory.set(null);
    this.viewMode.set('list');
  }

  openShowMode(phrase: EmergencyPhrase): void {
    this.selectedPhrase.set(phrase);
    this.viewMode.set('show-to-someone');
  }

  exitShowMode(): void {
    this.viewMode.set('phrases');
  }

  speakPhrase(phrase: EmergencyPhrase): void {
    this.audioService.speakKannada(phrase.kannada);
  }
}
