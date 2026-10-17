import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { PhraseService } from '../../../core/services/phrase.service';
import { Phrase, Situation } from '../../../core/models/models';
import { SITUATIONS } from '../../../core/data/situations.data';

@Component({
  selector: 'app-situation-detail',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="situation-detail-viewport" role="main">
      <!-- Solid Dark Green Top Header -->
      <header class="situation-detail-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back to situations" id="btn-back-situation">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">{{ situation()?.titleEn || 'Situation' }}</h1>

        <button class="header-search-btn" (click)="focusSearch()" aria-label="Search within this situation" id="btn-situation-search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </header>

      <!-- Scrollable Main Content -->
      <div class="situation-scroll-content animate-fade-in">
        @if (situation()) {
          <!-- Hero Overview Card -->
          <div class="hero-category-card">
            <div class="hero-top-row">
              <div class="hero-icon-box" aria-hidden="true">
                @if (situation()!.id === 'auto-transport') {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <path d="M9 17h6"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                } @else if (situation()!.id === 'food-dining') {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2v20M21 2c0 2.5-1.5 4.5-3 5v15"/>
                    <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
                    <path d="M9 9v13"/>
                  </svg>
                } @else if (situation()!.id === 'shopping') {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8h12l1.5 12H4.5L6 8z"/>
                    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                  </svg>
                } @else if (situation()!.id === 'directions') {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                } @else if (situation()!.id === 'accommodation') {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
                  </svg>
                } @else {
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                }
              </div>

              <div class="hero-title-col">
                <h2 class="hero-title-en">{{ situation()!.titleEn }}</h2>
                <div class="hero-title-kn font-kannada">{{ situation()!.titleKn }}</div>
              </div>
            </div>

            <p class="hero-desc">{{ situation()!.descriptionEn }}</p>
          </div>

          <!-- Section: Common Phrases -->
          <section class="phrases-section">
            <div class="phrases-header-row">
              <h3 class="section-title">Common Phrases ({{ phrases().length }})</h3>
              <button class="view-all-link" (click)="resetSearch()" aria-label="View all phrases">
                <span>View all</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <div class="phrases-list">
              @for (phrase of phrases(); track phrase.id) {
                <div class="phrase-card" [id]="'phrase-card-' + phrase.id">
                  <div class="phrase-main" [routerLink]="['/phrases', phrase.id]" [attr.aria-label]="phrase.english">
                    <h4 class="phrase-kannada font-kannada">{{ phrase.kannada }}</h4>
                    <p class="phrase-translit">{{ phrase.transliteration }}</p>
                    <p class="phrase-english">{{ phrase.english }}</p>
                  </div>

                  <!-- Save Bookmark Action -->
                  <button
                    class="phrase-save-btn"
                    [class.saved]="isSaved(phrase.id)"
                    (click)="toggleSave(phrase.id); $event.stopPropagation()"
                    [attr.aria-label]="isSaved(phrase.id) ? 'Remove saved phrase' : 'Save phrase'"
                    [title]="isSaved(phrase.id) ? 'Saved' : 'Save'"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isSaved(phrase.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
              }

              @if (phrases().length === 0) {
                <div class="empty-state">
                  <p class="empty-text">No phrases available for this situation yet.</p>
                </div>
              }
            </div>
          </section>
        }
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

    .situation-detail-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Dark Green Top Header */
    .situation-detail-header {
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

    .header-back-btn, .header-search-btn {
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
      flex-shrink: 0;
    }

    .header-back-btn {
      margin-left: -6px;
    }

    .header-back-btn:hover, .header-search-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.015em;
    }

    /* Scrollable Container */
    .situation-scroll-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 1rem 1rem calc(var(--nav-height) + var(--safe-bottom) + 1.25rem);
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    /* Hero Category Card */
    .hero-category-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.2rem 1.15rem 1.1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1.35rem;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.85rem;
    }

    .hero-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .hero-title-col {
      flex: 1;
      text-align: left;
    }

    .hero-title-en {
      font-size: 1.15rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
      line-height: 1.2;
    }

    .hero-title-kn {
      font-size: 0.95rem;
      font-weight: 700;
      color: #176B57;
      line-height: 1.25;
    }

    .hero-desc {
      font-size: 0.84rem;
      color: #6B7280;
      line-height: 1.48;
      margin: 0;
      text-align: left;
    }

    /* Phrases Section */
    .phrases-section {
      display: flex;
      flex-direction: column;
    }

    .phrases-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.015em;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      font-size: 0.82rem;
      font-weight: 700;
      color: #176B57;
      cursor: pointer;
      font-family: var(--font-sans);
      padding: 0.2rem 0.35rem;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    .phrases-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .phrase-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 1rem 1.1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
    }

    .phrase-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .phrase-main {
      flex: 1;
      cursor: pointer;
      text-align: left;
    }

    .phrase-kannada {
      font-size: 1.25rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 3px;
      line-height: 1.35;
    }

    .phrase-translit {
      font-size: 0.82rem;
      font-style: italic;
      color: #6B7280;
      margin: 0 0 3px;
    }

    .phrase-english {
      font-size: 0.88rem;
      font-weight: 500;
      color: #374151;
      margin: 0;
    }

    .phrase-save-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #9CA3AF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .phrase-save-btn:hover {
      background: #E8F5EF;
      color: #176B57;
    }

    .phrase-save-btn.saved {
      color: #176B57;
    }

    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
      color: #6B7280;
      font-size: 0.85rem;
    }
  `],
})
export class SituationDetailComponent implements OnInit {
  situation = signal<Situation | undefined>(undefined);
  phrases = signal<Phrase[]>([]);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public phraseService: PhraseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.situation.set(SITUATIONS.find(s => s.id === id));
    this.phrases.set(this.phraseService.getPhrasesBySituation(id));
  }

  isSaved(id: string): boolean {
    return this.phraseService.isPhraseSaved(id);
  }

  toggleSave(id: string): void {
    this.phraseService.toggleSavePhrase(id);
  }

  goBack(): void {
    this.router.navigate(['/situations']);
  }

  focusSearch(): void {
    this.router.navigate(['/situations']);
  }

  resetSearch(): void {
    const id = this.situation()?.id ?? '';
    this.phrases.set(this.phraseService.getPhrasesBySituation(id));
  }
}
