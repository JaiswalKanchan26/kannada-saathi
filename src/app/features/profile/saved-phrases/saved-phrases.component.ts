import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { PhraseService } from '../../../core/services/phrase.service';
import { AudioService } from '../../../core/services/audio.service';
import { Phrase } from '../../../core/models/models';

@Component({
  selector: 'app-saved-phrases',
  standalone: true,
  imports: [RouterLink, FormsModule, BottomNavComponent],
  template: `
    <div class="saved-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="saved-header">
        <button class="sp-back-btn" (click)="goBack()" aria-label="Go back to profile" id="saved-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Saved Phrases</h1>

        <span class="sp-count-pill">{{ savedPhrases().length }}</span>
      </header>

      <!-- Scrollable Main Content -->
      <div class="saved-scroll-content animate-fade-in">
        <!-- 100% Offline Callout Banner -->
        <div class="offline-banner">
          <div class="offline-icon-box" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <span class="offline-text">Available 100% offline anytime, no internet needed</span>
        </div>

        <!-- Search Bar -->
        @if (savedPhrases().length > 0) {
          <div class="search-wrap" role="search">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder="Search your saved phrases..."
              aria-label="Search saved phrases"
              id="saved-search"
              [(ngModel)]="searchQuery"
            />
          </div>
        }

        <!-- Saved Phrases List -->
        @if (filteredPhrases().length > 0) {
          <div class="saved-list">
            @for (p of filteredPhrases(); track p.id) {
              <div class="saved-card" [id]="'saved-card-' + p.id">
                <a [routerLink]="['/phrases', p.id]" class="saved-main" [attr.aria-label]="p.english">
                  <h2 class="phrase-kn font-kannada">{{ p.kannada }}</h2>
                  <p class="phrase-tr">{{ p.transliteration }}</p>
                  <p class="phrase-en">{{ p.english }}</p>
                </a>

                <div class="saved-actions">
                  <!-- Listen Button -->
                  <button
                    class="action-btn audio-btn"
                    [class.speaking]="playingPhraseId() === p.id"
                    (click)="playAudio(p.kannada, p.id)"
                    title="Listen pronunciation"
                    aria-label="Listen audio"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  </button>

                  <!-- Remove Bookmark Button -->
                  <button
                    class="action-btn remove-btn"
                    (click)="removePhrase(p.id)"
                    title="Remove from saved"
                    aria-label="Remove phrase"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else if (savedPhrases().length > 0 && filteredPhrases().length === 0) {
          <div class="empty-state">
            <div class="empty-icon-wrap" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 class="empty-title">No matching phrases found</h3>
            <p class="empty-desc">Try searching for a different keyword.</p>
          </div>
        } @else {
          <!-- Empty State (No Saved Phrases) - Zero Emojis -->
          <div class="empty-state">
            <div class="empty-icon-wrap" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 class="empty-title">No Saved Phrases Yet</h3>
            <p class="empty-desc">
              Save key Kannada phrases you use frequently while exploring, so they are ready for offline reference anytime.
            </p>
            <a routerLink="/situations" class="btn-primary-browse" id="btn-browse-situations">
              <span>Browse Situations & Phrases</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
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

    .saved-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Emerald Header with Curved Bottom */
    .saved-header {
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

    .sp-back-btn {
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

    .sp-back-btn:hover {
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

    .sp-count-pill {
      font-size: 0.74rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      white-space: nowrap;
      min-width: 36px;
      text-align: center;
    }

    /* Scrollable Container */
    .saved-scroll-content {
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

    /* 100% Offline Callout Banner */
    .offline-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #E8F5EF;
      border: 1px solid #B2E4D0;
      border-radius: 14px;
      padding: 0.75rem 0.95rem;
      margin-bottom: 0.95rem;
    }

    .offline-icon-box {
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .offline-text {
      font-size: 0.78rem;
      font-weight: 600;
      color: #176B57;
      text-align: left;
      line-height: 1.3;
    }

    /* Search Bar */
    .search-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0 1rem;
      height: 44px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      margin-bottom: 1rem;
      transition: border-color 0.15s ease;
    }

    .search-wrap:focus-within {
      border-color: #176B57;
      box-shadow: 0 2px 10px rgba(23, 107, 87, 0.1);
    }

    .search-icon {
      flex-shrink: 0;
    }

    .search-wrap input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      font-size: 0.88rem;
      color: #1F2937;
      font-family: var(--font-sans);
    }

    .search-wrap input::placeholder {
      color: #9CA3AF;
    }

    /* Saved Phrases List */
    .saved-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .saved-card {
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

    .saved-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .saved-main {
      flex: 1;
      text-decoration: none;
      text-align: left;
    }

    .phrase-kn {
      font-size: 1.18rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
      line-height: 1.35;
    }

    .phrase-tr {
      font-size: 0.82rem;
      font-style: italic;
      color: #6B7280;
      margin: 0 0 2px;
    }

    .phrase-en {
      font-size: 0.86rem;
      font-weight: 500;
      color: #374151;
      margin: 0;
    }

    .saved-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-shrink: 0;
    }

    .action-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: 1px solid #E5E7EB;
      background: #F9FAF9;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .audio-btn {
      color: #176B57;
      background: #E8F5EF;
      border-color: #D9F2E8;
    }

    .audio-btn:hover {
      background: #176B57;
      color: #FFFFFF;
      border-color: #176B57;
    }

    .audio-btn.speaking {
      background: #176B57 !important;
      color: #FFFFFF !important;
      border-color: #176B57 !important;
      animation: speaking-pulse 1.3s ease-in-out infinite;
    }

    [data-theme="dark"] .audio-btn {
      background: #193327;
      border-color: #244438;
      color: #34D399;
    }

    .remove-btn {
      color: #9CA3AF;
    }

    .remove-btn:hover {
      background: #FEE2E2;
      color: #DC2626;
      border-color: #FCA5A5;
    }

    /* Empty States */
    .empty-state {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 22px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1rem;
    }

    .empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.15rem;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.15);
    }

    .empty-title {
      font-size: 1.18rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.35rem;
    }

    .empty-desc {
      font-size: 0.84rem;
      color: #6B7280;
      line-height: 1.48;
      max-width: 290px;
      margin: 0 0 1.5rem;
    }

    .btn-primary-browse {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 0.85rem 1.65rem;
      font-size: 0.94rem;
      font-weight: 700;
      font-family: var(--font-sans);
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.25);
      transition: all 0.15s ease;
    }

    .btn-primary-browse:hover {
      background: #0F5444;
      transform: translateY(-1px);
    }
  `],
})
export class SavedPhrasesComponent implements OnInit {
  savedPhrases = signal<Phrase[]>([]);
  searchQuery = '';
  playingPhraseId = signal<string | null>(null);

  constructor(
    private phraseService: PhraseService,
    private audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSaved();
  }

  loadSaved(): void {
    this.savedPhrases.set(this.phraseService.getSavedPhrasesWithDetails());
  }

  filteredPhrases(): Phrase[] {
    if (!this.searchQuery.trim()) return this.savedPhrases();
    const q = this.searchQuery.toLowerCase().trim();
    return this.savedPhrases().filter(
      p =>
        p.english.toLowerCase().includes(q) ||
        p.transliteration.toLowerCase().includes(q) ||
        p.kannada.includes(q)
    );
  }

  async playAudio(text: string, phraseId?: string): Promise<void> {
    if (!text) return;
    if (this.playingPhraseId()) {
      this.audioService.stop();
      this.playingPhraseId.set(null);
      return;
    }
    if (phraseId) {
      this.playingPhraseId.set(phraseId);
    }
    try {
      await this.audioService.speak(text);
    } catch {
      // Silently catch
    } finally {
      this.playingPhraseId.set(null);
      if (typeof document !== 'undefined') {
        (document.activeElement as HTMLElement)?.blur();
      }
    }
  }

  removePhrase(id: string): void {
    this.phraseService.toggleSavePhrase(id);
    this.loadSaved();
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
