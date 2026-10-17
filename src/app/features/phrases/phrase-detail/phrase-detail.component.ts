import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { PhraseService } from '../../../core/services/phrase.service';
import { AudioService } from '../../../core/services/audio.service';
import { ActivityService } from '../../../core/services/activity.service';
import { Phrase } from '../../../core/models/models';
import { SITUATIONS } from '../../../core/data/situations.data';

@Component({
  selector: 'app-phrase-detail',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="phrase-detail-viewport" role="main">
      <!-- Solid Dark Green Top Header -->
      <header class="phrase-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back" id="btn-phrase-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Phrase Detail</h1>

        <button
          class="header-bookmark-btn"
          (click)="toggleSave()"
          [attr.aria-label]="isSaved() ? 'Unsave phrase' : 'Save phrase'"
          id="btn-header-bookmark"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </header>

      @if (phrase()) {
        <!-- Scrollable Main Content -->
        <div class="phrase-scroll-content animate-fade-in">
          <!-- Main Phrase Card -->
          <div class="phrase-hero-card">
            <h2 class="hero-kannada font-kannada" (click)="showToSomeone()" role="button" tabindex="0" title="Tap to show big">
              {{ phrase()!.kannada }}
            </h2>
            <p class="hero-translit">{{ phrase()!.transliteration }}</p>
            <p class="hero-english">{{ phrase()!.english }}</p>

            @if (phrase()!.verified) {
              <div class="verified-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Verified phrase</span>
              </div>
            }

            <!-- 3 Pill Action Buttons (Listen, Save, Share) -->
            <div class="hero-actions-row">
              <button
                class="hero-act-btn"
                [class.active]="isPlaying()"
                (click)="playAudio()"
                id="btn-phrase-listen"
                aria-label="Listen to pronunciation"
              >
                @if (isPlaying()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  <span>Playing...</span>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                  <span>Listen</span>
                }
              </button>

              <button
                class="hero-act-btn"
                [class.active]="isSaved()"
                (click)="toggleSave()"
                id="btn-phrase-save"
                aria-label="Save this phrase"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isSaved() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ isSaved() ? 'Saved' : 'Save' }}</span>
              </button>

              <button
                class="hero-act-btn"
                (click)="sharePhrase()"
                id="btn-phrase-share"
                aria-label="Share phrase"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                <span>Share</span>
              </button>
            </div>

            <!-- Show Big Bar trigger -->
            <button class="show-someone-trigger" (click)="showToSomeone()" id="btn-trigger-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Show to someone (Full screen)</span>
            </button>
          </div>

          <!-- Cultural Tip Card -->
          <div class="cultural-tip-card">
            <div class="tip-icon-box" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="9" y1="18" x2="15" y2="18"/>
                <line x1="10" y1="22" x2="14" y2="22"/>
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"/>
              </svg>
            </div>
            <div class="tip-text-col">
              <h3 class="tip-title">Cultural Tip</h3>
              <p class="tip-body">
                {{ phrase()!.note || "You can also say 'railway station ge' for a more polite form." }}
              </p>
            </div>
          </div>

          <!-- Related Phrases Section -->
          @if (relatedPhrases().length > 0) {
            <section class="related-section">
              <div class="related-header-row">
                <h3 class="section-title">Related Phrases</h3>
                <button class="view-all-link" (click)="goToSituation()" aria-label="View all related phrases">
                  <span>View all</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <div class="related-list">
                @for (related of relatedPhrases(); track related.id) {
                  <div class="related-card" [id]="'related-' + related.id">
                    <div class="related-icon-box" aria-hidden="true">
                      @if (related.tags && related.tags.includes('shopping')) {
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 8h12l1.5 12H4.5L6 8z"/>
                          <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                        </svg>
                      } @else {
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="3" y1="21" x2="21" y2="21"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                          <polyline points="12 3 2 10 22 10"/>
                          <line x1="6" y1="10" x2="6" y2="21"/>
                          <line x1="10" y1="10" x2="10" y2="21"/>
                          <line x1="14" y1="10" x2="14" y2="21"/>
                          <line x1="18" y1="10" x2="18" y2="21"/>
                        </svg>
                      }
                    </div>

                    <a [routerLink]="['/phrases', related.id]" class="related-content" [attr.aria-label]="related.english">
                      <h4 class="related-kannada font-kannada">{{ related.kannada }}</h4>
                      <p class="related-translit">{{ related.transliteration }}</p>
                      <p class="related-english">{{ related.english }}</p>
                    </a>

                    <button
                      class="related-save-btn"
                      [class.saved]="isPhraseSaved(related.id)"
                      (click)="toggleSaveOther(related.id); $event.stopPropagation()"
                      [attr.aria-label]="isPhraseSaved(related.id) ? 'Remove saved' : 'Save phrase'"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isPhraseSaved(related.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      } @else {
        <div class="empty-state">
          <p>Phrase not found</p>
          <button class="header-back-btn" (click)="goBack()">Back to Situations</button>
        </div>
      }

      <!-- Screen 4: Show to Someone Fullscreen Overlay (Image 2) -->
      @if (showOverlay() && phrase()) {
        <div class="show-overlay-backdrop animate-fade-in" role="dialog" aria-modal="true" aria-label="Show this to someone">
          <div class="show-overlay-card">
            <!-- Top Right Close X Button -->
            <button class="overlay-close-btn" (click)="showOverlay.set(false)" aria-label="Close modal" id="btn-close-overlay-top">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Top Prompt Header -->
            <div class="overlay-top-prompt">
              <span>Show this to the other person 👤</span>
            </div>

            <!-- Big Kannada Script -->
            <div class="overlay-big-kannada font-kannada">
              {{ phrase()!.kannada }}
            </div>

            <!-- Transliteration -->
            <div class="overlay-big-translit">
              {{ phrase()!.transliteration }}
            </div>

            <!-- Subtle Divider Line -->
            <div class="overlay-divider-line" aria-hidden="true"></div>

            <!-- English Meaning -->
            <div class="overlay-big-english">
              {{ phrase()!.english }}
            </div>

            <!-- Bottom Pill Action Close Button with Eye icon -->
            <button class="overlay-bottom-close-btn" (click)="showOverlay.set(false)" id="btn-close-overlay-bottom">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Close</span>
            </button>
          </div>
        </div>
      }

      <!-- Copied toast -->
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
      background: #F9FAF9;
    }

    .phrase-detail-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Dark Green Top Header */
    .phrase-header {
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

    .header-back-btn, .header-bookmark-btn {
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

    .header-back-btn:hover, .header-bookmark-btn:hover {
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
    .phrase-scroll-content {
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

    /* Main Phrase Hero Card */
    .phrase-hero-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.25rem 1.15rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1rem;
      text-align: left;
    }

    .hero-kannada {
      font-size: clamp(1.6rem, 5.2vw, 1.95rem);
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.35rem;
      line-height: 1.35;
      cursor: pointer;
    }

    .hero-translit {
      font-size: 0.95rem;
      font-style: italic;
      color: #6B7280;
      margin: 0 0 0.4rem;
      line-height: 1.3;
    }

    .hero-english {
      font-size: 1.08rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.85rem;
      line-height: 1.3;
    }

    .verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #E8F5EF;
      color: #176B57;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 1.15rem;
    }

    /* 3 Action Buttons Row */
    .hero-actions-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }

    .hero-act-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      background: #E8F5EF;
      border: 1px solid rgba(23, 107, 87, 0.12);
      border-radius: 12px;
      height: 44px;
      color: #176B57;
      font-size: 0.86rem;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .hero-act-btn:hover {
      background: #D9F2E8;
      border-color: #176B57;
      transform: translateY(-1px);
    }

    .hero-act-btn.active {
      background: #176B57;
      color: #FFFFFF;
      border-color: #176B57;
    }

    .show-someone-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: 100%;
      background: transparent;
      border: 1px dashed #B2E4D0;
      border-radius: 12px;
      padding: 0.55rem;
      color: #176B57;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      font-family: var(--font-sans);
    }

    .show-someone-trigger:hover {
      background: #F0FAF5;
    }

    /* Cultural Tip Card */
    .cultural-tip-card {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 1rem 1.1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      margin-bottom: 1.35rem;
      text-align: left;
    }

    .tip-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .tip-text-col {
      flex: 1;
    }

    .tip-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
    }

    .tip-body {
      font-size: 0.82rem;
      color: #6B7280;
      line-height: 1.48;
      margin: 0;
    }

    /* Related Phrases Section */
    .related-section {
      display: flex;
      flex-direction: column;
    }

    .related-header-row {
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

    .related-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .related-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 0.95rem 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
    }

    .related-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .related-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .related-content {
      flex: 1;
      text-decoration: none;
      text-align: left;
    }

    .related-kannada {
      font-size: 1.02rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
      line-height: 1.3;
    }

    .related-translit {
      font-size: 0.78rem;
      font-style: italic;
      color: #6B7280;
      margin: 0 0 2px;
    }

    .related-english {
      font-size: 0.82rem;
      color: #374151;
      margin: 0;
      font-weight: 500;
    }

    .related-save-btn {
      width: 36px;
      height: 36px;
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

    .related-save-btn:hover {
      background: #E8F5EF;
      color: #176B57;
    }

    .related-save-btn.saved {
      color: #176B57;
    }

    /* Screen 4: Show to Someone Fullscreen Modal Overlay (Image 2) */
    .show-overlay-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      backdrop-filter: blur(4px);
    }

    .show-overlay-card {
      position: relative;
      background: #176B57;
      color: #FFFFFF;
      border-radius: 28px;
      padding: 2.25rem 1.65rem 1.85rem;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .overlay-close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .overlay-close-btn:hover {
      background: rgba(255, 255, 255, 0.35);
    }

    .overlay-top-prompt {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.88);
      font-weight: 500;
      margin-bottom: 1.75rem;
    }

    .overlay-big-kannada {
      font-size: clamp(2rem, 6.2vw, 2.75rem);
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.35;
      margin-bottom: 0.85rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .overlay-big-translit {
      font-size: 1.12rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.88);
      margin-bottom: 1.5rem;
    }

    .overlay-divider-line {
      width: 60px;
      height: 2px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 99px;
      margin-bottom: 1.5rem;
    }

    .overlay-big-english {
      font-size: 1.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 2.25rem;
      line-height: 1.3;
    }

    .overlay-bottom-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      max-width: 260px;
      height: 48px;
      background: #FFFFFF;
      color: #176B57;
      border: none;
      border-radius: 9999px;
      font-size: 0.96rem;
      font-weight: 800;
      font-family: var(--font-sans);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
      transition: transform 0.15s ease, background 0.15s ease;
    }

    .overlay-bottom-close-btn:hover {
      background: #F3F9F6;
      transform: scale(1.02);
    }

    /* Copied Toast */
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

    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
      color: #6B7280;
    }
  `],
})
export class PhraseDetailComponent implements OnInit {
  phrase = signal<Phrase | undefined>(undefined);
  isSaved = signal(false);
  isPlaying = signal(false);
  showOverlay = signal(false);
  showCopiedToast = signal(false);
  relatedPhrases = signal<Phrase[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public phraseService: PhraseService,
    public audioService: AudioService,
    private activity: ActivityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const p = this.phraseService.getPhraseById(id);
    this.phrase.set(p);
    this.isSaved.set(this.phraseService.isPhraseSaved(id));

    if (p) {
      this.relatedPhrases.set(this.phraseService.getRelatedPhrases(id));
      this.activity.track({ type: 'phrase_viewed', referenceId: id, label: p.english });
    }
  }

  goBack(): void {
    const phrase = this.phrase();
    if (phrase) {
      this.router.navigate(['/situations', phrase.situationId]);
    } else {
      this.router.navigate(['/situations']);
    }
  }

  goToSituation(): void {
    const phrase = this.phrase();
    if (phrase) {
      this.router.navigate(['/situations', phrase.situationId]);
    } else {
      this.router.navigate(['/situations']);
    }
  }

  toggleSave(): void {
    const phrase = this.phrase();
    if (!phrase) return;
    const nowSaved = this.phraseService.toggleSavePhrase(phrase.id);
    this.isSaved.set(nowSaved);
    if (nowSaved) {
      this.activity.track({ type: 'phrase_saved', referenceId: phrase.id, label: phrase.english });
    }
  }

  toggleSaveOther(id: string): void {
    this.phraseService.toggleSavePhrase(id);
  }

  isPhraseSaved(id: string): boolean {
    return this.phraseService.isPhraseSaved(id);
  }

  async playAudio(): Promise<void> {
    const phrase = this.phrase();
    if (!phrase) return;
    if (this.isPlaying()) {
      this.audioService.stop();
      this.isPlaying.set(false);
      return;
    }
    this.isPlaying.set(true);
    try {
      if (phrase.audioUrl) {
        await this.audioService.playAudioUrl(phrase.audioUrl);
      } else {
        await this.audioService.speak(phrase.kannada);
      }
    } catch {
      // Silently finish
    } finally {
      this.isPlaying.set(false);
    }
  }

  async sharePhrase(): Promise<void> {
    const phrase = this.phrase();
    if (!phrase) return;
    const text = `${phrase.kannada} (${phrase.transliteration}) — "${phrase.english}" | Kannada Saathi`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Kannada Phrase', text });
        return;
      } catch {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showCopiedToast.set(true);
      setTimeout(() => this.showCopiedToast.set(false), 2000);
    }
  }

  showToSomeone(): void {
    this.showOverlay.set(true);
  }
}
