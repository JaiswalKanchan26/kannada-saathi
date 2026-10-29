import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CalendarService } from '../../../core/services/calendar.service';
import { AudioService } from '../../../core/services/audio.service';
import { PhraseService } from '../../../core/services/phrase.service';
import { ActivityService } from '../../../core/services/activity.service';
import { StorageService } from '../../../core/services/storage.service';
import { Festival, FestivalGreeting, Phrase } from '../../../core/models/models';

const SAVED_FESTIVALS_KEY = 'ks_saved_festivals';
const SAVED_GREETINGS_KEY = 'ks_saved_greetings';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="event-viewport" role="main">
      <!-- Top Solid Green Header Bar -->
      <header class="event-header">
        <button class="header-icon-btn" (click)="goBack()" aria-label="Go back to calendar" id="event-back-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Festival Details</h1>

        <div class="header-actions">
          <!-- Bookmark Festival Button -->
          <button
            class="header-icon-btn"
            (click)="toggleFestivalBookmark()"
            [attr.aria-label]="isFestivalSaved() ? 'Remove bookmark' : 'Bookmark festival'"
            [title]="isFestivalSaved() ? 'Bookmarked' : 'Bookmark festival'"
            id="btn-bookmark-festival"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              [attr.fill]="isFestivalSaved() ? '#FFFFFF' : 'none'"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          <!-- Share Button -->
          <button
            class="header-icon-btn"
            (click)="shareFestival()"
            aria-label="Share festival"
            title="Share festival"
            id="btn-share-festival"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </header>

      @if (festival()) {
        <!-- Scrollable Main Content -->
        <div class="event-scroll-content animate-fade-in">
          <!-- Hero Banner Card with Vidhana Soudha Architectural Watermark -->
          <div class="event-hero-card">
            <!-- Architectural Line-Art Watermark Silhouette -->
            <div class="hero-watermark" aria-hidden="true">
              <svg width="190" height="150" viewBox="0 0 200 160" fill="none" stroke="#FFFFFF" stroke-width="1.3" opacity="0.16">
                <!-- Central Dome Kalasa -->
                <line x1="100" y1="8" x2="100" y2="24"/>
                <circle cx="100" cy="8" r="3" fill="#FFFFFF"/>
                <!-- Main Central Dome -->
                <path d="M72 58 C72 26 128 26 128 58 Z"/>
                <path d="M82 58 C82 38 118 38 118 58"/>
                <rect x="68" y="58" width="64" height="6" rx="2"/>
                <!-- Central Portico Pillars & Pediment -->
                <path d="M60 76 L100 64 L140 76 Z"/>
                <line x1="72" y1="76" x2="72" y2="120"/>
                <line x1="86" y1="76" x2="86" y2="120"/>
                <line x1="100" y1="76" x2="100" y2="120"/>
                <line x1="114" y1="76" x2="114" y2="120"/>
                <line x1="128" y1="76" x2="128" y2="120"/>
                <!-- Arched Doors -->
                <path d="M92 120 V102 C92 98 108 98 108 102 V120"/>
                <!-- Side Wings & Corner Cupolas -->
                <path d="M25 70 C25 50 55 50 55 70 Z"/>
                <line x1="40" y1="44" x2="40" y2="50"/>
                <path d="M145 70 C145 50 175 50 175 70 Z"/>
                <line x1="160" y1="44" x2="160" y2="50"/>
                <!-- Wing Balustrades & Windows -->
                <rect x="18" y="70" width="42" height="50" rx="1"/>
                <rect x="140" y="70" width="42" height="50" rx="1"/>
                <path d="M26 84 V96 M34 84 V96 M42 84 V96 M50 84 V96"/>
                <path d="M148 84 V96 M156 84 V96 M164 84 V96 M172 84 V96"/>
                <!-- Foundation Steps -->
                <rect x="10" y="120" width="180" height="6" rx="1"/>
                <rect x="5" y="126" width="190" height="7" rx="1"/>
                <rect x="0" y="133" width="200" height="8" rx="1"/>
              </svg>
            </div>

            <!-- Category Badge Pill -->
            <div class="category-pill-tag">
              {{ getCategoryLabel(festival()!) }}
            </div>

            <!-- Festival Titles -->
            <h2 class="hero-title-en">{{ festival()!.nameEn }}</h2>
            <div class="hero-title-kn font-kannada">{{ festival()!.nameKn }}</div>

            <!-- Meta Rows (Date & Location) -->
            <div class="hero-meta-row">
              <!-- Date button (clickable to open Add to Calendar modal) -->
              <button class="meta-pill-btn" (click)="openCalendarModal()" title="Add to Calendar" id="btn-open-calendar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{{ formatDate(festival()!.dateStr) }}</span>
                @if (festival()!.endDateStr) {
                  <span> – {{ formatDate(festival()!.endDateStr!) }}</span>
                }
              </button>

              <!-- Location Tag -->
              <div class="meta-location-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ festival()!.location }}</span>
              </div>
            </div>
          </div>

          <!-- About this celebration Card -->
          <div class="detail-card">
            <div class="card-title-row">
              <div class="card-icon-box" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 class="card-heading">About this celebration</h3>
            </div>

            <p class="card-desc-body">
              {{ festival()!.significance }}
            </p>

            <a
              [href]="festival()!.officialLink || 'https://karnataka.gov.in'"
              target="_blank"
              rel="noopener noreferrer"
              class="official-link-row"
              id="link-official-info"
            >
              <span>Official information</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8"/>
              </svg>
            </a>
          </div>

          <!-- Useful Kannada phrases Section -->
          @if (festival()!.greetings && festival()!.greetings!.length > 0) {
            <section class="section-container">
              <div class="section-title-wrap">
                <h3 class="section-main-title">Useful Kannada phrases</h3>
                <p class="section-sub-title">Learn what to say during the celebration.</p>
              </div>

              <div class="greetings-list">
                @for (g of festival()!.greetings; track g.kannada; let i = $index) {
                  <div class="greeting-card" [id]="'greeting-card-' + i">
                    <div class="greeting-card-top">
                      <span class="greeting-tag">GREETING 0{{ i + 1 }}</span>
                      
                      <!-- Bookmark Greeting Button -->
                      <button
                        class="greeting-bm-btn"
                        (click)="toggleGreetingBookmark(g)"
                        [attr.aria-label]="isGreetingSaved(g) ? 'Remove bookmark' : 'Bookmark greeting'"
                        [class.active]="isGreetingSaved(g)"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          [attr.fill]="isGreetingSaved(g) ? '#176B57' : 'none'"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Phrase Content -->
                    <div class="greeting-kn font-kannada">{{ g.kannada }}</div>
                    <div class="greeting-tr">{{ g.transliteration }}</div>
                    <div class="greeting-en">{{ g.english }}</div>

                    @if (g.culturalNote) {
                      <div class="cultural-note-text">
                        {{ g.culturalNote }}
                      </div>
                    }

                    <!-- Action Buttons Row -->
                    <div class="greeting-actions-row">
                      <!-- Listen Button -->
                      <button
                        class="action-pill-btn listen-btn"
                        [class.speaking]="playingGreeting() === g.kannada"
                        (click)="playGreeting(g.kannada)"
                        aria-label="Listen pronunciation"
                        [id]="'btn-listen-' + i"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        </svg>
                        <span>{{ playingGreeting() === g.kannada ? 'Playing...' : 'Listen' }}</span>
                      </button>

                      <!-- Show Phrase Modal Button -->
                      <button
                        class="action-pill-btn outline-btn"
                        (click)="openShowModal(i)"
                        aria-label="Show phrase fullscreen"
                        [id]="'btn-show-phrase-' + i"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <polyline points="15 3 21 3 21 9"/>
                          <polyline points="9 21 3 21 3 15"/>
                          <line x1="21" y1="3" x2="14" y2="10"/>
                          <line x1="3" y1="21" x2="10" y2="14"/>
                        </svg>
                        <span>Show phrase</span>
                      </button>

                      <!-- Save Greeting Button -->
                      <button
                        class="action-pill-btn outline-btn"
                        [class.saved]="isGreetingSaved(g)"
                        (click)="toggleGreetingBookmark(g)"
                        aria-label="Save phrase"
                        [id]="'btn-save-phrase-' + i"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          [attr.fill]="isGreetingSaved(g) ? 'currentColor' : 'none'"
                          stroke="currentColor"
                          stroke-width="2.2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>{{ isGreetingSaved(g) ? 'Saved' : 'Save' }}</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          <!-- Cultural Insight Card -->
          @if (festival()!.culturalInsight) {
            <div class="insight-card">
              <div class="card-title-row">
                <div class="insight-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <h3 class="card-heading">Cultural insight</h3>
              </div>

              <p class="insight-body">
                {{ festival()!.culturalInsight }}
              </p>
            </div>
          }

          <!-- For Visitors Card -->
          @if (festival()!.visitorTips) {
            <div class="detail-card">
              <div class="card-title-row">
                <div class="card-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 class="card-heading">For visitors</h3>
              </div>

              <div class="visitor-tips-list">
                @if (festival()!.visitorTips?.bestTime) {
                  <div class="tip-row">
                    <span class="tip-bullet">•</span>
                    <span class="tip-content"><strong>Best time to visit:</strong> {{ festival()!.visitorTips?.bestTime }}</span>
                  </div>
                }
                @if (festival()!.visitorTips?.celebrations) {
                  <div class="tip-row">
                    <span class="tip-bullet">•</span>
                    <span class="tip-content"><strong>Celebrations:</strong> {{ festival()!.visitorTips?.celebrations }}</span>
                  </div>
                }
                @if (festival()!.visitorTips?.source) {
                  <div class="tip-row">
                    <span class="tip-bullet">•</span>
                    <span class="tip-content">
                      <strong>Official source:</strong>
                      <a [href]="festival()!.visitorTips?.sourceUrl || 'https://karnataka.gov.in'" target="_blank" class="source-link">
                        {{ festival()!.visitorTips?.source }}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="vertical-align:middle; margin-left:2px;">
                          <path d="M7 17l9.2-9.2M17 17V7.8H7.8"/>
                        </svg>
                      </a>
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Related Lessons Link Card -->
          <a routerLink="/learn" class="related-lesson-card" id="card-related-lessons">
            <div class="lesson-icon-box" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div class="lesson-text-col">
              <h4 class="lesson-title">Related lessons</h4>
              <p class="lesson-desc">Learn useful phrases and cultural context related to Karnataka's heritage.</p>
            </div>
            <svg class="chevron-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>

          <!-- Related Festivals Section -->
          @if (relatedFestivals().length > 0) {
            <section class="section-container" style="margin-top: 1.25rem;">
              <div class="section-title-wrap">
                <h3 class="section-main-title">Related Festivals</h3>
                <p class="section-sub-title">Explore similar events and celebrations.</p>
              </div>

              <div class="related-festivals-list">
                @for (rel of relatedFestivals(); track rel.id) {
                  <a [routerLink]="['/calendar', rel.id]" class="related-fest-card" [id]="'fest-rel-' + rel.id">
                    <div class="fest-cal-icon-box" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>

                    <div class="fest-info-col">
                      <h4 class="fest-name">{{ rel.nameEn }}</h4>
                      <div class="fest-meta-txt">
                        {{ formatDate(rel.dateStr) }}@if (rel.endDateStr) { – {{ formatDate(rel.endDateStr) }}} • {{ rel.location }}
                      </div>
                      <span class="fest-cat-tag">{{ getCategoryLabel(rel) }}</span>
                    </div>

                    <svg class="chevron-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </a>
                }
              </div>

              <!-- Disclaimer Notice -->
              <div class="disclaimer-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Dates may vary based on official announcements and are subject to change.</span>
              </div>
            </section>
          }
        </div>
      } @else {
        <div class="empty-state animate-fade-in">
          <div class="empty-icon-box" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2 class="empty-title">Festival Not Found</h2>
          <p class="empty-desc">The requested celebration could not be located in our festival directory.</p>
          <button class="btn-return" (click)="goBack()">Return to Calendar</button>
        </div>
      }

      <app-bottom-nav />

      <!-- ======================================================== -->
      <!-- MODAL 1: "Show this to the other person" Fullscreen Card -->
      <!-- ======================================================== -->
      @if (isShowModalOpen() && currentShowGreeting()) {
        <div class="show-modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-label="Show phrase to someone">
          <!-- Top Close Bar -->
          <div class="show-modal-top-bar">
            <div class="show-header-hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Show this to the other person</span>
            </div>

            <button class="modal-close-btn" (click)="closeShowModal()" aria-label="Close fullscreen phrase" id="btn-close-show-modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Centered Flashcard Presentation -->
          <div class="show-modal-center-content">
            <h2 class="show-kn-text font-kannada">
              {{ currentShowGreeting()!.kannada }}
            </h2>

            <div class="show-tr-text">
              {{ currentShowGreeting()!.transliteration }}
            </div>

            <div class="show-en-text">
              {{ currentShowGreeting()!.english }}
            </div>

            <!-- Carousel Pagination Controls -->
            @if (festival()!.greetings && festival()!.greetings!.length > 1) {
              <div class="show-carousel-nav">
                <button
                  class="carousel-nav-btn"
                  (click)="prevShowGreeting()"
                  [disabled]="activeShowIndex() === 0"
                  aria-label="Previous greeting"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <span class="carousel-counter">
                  {{ activeShowIndex() + 1 }} / {{ festival()!.greetings!.length }}
                </span>

                <button
                  class="carousel-nav-btn"
                  (click)="nextShowGreeting()"
                  [disabled]="activeShowIndex() === festival()!.greetings!.length - 1"
                  aria-label="Next greeting"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Bottom Architectural Silhouette Watermark -->
          <div class="show-modal-watermark" aria-hidden="true">
            <svg width="280" height="110" viewBox="0 0 280 110" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.14">
              <path d="M110 40 C110 18 170 18 170 40 Z"/>
              <line x1="140" y1="4" x2="140" y2="18"/>
              <circle cx="140" cy="4" r="3" fill="#FFFFFF"/>
              <rect x="105" y="40" width="70" height="6" rx="2"/>
              <path d="M96 56 L140 44 L184 56 Z"/>
              <line x1="110" y1="56" x2="110" y2="88"/>
              <line x1="125" y1="56" x2="125" y2="88"/>
              <line x1="140" y1="56" x2="140" y2="88"/>
              <line x1="155" y1="56" x2="155" y2="88"/>
              <line x1="170" y1="56" x2="170" y2="88"/>
              <path d="M40 50 C40 32 75 32 75 50 Z"/>
              <path d="M205 50 C205 32 240 32 240 50 Z"/>
              <rect x="30" y="50" width="55" height="40" rx="1"/>
              <rect x="195" y="50" width="55" height="40" rx="1"/>
              <rect x="10" y="90" width="260" height="6" rx="1"/>
              <rect x="0" y="98" width="280" height="8" rx="1"/>
            </svg>
          </div>

          <!-- Bottom Floating Action Pill Bar -->
          <div class="show-modal-floating-bar">
            <!-- Listen -->
            <button
              class="modal-float-action"
              [class.speaking]="playingGreeting() === currentShowGreeting()!.kannada"
              (click)="playGreeting(currentShowGreeting()!.kannada)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <span>{{ playingGreeting() === currentShowGreeting()!.kannada ? 'Playing...' : 'Listen' }}</span>
            </button>

            <!-- Show Full (close or maximize) -->
            <button class="modal-float-action" (click)="closeShowModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 14 10 14 10 20"/>
                <polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <span>Close full</span>
            </button>

            <!-- Save -->
            <button
              class="modal-float-action"
              [class.saved]="isGreetingSaved(currentShowGreeting()!)"
              (click)="toggleGreetingBookmark(currentShowGreeting()!)"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                [attr.fill]="isGreetingSaved(currentShowGreeting()!) ? '#176B57' : 'none'"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ isGreetingSaved(currentShowGreeting()!) ? 'Saved' : 'Save' }}</span>
            </button>
          </div>
        </div>
      }

      <!-- ======================================================== -->
      <!-- MODAL 2: "Add to Calendar" Bottom Sheet Modal -->
      <!-- ======================================================== -->
      @if (isCalendarModalOpen()) {
        <div class="calendar-modal-backdrop animate-fade-in" (click)="closeCalendarModal()" role="presentation">
          <div class="calendar-bottom-sheet" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Add festival to calendar">
            <!-- Sheet Header -->
            <div class="sheet-header">
              <div class="sheet-title-col">
                <div class="sheet-cal-icon-box" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 class="sheet-title">Add to Calendar</h3>
              </div>

              <button class="sheet-close-btn" (click)="closeCalendarModal()" aria-label="Close add to calendar sheet">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Event Details Block -->
            <div class="sheet-event-meta">
              <h4 class="sheet-event-name">{{ festival()!.nameEn }}</h4>
              <p class="sheet-event-date">
                {{ formatDate(festival()!.dateStr) }} • {{ festival()!.location }}
              </p>
            </div>

            <!-- Confirmation Badge Card -->
            <div class="sheet-status-card">
              <div class="status-icon-box" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="status-text-col">
                <span class="status-title">Date confirmed</span>
                <span class="status-desc">Officially announced by Government of Karnataka.</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="sheet-actions">
              <button class="btn-sheet-primary" (click)="downloadIcsCalendar()" id="btn-confirm-add-cal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Add to calendar</span>
              </button>

              <button class="btn-sheet-cancel" (click)="closeCalendarModal()" id="btn-cancel-cal">
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Floating Feedback Toast -->
      @if (toastMessage()) {
        <div class="toast-popup animate-fade-in" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{{ toastMessage() }}</span>
        </div>
      }
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

    .event-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Top Solid Emerald Header */
    .event-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      background: #176B57;
      color: #FFFFFF;
      z-index: 10;
    }

    .header-icon-btn {
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
    }

    .header-icon-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .header-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Scrollable Container */
    .event-scroll-content {
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

    /* Hero Banner Card */
    .event-hero-card {
      background: #176B57;
      color: #FFFFFF;
      border-radius: 22px;
      padding: 1.35rem 1.25rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(23, 107, 87, 0.22);
      margin-bottom: 1rem;
    }

    .hero-watermark {
      position: absolute;
      right: -10px;
      bottom: -15px;
      pointer-events: none;
      user-select: none;
    }

    .category-pill-tag {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.18);
      color: #E8F5EF;
      padding: 0.28rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
      backdrop-filter: blur(4px);
    }

    .hero-title-en {
      font-size: 1.55rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 0.35rem;
      line-height: 1.2;
      letter-spacing: -0.02em;
      position: relative;
      z-index: 2;
    }

    .hero-title-kn {
      font-size: 1.25rem;
      font-weight: 700;
      color: #B2E4D0;
      margin-bottom: 1rem;
      position: relative;
      z-index: 2;
    }

    .hero-meta-row {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      position: relative;
      z-index: 2;
    }

    .meta-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: transparent;
      border: none;
      color: #FFFFFF;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-align: left;
      font-family: inherit;
      transition: opacity 0.15s ease;
    }

    .meta-pill-btn:hover {
      opacity: 0.85;
      text-decoration: underline;
    }

    .meta-location-item {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      color: rgba(255, 255, 255, 0.88);
      font-size: 0.84rem;
      font-weight: 500;
    }

    /* Detail White Cards */
    .detail-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.75rem;
    }

    .card-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-heading {
      font-size: 0.96rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .card-desc-body {
      font-size: 0.86rem;
      line-height: 1.6;
      color: #4B5563;
      margin: 0 0 0.85rem;
    }

    .official-link-row {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
      font-weight: 700;
      color: #176B57;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .official-link-row:hover {
      text-decoration: underline;
    }

    /* Useful Phrases Section */
    .section-container {
      margin-bottom: 1rem;
    }

    .section-title-wrap {
      margin-bottom: 0.85rem;
      text-align: left;
    }

    .section-main-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .section-sub-title {
      font-size: 0.8rem;
      color: #6B7280;
      margin: 2px 0 0;
    }

    .greetings-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .greeting-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      text-align: left;
    }

    .greeting-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.45rem;
    }

    .greeting-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #9CA3AF;
      text-transform: uppercase;
    }

    .greeting-bm-btn {
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .greeting-bm-btn:hover,
    .greeting-bm-btn.active {
      color: #176B57;
    }

    .greeting-kn {
      font-size: 1.25rem;
      font-weight: 700;
      color: #176B57;
      margin-bottom: 0.25rem;
      line-height: 1.35;
    }

    .greeting-tr {
      font-size: 0.86rem;
      font-style: italic;
      color: #4B5563;
      margin-bottom: 0.25rem;
    }

    .greeting-en {
      font-size: 0.88rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.65rem;
    }

    .cultural-note-text {
      font-size: 0.75rem;
      color: #059669;
      background: #F0FDF4;
      border-left: 2px solid #10B981;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      margin-bottom: 0.85rem;
    }

    .greeting-actions-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-pill-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.42rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .action-pill-btn.listen-btn {
      background: #176B57;
      color: #FFFFFF;
      border: 1px solid #176B57;
    }

    .action-pill-btn.listen-btn:hover {
      background: #135545;
    }

    .action-pill-btn.listen-btn.speaking {
      background: #0f4f40 !important;
      animation: speaking-pulse 1.3s ease-in-out infinite;
    }

    [data-theme="dark"] .action-pill-btn.outline-btn {
      background: #16241E;
      color: #F3F6F4;
      border-color: #24382E;
    }

    .action-pill-btn.outline-btn {
      background: #FFFFFF;
      color: #111827;
      border: 1px solid #D1D5DB;
    }

    .action-pill-btn.outline-btn:hover {
      background: #F9FAF9;
      border-color: #9CA3AF;
    }

    .action-pill-btn.outline-btn.saved {
      background: #E8F5EF;
      color: #176B57;
      border-color: #B2E4D0;
    }

    /* Cultural Insight Card */
    .insight-card {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 20px;
      padding: 1.15rem;
      margin-bottom: 1rem;
      text-align: left;
    }

    .insight-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #DCFCE7;
      color: #15803D;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .insight-body {
      font-size: 0.85rem;
      line-height: 1.55;
      color: #166534;
      margin: 0;
    }

    /* Visitor Tips */
    .visitor-tips-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      text-align: left;
    }

    .tip-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.84rem;
      line-height: 1.45;
      color: #374151;
    }

    .tip-bullet {
      color: #176B57;
      font-weight: 700;
    }

    .source-link {
      color: #176B57;
      text-decoration: none;
      font-weight: 700;
    }

    .source-link:hover {
      text-decoration: underline;
    }

    /* Related Lessons Card */
    .related-lesson-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1rem 1.15rem;
      text-decoration: none;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      text-align: left;
    }

    .related-lesson-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    }

    .lesson-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .lesson-text-col {
      flex: 1;
    }

    .lesson-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
    }

    .lesson-desc {
      font-size: 0.78rem;
      color: #6B7280;
      margin: 0;
      line-height: 1.35;
    }

    /* Related Festivals List */
    .related-festivals-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }

    .related-fest-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 0.85rem 1rem;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
      text-align: left;
    }

    .related-fest-card:hover {
      background: #F9FAF9;
      border-color: #B2E4D0;
    }

    .fest-cal-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fest-info-col {
      flex: 1;
    }

    .fest-name {
      font-size: 0.92rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
    }

    .fest-meta-txt {
      font-size: 0.76rem;
      color: #6B7280;
      margin-bottom: 4px;
    }

    .fest-cat-tag {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 700;
      background: #E8F5EF;
      color: #176B57;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }

    .chevron-icon {
      flex-shrink: 0;
    }

    .disclaimer-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.74rem;
      color: #9CA3AF;
      line-height: 1.4;
      text-align: left;
      padding: 0.25rem 0.5rem;
    }

    /* Empty State */
    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.5rem;
    }

    .empty-desc {
      font-size: 0.86rem;
      color: #6B7280;
      margin: 0 0 1.5rem;
      max-width: 280px;
    }

    .btn-return {
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 0.65rem 1.35rem;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
    }

    /* ========================================================= */
    /* FULLSCREEN "SHOW TO THE OTHER PERSON" MODAL OVERLAY STYLES */
    /* ========================================================= */
    .show-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: #176B57;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem 1.25rem 2rem;
      box-sizing: border-box;
      overflow: hidden;
    }

    .show-modal-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 5;
    }

    .show-header-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
    }

    .modal-close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.16);
      border: none;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.15s ease;
    }

    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.28);
    }

    .show-modal-center-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: auto 0;
      padding: 1rem 0.5rem;
      position: relative;
      z-index: 5;
    }

    .show-kn-text {
      font-size: 2.2rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.35;
      margin: 0 0 0.85rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .show-tr-text {
      font-size: 1.15rem;
      font-style: italic;
      color: #B2E4D0;
      margin-bottom: 1.25rem;
    }

    .show-en-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 1.5rem;
    }

    .show-carousel-nav {
      display: inline-flex;
      align-items: center;
      gap: 1.25rem;
      background: rgba(0, 0, 0, 0.16);
      padding: 0.4rem 0.95rem;
      border-radius: 9999px;
      backdrop-filter: blur(4px);
    }

    .carousel-nav-btn {
      background: transparent;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      opacity: 0.9;
      transition: opacity 0.15s ease;
    }

    .carousel-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carousel-counter {
      font-size: 0.85rem;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.05em;
    }

    .show-modal-watermark {
      position: absolute;
      bottom: 75px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      user-select: none;
      z-index: 2;
    }

    .show-modal-floating-bar {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: #FFFFFF;
      border-radius: 9999px;
      padding: 0.55rem 1rem;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
      position: relative;
      z-index: 10;
      max-width: 340px;
      margin: 0 auto;
      width: 100%;
    }

    .modal-float-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      background: transparent;
      border: none;
      color: #1F2937;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0.35rem 0.85rem;
      border-radius: 12px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .modal-float-action:hover {
      background: #F3F4F6;
    }

    .modal-float-action.saved {
      color: #176B57;
    }

    /* ========================================================= */
    /* "ADD TO CALENDAR" BOTTOM SHEET MODAL STYLES */
    /* ========================================================= */
    .calendar-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      backdrop-filter: blur(2px);
    }

    .calendar-bottom-sheet {
      background: #FFFFFF;
      width: 100%;
      max-width: 480px;
      border-radius: 26px 26px 0 0;
      padding: 1.35rem 1.25rem calc(var(--safe-bottom) + 1.25rem);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      text-align: left;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.15rem;
    }

    .sheet-title-col {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .sheet-cal-icon-box {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sheet-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }

    .sheet-close-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      color: #4B5563;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .sheet-event-meta {
      margin-bottom: 1rem;
    }

    .sheet-event-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
    }

    .sheet-event-date {
      font-size: 0.84rem;
      color: #6B7280;
      margin: 0;
    }

    .sheet-status-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #E8F5EF;
      border: 1px solid #B2E4D0;
      border-radius: 14px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.35rem;
    }

    .status-icon-box {
      color: #176B57;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .status-text-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .status-title {
      font-size: 0.84rem;
      font-weight: 800;
      color: #176B57;
    }

    .status-desc {
      font-size: 0.78rem;
      color: #065F46;
      line-height: 1.35;
    }

    .sheet-actions {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .btn-sheet-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      padding: 0.85rem;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
      font-family: inherit;
    }

    .btn-sheet-primary:hover {
      background: #135545;
    }

    .btn-sheet-cancel {
      width: 100%;
      background: transparent;
      color: #4B5563;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      padding: 0.75rem;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .btn-sheet-cancel:hover {
      background: #F9FAF9;
    }

    /* Floating Toast */
    .toast-popup {
      position: fixed;
      bottom: calc(var(--nav-height) + 1.25rem);
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: #FFFFFF;
      padding: 0.6rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      z-index: 1100;
    }
  `],
})
export class EventDetailComponent implements OnInit {
  festival = signal<Festival | null>(null);
  relatedFestivals = signal<Festival[]>([]);

  // Bookmark states
  isFestivalSaved = signal<boolean>(false);
  savedGreetingTexts = signal<Set<string>>(new Set());

  // Show fullscreen phrase modal state
  isShowModalOpen = signal<boolean>(false);
  activeShowIndex = signal<number>(0);

  // Add to Calendar sheet modal state
  isCalendarModalOpen = signal<boolean>(false);

  // Toast feedback
  toastMessage = signal<string>('');
  playingGreeting = signal<string | null>(null);
  private toastTimer: any = null;

  currentShowGreeting = computed<FestivalGreeting | null>(() => {
    const fest = this.festival();
    if (!fest?.greetings?.length) return null;
    const idx = this.activeShowIndex();
    return fest.greetings[idx] || fest.greetings[0];
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: CalendarService,
    private audioService: AudioService,
    private phraseService: PhraseService,
    private activityService: ActivityService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    // Load persisted saved festival state
    const savedFestivals = this.storage.get<string[]>(SAVED_FESTIVALS_KEY, []);
    const savedGreetings = this.storage.get<string[]>(SAVED_GREETINGS_KEY, []);
    this.savedGreetingTexts.set(new Set(savedGreetings));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadFestival(id, savedFestivals);
      }
    });
  }

  private loadFestival(id: string, savedFestivals: string[]): void {
    const fest = this.calendarService.getEventById(id);
    if (fest) {
      this.festival.set(fest);
      this.isFestivalSaved.set(savedFestivals.includes(fest.id));
      this.activityService.log('event_viewed', fest.id, fest.nameEn);

      // Load related festivals
      const rel = this.calendarService.getRelatedEvents(fest.id, 3);
      this.relatedFestivals.set(rel);
    } else {
      this.festival.set(null);
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getCategoryLabel(f: Festival): string {
    if (f.category === 'holiday') return 'Public Holiday';
    if (f.category === 'cultural') return 'Cultural Festival';
    return 'Festival';
  }

  async playGreeting(text: string): Promise<void> {
    if (!text) return;
    if (this.playingGreeting()) {
      this.audioService.stop();
      this.playingGreeting.set(null);
      return;
    }
    this.playingGreeting.set(text);
    try {
      await this.audioService.speak(text);
    } catch {
      // Silently catch
    } finally {
      this.playingGreeting.set(null);
      if (typeof document !== 'undefined') {
        (document.activeElement as HTMLElement)?.blur();
      }
    }
  }

  // Festival bookmark toggle
  toggleFestivalBookmark(): void {
    const fest = this.festival();
    if (!fest) return;

    const savedFestivals = this.storage.get<string[]>(SAVED_FESTIVALS_KEY, []);
    let updated: string[];
    let isNowSaved: boolean;

    if (savedFestivals.includes(fest.id)) {
      updated = savedFestivals.filter(id => id !== fest.id);
      isNowSaved = false;
      this.showToast('Removed from saved festivals');
    } else {
      updated = [...savedFestivals, fest.id];
      isNowSaved = true;
      this.showToast('Festival saved to bookmarks');
    }

    this.storage.set(SAVED_FESTIVALS_KEY, updated);
    this.isFestivalSaved.set(isNowSaved);
  }

  // Greeting bookmark toggle
  isGreetingSaved(g: FestivalGreeting): boolean {
    return this.savedGreetingTexts().has(g.kannada);
  }

  toggleGreetingBookmark(g: FestivalGreeting): void {
    const set = new Set(this.savedGreetingTexts());
    if (set.has(g.kannada)) {
      set.delete(g.kannada);
      this.showToast('Greeting removed from saved');
    } else {
      set.add(g.kannada);
      this.showToast('Greeting saved to offline phrasebook');
    }
    this.savedGreetingTexts.set(set);
    this.storage.set(SAVED_GREETINGS_KEY, Array.from(set));
  }

  // Fullscreen "Show this to the other person" modal handlers
  openShowModal(index = 0): void {
    this.activeShowIndex.set(index);
    this.isShowModalOpen.set(true);
  }

  closeShowModal(): void {
    this.isShowModalOpen.set(false);
  }

  prevShowGreeting(): void {
    if (this.activeShowIndex() > 0) {
      this.activeShowIndex.update(idx => idx - 1);
    }
  }

  nextShowGreeting(): void {
    const fest = this.festival();
    if (fest?.greetings && this.activeShowIndex() < fest.greetings.length - 1) {
      this.activeShowIndex.update(idx => idx + 1);
    }
  }

  // "Add to Calendar" sheet modal handlers
  openCalendarModal(): void {
    this.isCalendarModalOpen.set(true);
  }

  closeCalendarModal(): void {
    this.isCalendarModalOpen.set(false);
  }

  downloadIcsCalendar(): void {
    const fest = this.festival();
    if (!fest) return;

    const startDate = fest.dateStr.replace(/-/g, '');
    // End date is next day for single-day event or endDateStr
    const endRaw = fest.endDateStr ? new Date(fest.endDateStr) : new Date(fest.dateStr);
    endRaw.setDate(endRaw.getDate() + 1);
    const endDate = endRaw.toISOString().slice(0, 10).replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kannada Saathi//Festival Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${fest.id}@kannadasaathi.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${fest.nameEn} (${fest.nameKn})`,
      `DESCRIPTION:${fest.significance}`,
      `LOCATION:${fest.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fest.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.closeCalendarModal();
    this.showToast('Festival added to calendar (.ics downloaded)');
  }

  // Share festival via Web Share API or copy link
  shareFestival(): void {
    const fest = this.festival();
    if (!fest) return;

    const shareData = {
      title: `${fest.nameEn} - Kannada Saathi`,
      text: `${fest.nameEn} (${fest.nameKn}) - Celebrated on ${this.formatDate(fest.dateStr)} in Karnataka.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showToast('Festival link copied to clipboard!');
      }).catch(() => {
        this.showToast('Link copied!');
      });
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 2800);
  }

  goBack(): void {
    this.router.navigate(['/calendar']);
  }
}
