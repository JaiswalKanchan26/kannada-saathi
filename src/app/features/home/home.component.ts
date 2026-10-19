import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PreferencesService } from '../../core/services/preferences.service';
import { PhraseService } from '../../core/services/phrase.service';
import { AudioService } from '../../core/services/audio.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { Phrase } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="home-viewport" role="main">
      <!-- Top Header -->
      <header class="home-header">
        <div class="header-top-row">
          <div class="header-brand-wrap">
            <img src="assets/Namma_Logo.png" alt="Namma Kannada Logo" class="header-app-logo" />
            <div class="header-greeting">
              <p class="greeting-sub">Namaskara! 🙏</p>
              <h1 class="greeting-main">Ready to explore Karnataka?</h1>
            </div>
          </div>
          <button class="avatar-btn" id="btn-home-profile" (click)="router.navigate(['/profile'])" aria-label="Go to profile">
            <div class="avatar">{{ initials() }}</div>
          </button>
        </div>

        <!-- Search bar inside header -->
        <div class="search-bar-wrap" role="search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.2" class="search-icon" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            placeholder="Search phrases, places, festivals..."
            aria-label="Search phrases, places, and festivals"
            id="home-search"
            (input)="onSearch($event)"
            (keyup.enter)="goToSituations()"
          />
        </div>
      </header>

      <!-- Main Content Flow (Strictly fitted without scrollbars) -->
      <main class="home-content">
        <!-- 1. Daily Phrase Card -->
        <section class="card-phrase" aria-label="Today's phrase">
          <div class="phrase-header">
            <span class="phrase-label">Phrase of the Day</span>
            <a routerLink="/situations" class="phrase-view-all" id="link-view-all-phrases">
              <span>View all</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

          <div class="phrase-body" (click)="router.navigate(['/phrases', dailyPhrase().id])" role="button" tabindex="0" [attr.aria-label]="dailyPhrase().english">
            <p class="phrase-kannada font-kannada">{{ dailyPhrase().kannada }}</p>
            <p class="phrase-translit">{{ dailyPhrase().transliteration }}</p>
            <p class="phrase-english">{{ dailyPhrase().english }}</p>
          </div>

          <div class="phrase-actions">
            <button class="phrase-act-btn" id="btn-daily-listen" (click)="speakPhrase()" aria-label="Listen to phrase pronunciation">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <span>Listen</span>
            </button>

            <button class="phrase-act-btn" [class.active]="isSaved()" id="btn-daily-save" (click)="toggleSavePhrase()" aria-label="Save this phrase">
              <svg width="17" height="17" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ isSaved() ? 'Saved' : 'Save' }}</span>
            </button>

            <button class="phrase-act-btn" id="btn-daily-share" (click)="sharePhrase()" aria-label="Share this phrase">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </section>

        <!-- 2. Speak to a Local -->
        <button class="speak-banner" id="btn-speak-local" (click)="router.navigate(['/conversation'])" aria-label="Speak to a Local — tap to start conversation">
          <div class="speak-mic-box" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
          <div class="speak-text-col">
            <span class="speak-title">Speak to a Local</span>
            <span class="speak-sub">Tap to start conversation</span>
          </div>
          <svg class="chevron-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- 3. Explore by situation -->
        <section class="situations-section" aria-label="Explore by situation">
          <h2 class="section-title">Explore by situation</h2>
          <div class="situations-grid">
            <a routerLink="/situations/auto-transport" class="sit-tile" id="sit-transport" aria-label="Transport">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
                  <circle cx="7" cy="17" r="2"/>
                  <path d="M9 17h6"/>
                  <circle cx="17" cy="17" r="2"/>
                </svg>
              </div>
              <span class="sit-name">Transport</span>
            </a>

            <a routerLink="/situations/food-dining" class="sit-tile" id="sit-food" aria-label="Food and Dining">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2v20M21 2c0 2.5-1.5 4.5-3 5v15"/>
                  <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
                  <path d="M9 9v13"/>
                </svg>
              </div>
              <span class="sit-name">Food & Dining</span>
            </a>

            <a routerLink="/situations/shopping" class="sit-tile" id="sit-shopping" aria-label="Shopping">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 8h12l1.5 12H4.5L6 8z"/>
                  <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                </svg>
              </div>
              <span class="sit-name">Shopping</span>
            </a>

            <a routerLink="/situations/directions" class="sit-tile" id="sit-directions" aria-label="Directions">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span class="sit-name">Directions</span>
            </a>

            <a routerLink="/situations/accommodation" class="sit-tile" id="sit-accommodation" aria-label="Accommodation">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
                </svg>
              </div>
              <span class="sit-name">Accommodation</span>
            </a>

            <a routerLink="/situations/education-work" class="sit-tile" id="sit-study-work" aria-label="Study and Work">
              <div class="sit-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2"/>
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <path d="M12 12v2M3 12h18"/>
                </svg>
              </div>
              <span class="sit-name">Study & Work</span>
            </a>
          </div>
        </section>

        <!-- 4. Calendar banner: Coming up in Karnataka -->
        <a routerLink="/calendar" class="calendar-banner" id="banner-coming-up" aria-label="Coming up in Karnataka — Festivals, cultural events and more">
          <div class="calendar-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
            </svg>
          </div>
          <div class="calendar-text-col">
            <span class="calendar-title">Coming up in Karnataka</span>
            <span class="calendar-sub">Festivals, cultural events and more</span>
          </div>
          <svg class="chevron-gray" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </main>

      <!-- Copied Toast -->
      @if (showCopiedToast()) {
        <div class="toast animate-fade-in" role="status">Copied to clipboard!</div>
      }

      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      max-height: 100dvh;
      overflow: hidden;
      background: var(--color-bg);
    }

    .home-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      background: #F8F9FA;
      box-sizing: border-box;
    }

    .home-header {
      flex-shrink: 0;
      background: var(--color-primary);
      padding: 0.75rem 1rem 0.85rem;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.15);
      z-index: 10;
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .header-brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex: 1;
      min-width: 0;
    }

    .header-app-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #FFFFFF;
      padding: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      object-fit: contain;
      flex-shrink: 0;
    }

    .greeting-sub {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.82);
      margin: 0 0 2px;
      font-weight: 500;
    }

    .greeting-main {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.25;
    }

    .avatar-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      transition: background 0.15s ease;
    }

    .avatar-btn:hover .avatar {
      background: rgba(255, 255, 255, 0.3);
    }

    .search-bar-wrap {
      margin-top: 0.65rem;
      background: #FFFFFF;
      border-radius: 9999px;
      height: 38px;
      display: flex;
      align-items: center;
      padding: 0 0.85rem;
      gap: 0.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    .search-bar-wrap input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      font-size: 0.82rem;
      color: #1F2937;
      font-family: var(--font-sans);
    }

    .search-bar-wrap input::placeholder {
      color: #9CA3AF;
    }

    .home-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      padding: 0.55rem 0.9rem calc(var(--nav-height) + var(--safe-bottom) + 0.35rem);
      overflow: hidden;
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      gap: clamp(0.35rem, 1vh, 0.65rem);
    }

    .card-phrase {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      padding: 0.75rem 0.95rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .phrase-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .phrase-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #374151;
    }

    .phrase-view-all {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .phrase-body {
      cursor: pointer;
      text-align: left;
      padding: 0.1rem 0;
    }

    .phrase-kannada {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0.2rem 0 0.1rem;
      line-height: 1.3;
      font-family: var(--font-kannada);
    }

    .phrase-translit {
      font-size: 0.82rem;
      color: #6B7280;
      font-style: italic;
      margin: 0 0 0.15rem;
    }

    .phrase-english {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 0.45rem;
    }

    .phrase-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-top: 0.2rem;
    }

    .phrase-act-btn {
      background: #F3F9F6;
      border: 1px solid rgba(23, 107, 87, 0.12);
      border-radius: 10px;
      padding: 0.45rem 0.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      color: var(--color-primary);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-sans);
      transition: all 0.15s ease;
    }

    .phrase-act-btn:hover {
      background: #E5F3EC;
      border-color: var(--color-primary);
    }

    .phrase-act-btn.active {
      background: var(--color-primary);
      color: #FFFFFF;
      border-color: var(--color-primary);
    }

    .speak-banner {
      width: 100%;
      background: var(--color-primary);
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      padding: 0.65rem 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(23, 107, 87, 0.2);
      transition: background-color 0.15s ease, transform 0.1s ease;
      font-family: var(--font-sans);
      min-height: 52px;
    }

    .speak-banner:hover {
      background: var(--color-primary-dark);
    }

    .speak-mic-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #FFFFFF;
    }

    .speak-text-col {
      flex: 1;
      text-align: left;
    }

    .speak-title {
      display: block;
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .speak-sub {
      display: block;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.78);
      margin-top: 2px;
    }

    .chevron-icon {
      color: rgba(255, 255, 255, 0.7);
      flex-shrink: 0;
    }

    .situations-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .section-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
      text-align: left;
    }

    .situations-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .sit-tile {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 0.55rem 0.3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      text-decoration: none;
      transition: all 0.15s ease;
      font-family: var(--font-sans);
      min-height: 54px;
    }

    .sit-tile:hover {
      border-color: var(--color-primary);
      background: #F0FAF6;
    }

    .sit-icon {
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sit-name {
      font-size: 0.72rem;
      font-weight: 600;
      color: #374151;
      text-align: center;
      line-height: 1.15;
    }

    .calendar-banner {
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 0.65rem 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      transition: all 0.15s ease;
      min-height: 50px;
    }

    .calendar-banner:hover {
      border-color: var(--color-primary);
      background: #F0FAF6;
    }

    .calendar-icon-box {
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .calendar-text-col {
      flex: 1;
      text-align: left;
    }

    .calendar-title {
      display: block;
      font-size: 0.88rem;
      font-weight: 700;
      color: #1F2937;
      line-height: 1.2;
    }

    .calendar-sub {
      display: block;
      font-size: 0.72rem;
      color: #6B7280;
      margin-top: 1px;
    }

    .chevron-gray {
      color: #9CA3AF;
      flex-shrink: 0;
    }

    .toast {
      position: fixed;
      bottom: calc(var(--nav-height) + 1.25rem);
      left: 50%;
      transform: translateX(-50%);
      background: #1F2937;
      color: #FFFFFF;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: none;
    }
  `],
})
export class HomeComponent implements OnInit {
  dailyPhrase = signal<Phrase>({
    id: 'p005',
    situationId: 'directions',
    kannada: 'ಇದು ಎಲ್ಲಿದೆ?',
    transliteration: 'Idu ellide?',
    english: 'Where is this?',
    verified: true,
    tags: ['directions', 'daily'],
  });

  isSaved = signal(false);
  showCopiedToast = signal(false);
  initials = signal('GU');

  constructor(
    public router: Router,
    private prefs: PreferencesService,
    private phraseService: PhraseService,
    private audioService: AudioService,
  ) {}

  ngOnInit(): void {
    const p = this.prefs.prefs();
    const name = p.displayName || 'GU';
    this.initials.set(name.slice(0, 2).toUpperCase());

    const dp = this.phraseService.getDailyPhrase();
    if (dp) {
      this.dailyPhrase.set({
        ...dp,
        kannada: 'ಇದು ಎಲ್ಲಿದೆ?',
        transliteration: 'Idu ellide?',
        english: 'Where is this?',
      });
    }

    this.isSaved.set(this.phraseService.isPhraseSaved(this.dailyPhrase().id));
  }

  speakPhrase(): void {
    const phrase = this.dailyPhrase();
    if (!phrase) return;
    this.audioService.speak(phrase.kannada);
  }

  toggleSavePhrase(): void {
    const phrase = this.dailyPhrase();
    if (!phrase) return;
    this.phraseService.toggleSave(phrase.id);
    this.isSaved.set(this.phraseService.isPhraseSaved(phrase.id));
  }

  async sharePhrase(): Promise<void> {
    const phrase = this.dailyPhrase();
    if (!phrase) return;
    const text = `${phrase.kannada} (${phrase.transliteration}) — "${phrase.english}" | Kannada Saathi`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Today\'s Kannada Phrase', text });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showCopiedToast.set(true);
      setTimeout(() => this.showCopiedToast.set(false), 2000);
    }
  }

  onSearch(e: Event): void {
    const query = (e.target as HTMLInputElement).value;
    if (query.trim()) {
      this.router.navigate(['/situations'], { queryParams: { q: query.trim() } });
    }
  }

  goToSituations(): void {
    this.router.navigate(['/situations']);
  }
}
