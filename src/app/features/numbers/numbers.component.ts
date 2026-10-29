import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { AudioService } from '../../core/services/audio.service';
import { AutoFareService } from '../../core/services/auto-fare.service';
import {
  convertNumberToKannada,
  KannadaNumberResult,
  PRESET_AMOUNTS,
  PAYMENT_PHRASES,
  CHEATSHEET_NUMBERS,
  PresetAmount,
  PaymentPhrase,
} from '../../core/data/numbers.data';

type NumberTab = 'counter' | 'presets' | 'phrases' | 'cheatsheet';

@Component({
  selector: 'app-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavComponent],
  template: `
    <div class="numbers-viewport" role="main">
      <!-- Emerald Curved Top Header matching app design -->
      <header class="numbers-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back" id="btn-numbers-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="header-title">Numbers & Auto Fares</h1>
      </header>

      <!-- Scrollable Main Container -->
      <div class="numbers-scroll animate-fade-in">
        <!-- Tab Selector Row -->
        <div class="tabs-row" role="tablist" aria-label="Numbers navigation tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'presets'"
            (click)="setTab('presets')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'presets'"
            id="tab-presets"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-5 0c0 2 2.5 2.5 3.5 3s3.5 1 3.5 3a3.5 3.5 0 0 1-5 0"/>
            </svg>
            <span>Auto Fares</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'counter'"
            (click)="setTab('counter')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'counter'"
            id="tab-counter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="8" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="18" x2="16" y2="18"/>
            </svg>
            <span>Currency Calculator</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'phrases'"
            (click)="setTab('phrases')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'phrases'"
            id="tab-phrases"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Phrases</span>
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'cheatsheet'"
            (click)="setTab('cheatsheet')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'cheatsheet'"
            id="tab-cheatsheet"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>1 to 100</span>
          </button>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 1: AUTO FARE SIMULATOR & COMMON FARES -->
        <!-- ============================================================== -->
        @if (activeTab() === 'presets') {
          <!-- Auto Fare Simulator Section -->
          <div class="af-sim-container">
            <div class="af-picker-row">
              <div class="af-loc-card">
                <div class="loc-pin from-pin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="loc-col">
                  <span class="loc-tag">From</span>
                  <input type="text" class="loc-text-input" [(ngModel)]="fromLocation" placeholder="M.G. Road, Bengaluru" />
                </div>
              </div>

              <div class="af-loc-card">
                <div class="loc-pin to-pin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="loc-col">
                  <span class="loc-tag">To</span>
                  <input type="text" class="loc-text-input" [(ngModel)]="toLocation" placeholder="Lalbagh, Bengaluru" />
                </div>
              </div>
            </div>

            <!-- Route Map Preview with Auto Rickshaw -->
            <div class="map-box">
              <svg class="map-svg" viewBox="0 0 400 160" preserveAspectRatio="none">
                <line x1="20" y1="40" x2="380" y2="55" stroke="#E2E8F0" stroke-width="6"/>
                <line x1="40" y1="100" x2="360" y2="120" stroke="#E2E8F0" stroke-width="8"/>
                <line x1="90" y1="10" x2="105" y2="150" stroke="#E2E8F0" stroke-width="5"/>
                <line x1="220" y1="10" x2="200" y2="150" stroke="#E2E8F0" stroke-width="7"/>
                <path d="M300 50 L260 52 L230 90 L150 115 L80 120" fill="none" stroke="#2563EB" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                <g transform="translate(300, 36)">
                  <circle cx="0" cy="0" r="12" fill="#EF4444"/>
                  <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
                  <text x="-48" y="-3" fill="#1E293B" font-size="10" font-weight="700">M.G. Road</text>
                </g>
                <g transform="translate(80, 120)">
                  <circle cx="0" cy="0" r="12" fill="#0D6938"/>
                  <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
                  <text x="16" y="4" fill="#1E293B" font-size="10" font-weight="700">Lalbagh</text>
                </g>
                <g transform="translate(205, 90)">
                  <rect x="-13" y="-9" width="26" height="18" rx="4" fill="#F59E0B" stroke="#000" stroke-width="1.2"/>
                  <rect x="-13" y="-9" width="26" height="6" rx="2" fill="#000"/>
                  <circle cx="-7" cy="9" r="3" fill="#1E293B"/>
                  <circle cx="7" cy="9" r="3" fill="#1E293B"/>
                </g>
              </svg>
            </div>

            <!-- Stats -->
            <div class="af-stats-row">
              <div class="af-stat">
                <span class="af-stat-label">Distance</span>
                <span class="af-stat-val">{{ currentRoute.distanceKm }} km</span>
              </div>
              <div class="af-stat">
                <span class="af-stat-label">Estimated Time</span>
                <span class="af-stat-val">{{ currentRoute.timeMin }} min</span>
              </div>
              <div class="af-stat">
                <span class="af-stat-label">Estimated Fare</span>
                <span class="af-stat-val">₹ {{ currentRoute.fareMin }} - {{ currentRoute.fareMax }}</span>
              </div>
            </div>

            <button class="directions-btn" (click)="openDirections()">
              Get Directions
            </button>

            <!-- Distance + Estimates Section (below Get Directions) -->
            <div class="fare-estimate-section">
              <!-- Section label -->
              <div class="fare-est-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
                </svg>
                <span>Estimate Fare</span>
              </div>

              <!-- 3-card row: Distance (editable) | Est. Time | Est. Fare -->
              <div class="fare-three-row">
                <!-- Left: editable distance -->
                <div class="fare-card fare-dist-card">
                  <span class="fare-card-label">
                    Distance
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-left:2px">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </span>
                  <div class="fare-dist-input-row">
                    <input
                      type="number"
                      id="num-dist-input"
                      class="fare-dist-input"
                      [(ngModel)]="enteredDistance"
                      min="0.1"
                      max="100"
                      step="0.5"
                      placeholder="0"
                    />
                    <span class="fare-dist-unit">km</span>
                  </div>
                </div>

                <!-- Est. Time -->
                <div class="fare-card fare-est-card">
                  <span class="fare-card-label">Est. Time</span>
                  <span class="fare-card-val">~{{ estimatedTime }} min</span>
                </div>

                <!-- Est. Fare -->
                <div class="fare-card fare-est-card">
                  <span class="fare-card-label">Est. Fare</span>
                  <span class="fare-card-val fare-rupee-val">₹{{ estimatedFare.min }}–{{ estimatedFare.max }}</span>
                </div>
              </div>

              <!-- Day / Night active banner -->
              <div class="time-charge-banner" [class.night-mode]="isNight">
                <div class="time-charge-icon">
                  @if (isNight) {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  } @else {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    </svg>
                  }
                </div>
                <div class="time-charge-text">
                  <span class="time-charge-title">{{ isNight ? 'Night charges apply' : 'Day charges apply' }}</span>
                  <span class="time-charge-sub">
                    {{ isNight
                      ? 'Night (10 PM–5 AM): +' + fareService.NIGHT_SURCHARGE_PCT + '% on base'
                      : 'Day: ₹' + fareService.BASE_FARE + ' for ' + fareService.BASE_DISTANCE + ' km, then ₹' + fareService.PER_KM_RATE + '/km' }}
                  </span>
                </div>
              </div>

              <!-- Rate reference table -->
              <div class="rate-ref-box">
                <div class="rate-ref-row">
                  <span class="rate-ref-badge day-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="1" y1="12" x2="3" y2="12"/>
                    </svg>
                    Day
                  </span>
                  <span class="rate-ref-val">₹{{ fareService.BASE_FARE }} / {{ fareService.BASE_DISTANCE }} km &middot; ₹{{ fareService.PER_KM_RATE }}/km after</span>
                </div>
                <div class="rate-ref-divider"></div>
                <div class="rate-ref-row">
                  <span class="rate-ref-badge night-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    Night
                  </span>
                  <span class="rate-ref-val">+{{ fareService.NIGHT_SURCHARGE_PCT }}% surcharge on total</span>
                </div>
              </div>

              <!-- Disclaimer -->
              <p class="fare-disclaimer">ⓘ Estimates only · Actual fare may vary · Day &amp; night charges differ</p>
            </div>
          </div>
        }

        <!-- ============================================================== -->
        <!-- TAB 2: CURRENCY CALCULATOR & KEYPAD -->
        <!-- ============================================================== -->
        @if (activeTab() === 'counter') {
          <!-- Display Hero Card -->
          <div class="num-hero-card">
            <div class="hero-top-row">
              <div class="num-badge">KANNADA CURRENCY</div>
              <button
                class="show-big-btn"
                (click)="showFullscreen.set(true)"
                title="Show big to auto driver or shopkeeper"
                id="btn-num-show-big"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
                <span>Show to vendor</span>
              </button>
            </div>

            <!-- Numbers Display -->
            <div class="digits-row">
              <span class="currency-symbol">₹</span>
              <span class="main-digits">{{ currentNumber().digitsEn }}</span>
              <span class="kn-digits font-kannada">({{ currentNumber().digitsKn }})</span>
            </div>

            <!-- Kannada Words Display -->
            <div class="kannada-words-text font-kannada">{{ currentNumber().currencyKn }}</div>
            <div class="translit-words-text">{{ currentNumber().currencyTranslit }}</div>

            <!-- Action Buttons: Listen & Fast Arithmetic -->
            <div class="hero-actions-row">
              <button
                class="listen-action-btn"
                [class.speaking]="isSpeaking() && speakingText() === currentNumber().currencyKn"
                (click)="speakCurrentNumber()"
                id="btn-speak-number"
                aria-label="Listen pronunciation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>{{ (isSpeaking() && speakingText() === currentNumber().currencyKn) ? 'Playing...' : 'Listen Audio' }}</span>
              </button>

              <div class="quick-add-group">
                <button class="quick-add-btn" (click)="addAmount(10)" title="Add 10">+10</button>
                <button class="quick-add-btn" (click)="addAmount(50)" title="Add 50">+50</button>
                <button class="quick-add-btn" (click)="addAmount(100)" title="Add 100">+100</button>
              </div>
            </div>
          </div>

          <!-- Keypad Card -->
          <div class="num-pad-card">
            <div class="keypad-grid">
              <button class="key-btn" (click)="pressDigit('1')" id="key-1">1</button>
              <button class="key-btn" (click)="pressDigit('2')" id="key-2">2</button>
              <button class="key-btn" (click)="pressDigit('3')" id="key-3">3</button>

              <button class="key-btn" (click)="pressDigit('4')" id="key-4">4</button>
              <button class="key-btn" (click)="pressDigit('5')" id="key-5">5</button>
              <button class="key-btn" (click)="pressDigit('6')" id="key-6">6</button>

              <button class="key-btn" (click)="pressDigit('7')" id="key-7">7</button>
              <button class="key-btn" (click)="pressDigit('8')" id="key-8">8</button>
              <button class="key-btn" (click)="pressDigit('9')" id="key-9">9</button>

              <button class="key-btn key-action" (click)="clearNumber()" id="key-clear" title="Clear">C</button>
              <button class="key-btn" (click)="pressDigit('0')" id="key-0">0</button>
              <button class="key-btn key-action" (click)="backspace()" id="key-backspace" title="Backspace" aria-label="Backspace">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="tip-card">
            <div class="tip-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div class="tip-text-col">
              <span class="tip-label">Bengaluru Auto Tip</span>
              <span class="tip-body">The base meter fare is ₹30 for the first 2 km. When an auto stops, you can say: "Eshtu aithu, boss?" (How much is it, boss?).</span>
            </div>
          </div>
        }

        <!-- ============================================================== -->
        <!-- TAB 3: PAYMENT & BARGAINING PHRASES -->
        <!-- ============================================================== -->
        @if (activeTab() === 'phrases') {
          <div class="section-heading-row">
            <h2 class="section-title">Auto & Payment Phrases</h2>
            <span class="section-sub">Essential phrases for daily transactions</span>
          </div>

          <div class="phrases-list">
            @for (phrase of paymentPhrases; track phrase.id) {
              <div class="phrase-quick-card" id="{{ phrase.id }}">
                <div class="phrase-texts-col">
                  <div class="phrase-kn font-kannada">{{ phrase.kannada }}</div>
                  <div class="phrase-tr">{{ phrase.transliteration }}</div>
                  <div class="phrase-en">{{ phrase.english }}</div>
                </div>

                <div class="phrase-actions-col">
                  <button
                    class="mini-listen-btn"
                    [class.speaking]="isSpeaking() && speakingText() === phrase.kannada"
                    (click)="speakText(phrase.kannada)"
                    aria-label="Listen"
                    title="Listen pronunciation"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </button>
                  <button
                    class="mini-show-btn"
                    (click)="showCustomPhrase(phrase.kannada, phrase.transliteration, phrase.english)"
                    title="Show to someone"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/>
                      <line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- ============================================================== -->
        <!-- TAB 4: 1 TO 100 CHEATSHEET -->
        <!-- ============================================================== -->
        @if (activeTab() === 'cheatsheet') {
          <div class="section-heading-row">
            <h2 class="section-title">Kannada Numbers Cheatsheet</h2>
            <span class="section-sub">Milestones from 1 to 1000 with Kannada numerals</span>
          </div>

          <div class="cheatsheet-grid">
            @for (item of cheatsheet; track item.val) {
              <div class="cheat-item" (click)="speakText(item.kn)" id="cheat-{{ item.val }}">
                <div class="cheat-top">
                  <span class="cheat-num">{{ item.val }}</span>
                  <span class="cheat-kndigit font-kannada">{{ item.knDigit }}</span>
                </div>
                <div class="cheat-kn font-kannada">{{ item.kn }}</div>
                <div class="cheat-tr">{{ item.tr }}</div>
              </div>
            }
          </div>
        }
      </div>

      <app-bottom-nav />

      <!-- ============================================================== -->
      <!-- Fullscreen "Show to Driver / Shopkeeper" Modal -->
      <!-- ============================================================== -->
      @if (showFullscreen()) {
        <div class="show-modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-label="Show number to vendor">
          <div class="show-modal-top">
            <div class="show-hint-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Show this to driver or shopkeeper</span>
            </div>
            <button class="show-close-btn" (click)="showFullscreen.set(false)" aria-label="Close fullscreen" id="btn-close-num-modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="show-content">
            <div class="show-digits">
              <span class="show-sym">₹</span>
              <span>{{ activeModalData().digits }}</span>
            </div>
            <div class="show-kn font-kannada">{{ activeModalData().kannada }}</div>
            <div class="show-tr">{{ activeModalData().transliteration }}</div>
            <div class="show-en">{{ activeModalData().english }}</div>
          </div>

          <div class="show-modal-bottom">
            <button
              class="float-action-btn"
              [class.speaking]="isSpeaking() && speakingText() === activeModalData().kannada"
              (click)="speakText(activeModalData().kannada)"
              id="btn-modal-listen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <span>{{ (isSpeaking() && speakingText() === activeModalData().kannada) ? 'Playing...' : 'Speak aloud' }}</span>
            </button>

            <button class="float-action-btn secondary" (click)="showFullscreen.set(false)">
              <span>Close</span>
            </button>
          </div>
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
      background: #FFFFFF;
    }

    .numbers-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
    }

    /* Emerald Header matching app branding */
    .numbers-header {
      flex-shrink: 0;
      background: #176B57;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 0.75rem;
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
      flex: 1;
    }

    .header-offline-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
      padding: 0.22rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Scrollable Container */
    .numbers-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.85rem 1rem calc(var(--nav-height, 64px) + var(--safe-bottom, 0px) + 1.5rem);
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    /* Tabs Row */
    .tabs-row {
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 0.65rem;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .tabs-row::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0.42rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #4B5563;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      font-family: inherit;
      flex-shrink: 0;
    }

    .tab-btn.active {
      background: #176B57;
      color: #FFFFFF;
      border-color: #176B57;
      box-shadow: 0 2px 8px rgba(23, 107, 87, 0.25);
    }

    /* Display Hero Card */
    .num-hero-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem 1.15rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      margin-bottom: 0.85rem;
      text-align: left;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }

    .num-badge {
      font-size: 0.7rem;
      font-weight: 800;
      color: #176B57;
      letter-spacing: 0.05em;
      background: #E8F5EF;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .show-big-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: #F9FAF9;
      border: 1px solid #D1D5DB;
      border-radius: 9999px;
      padding: 0.25rem 0.65rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #374151;
      cursor: pointer;
      font-family: inherit;
    }

    .digits-row {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      margin-bottom: 0.35rem;
    }

    .currency-symbol {
      font-size: 1.6rem;
      font-weight: 800;
      color: #059669;
    }

    .main-digits {
      font-size: 2.3rem;
      font-weight: 900;
      color: #111827;
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .kn-digits {
      font-size: 1.45rem;
      font-weight: 700;
      color: #6B7280;
    }

    .kannada-words-text {
      font-size: 1.55rem;
      font-weight: 800;
      color: #176B57;
      line-height: 1.3;
      margin-bottom: 0.2rem;
    }

    .translit-words-text {
      font-size: 0.95rem;
      font-style: italic;
      color: #4B5563;
      margin-bottom: 0.85rem;
    }

    .hero-actions-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-top: 1px solid #F3F4F6;
      padding-top: 0.85rem;
    }

    .listen-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      flex: 1;
      padding: 0.65rem 1rem;
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s ease;
    }

    .listen-action-btn:hover {
      background: #135545;
    }

    .listen-action-btn.speaking {
      background: #0f4f40 !important;
      box-shadow: 0 0 0 3px rgba(23, 107, 87, 0.4) !important;
      animation: speaking-pulse 1.3s ease-in-out infinite;
    }

    [data-theme="dark"] .hero-actions-row {
      border-top-color: #24382E;
    }

    [data-theme="dark"] .quick-add-btn {
      background: #1A2E26;
      border-color: #244438;
      color: #D1E7DD;
    }

    .quick-add-group {
      display: flex;
      gap: 0.3rem;
    }

    .quick-add-btn {
      padding: 0.55rem 0.65rem;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #374151;
      cursor: pointer;
      font-family: inherit;
    }

    .quick-add-btn:hover {
      background: #E8F5EF;
      color: #176B57;
      border-color: #B2E4D0;
    }

    /* Keypad Card */
    .num-pad-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 0.85rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      margin-bottom: 0.85rem;
    }

    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.55rem;
    }

    .key-btn {
      height: 52px;
      background: #F9FAF9;
      border: 1.5px solid #EAEFEA;
      border-radius: 14px;
      font-size: 1.45rem;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.12s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .key-btn:active {
      transform: scale(0.96);
      background: #E8F5EF;
      border-color: #176B57;
    }

    .key-btn.key-action {
      background: #F3F4F6;
      color: #4B5563;
      font-size: 1.15rem;
    }

    /* Tip Card */
    .tip-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 18px;
      padding: 0.85rem 1rem;
      text-align: left;
    }

    .tip-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #DCFCE7;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .tip-text-col {
      flex: 1;
    }

    .tip-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 800;
      color: #176B57;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .tip-body {
      font-size: 0.82rem;
      color: #166534;
      line-height: 1.4;
    }

    /* Auto Fare Simulator styles in Tab 2 */
    .af-sim-container {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 1rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .af-picker-row {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin-bottom: 0.85rem;
    }

    .af-loc-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 0.6rem 0.85rem;
    }

    .loc-pin {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .from-pin {
      background: #FEE2E2;
      color: #DC2626;
    }

    .to-pin {
      background: #DCFCE7;
      color: #16A34A;
    }

    .loc-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .loc-tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748B;
      letter-spacing: 0.05em;
    }

    .loc-text-input {
      border: none;
      background: transparent;
      font-size: 0.85rem;
      font-weight: 600;
      color: #1E293B;
      padding: 0.15rem 0 0;
      outline: none;
      width: 100%;
      font-family: inherit;
    }

    .map-box {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      background: #F1F5F9;
      height: 120px;
      margin-bottom: 0.85rem;
    }

    .map-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .af-stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .af-stat {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 0.55rem 0.4rem;
      text-align: center;
    }

    .af-stat-label {
      display: block;
      font-size: 0.65rem;
      font-weight: 600;
      color: #64748B;
      margin-bottom: 0.2rem;
    }

    .af-stat-val {
      display: block;
      font-size: 0.85rem;
      font-weight: 800;
      color: #0F172A;
      white-space: nowrap;
    }

    .directions-btn {
      width: 100%;
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(23, 107, 87, 0.2);
      transition: background 0.15s ease;
    }

    .directions-btn:hover {
      background: #125243;
    }

    /* Fare Estimate Section */
    .fare-estimate-section {
      margin-top: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .fare-est-header {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .fare-three-row {
      display: flex;
      gap: 0.45rem;
      align-items: stretch;
    }

    .fare-card {
      flex: 1;
      border-radius: 12px;
      padding: 0.55rem 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
    }

    .fare-dist-card {
      background: #FFFFFF;
      border: 2px solid #176B57;
    }

    .fare-dist-card:focus-within {
      box-shadow: 0 0 0 3px rgba(23,107,87,0.12);
    }

    .fare-est-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
    }

    .fare-card-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.02em;
    }

    .fare-dist-input-row {
      display: flex;
      align-items: baseline;
      gap: 0.15rem;
    }

    .fare-dist-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 1.15rem;
      font-weight: 800;
      color: #111827;
      padding: 0;
      min-width: 0;
      font-family: inherit;
    }

    .fare-dist-input::placeholder { color: #9CA3AF; }

    .fare-dist-unit {
      font-size: 0.75rem;
      font-weight: 700;
      color: #6B7280;
      flex-shrink: 0;
    }

    .fare-card-val {
      font-size: 0.9rem;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.2;
    }

    .fare-rupee-val { font-size: 0.82rem; }

    /* Day/Night Banner */
    .time-charge-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #FFF7ED;
      border: 1px solid #FED7AA;
      border-radius: 10px;
      padding: 0.55rem 0.75rem;
    }

    .time-charge-banner.night-mode {
      background: #EEF2FF;
      border-color: #C7D2FE;
    }

    .time-charge-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #F59E0B;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    }

    .night-mode .time-charge-icon { color: #818CF8; }

    .time-charge-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .time-charge-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #92400E;
    }

    .night-mode .time-charge-title { color: #3730A3; }

    .time-charge-sub {
      font-size: 0.68rem;
      color: #B45309;
      line-height: 1.3;
    }

    .night-mode .time-charge-sub { color: #4338CA; }

    /* Rate reference box */
    .rate-ref-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 0.55rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .rate-ref-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
    }

    .rate-ref-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.18rem 0.45rem;
      border-radius: 9999px;
    }

    .day-badge  { background: #FEF3C7; color: #92400E; }
    .night-badge { background: #EEF2FF; color: #3730A3; }

    .rate-ref-val {
      font-size: 0.68rem;
      font-weight: 600;
      color: #374151;
      text-align: right;
    }

    .rate-ref-divider {
      height: 1px;
      background: #E5E7EB;
    }

    .fare-disclaimer {
      font-size: 0.66rem;
      color: #9CA3AF;
      font-weight: 500;
      margin: 0;
      text-align: center;
    }

    /* Presets & Phrases Lists */
    .section-heading-row {
      text-align: left;
      margin: 0.2rem 0 0.85rem;
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 2px;
    }

    .section-sub {
      font-size: 0.78rem;
      color: #6B7280;
    }

    .presets-list, .phrases-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .preset-card, .phrase-quick-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 16px;
      padding: 0.85rem 1rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
    }

    .preset-card:hover, .phrase-quick-card:hover {
      border-color: #B2E4D0;
      background: #FAFFFE;
    }

    .preset-amount-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 60px;
    }

    .preset-badge {
      font-size: 1.15rem;
      font-weight: 800;
      color: #059669;
    }

    .preset-kn-digits {
      font-size: 0.82rem;
      color: #6B7280;
    }

    .preset-details-col, .phrase-texts-col {
      flex: 1;
    }

    .preset-kn, .phrase-kn {
      font-size: 1.05rem;
      font-weight: 700;
      color: #176B57;
      line-height: 1.3;
    }

    .preset-tr, .phrase-tr {
      font-size: 0.82rem;
      font-style: italic;
      color: #6B7280;
      margin-top: 2px;
    }

    .preset-desc, .phrase-en {
      font-size: 0.8rem;
      color: #374151;
      margin-top: 2px;
    }

    .phrase-actions-col {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .mini-listen-btn, .mini-show-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #E8F5EF;
      border: none;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }

    .mini-listen-btn:hover, .mini-show-btn:hover {
      background: #D1F0E3;
    }

    /* Cheatsheet Grid */
    .cheatsheet-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
    }

    .cheat-item {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 14px;
      padding: 0.75rem 0.85rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
    }

    .cheat-item:hover {
      border-color: #B2E4D0;
      background: #FAFFFE;
    }

    .cheat-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.2rem;
    }

    .cheat-num {
      font-size: 1.15rem;
      font-weight: 800;
      color: #111827;
    }

    .cheat-kndigit {
      font-size: 0.95rem;
      font-weight: 700;
      color: #059669;
    }

    .cheat-kn {
      font-size: 0.95rem;
      font-weight: 700;
      color: #176B57;
      line-height: 1.25;
    }

    .cheat-tr {
      font-size: 0.75rem;
      font-style: italic;
      color: #6B7280;
    }

    /* Fullscreen Modal */
    .show-modal-overlay {
      position: fixed;
      inset: 0;
      background: #176B57;
      color: #FFFFFF;
      z-index: 200;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem 1.25rem 2rem;
      box-sizing: border-box;
    }

    .show-modal-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .show-hint-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    .show-close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      border: none;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .show-content {
      text-align: center;
      padding: 1rem 0;
    }

    .show-digits {
      font-size: clamp(3.2rem, 11vw, 4.5rem);
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 0.75rem;
    }

    .show-sym {
      color: #6EE7B7;
      margin-right: 4px;
    }

    .show-kn {
      font-size: clamp(2rem, 7vw, 2.7rem);
      font-weight: 800;
      line-height: 1.25;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
    }

    .show-tr {
      font-size: clamp(1.1rem, 4vw, 1.35rem);
      font-style: italic;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 0.4rem;
    }

    .show-en {
      font-size: clamp(1rem, 3.5vw, 1.15rem);
      color: rgba(255, 255, 255, 0.75);
    }

    .show-modal-bottom {
      display: flex;
      gap: 0.75rem;
    }

    .float-action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #FFFFFF;
      color: #176B57;
      border: none;
      border-radius: 14px;
      padding: 0.95rem;
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      font-family: inherit;
    }

    .float-action-btn.secondary {
      background: rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
    }

    /* Animation */
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class NumbersComponent implements OnInit {
  activeTab = signal<NumberTab>('presets');
  currentNumberValue = signal<number>(30); // Starts with Bangalore min auto fare (₹30)
  currentNumber = signal<KannadaNumberResult>(convertNumberToKannada(30));
  showFullscreen = signal<boolean>(false);
  isSpeaking = signal<boolean>(false);
  speakingText = signal<string | null>(null);

  // Modal display payload
  activeModalData = signal<{ digits: string; kannada: string; transliteration: string; english: string }>({
    digits: '30',
    kannada: 'ಮೂವತ್ತು ರೂಪಾಯಿ',
    transliteration: 'Moovattu roopayi',
    english: '30 rupees',
  });

  presets: PresetAmount[] = PRESET_AMOUNTS;
  paymentPhrases: PaymentPhrase[] = PAYMENT_PHRASES;
  cheatsheet = CHEATSHEET_NUMBERS;

  // Auto Fare Route Estimator
  fromLocation = 'M.G. Road, Bengaluru';
  toLocation = 'Lalbagh, Bengaluru';
  currentRoute = {
    from: 'M.G. Road, Bengaluru',
    to: 'Lalbagh, Bengaluru',
    distanceKm: 4.2,
    timeMin: 15,
    fareMin: 60,
    fareMax: 80,
  };

  fareService = inject(AutoFareService);

  // Distance entered by user for fare estimation
  enteredDistance = 4.2;

  get isNight(): boolean {
    return this.fareService.isNightTime();
  }

  get estimatedTime(): number {
    const d = Number(this.enteredDistance) || 0;
    return Math.max(1, Math.round(d * 3.5));
  }

  get estimatedFare(): { min: number; max: number } {
    const d = Number(this.enteredDistance) || 0;
    return this.fareService.calculateFare(d, this.isNight);
  }

  openDirections(): void {
    const origin = encodeURIComponent(this.fromLocation || 'M.G. Road, Bengaluru');
    const destination = encodeURIComponent(this.toLocation || 'Lalbagh, Bengaluru');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank');
  }

  constructor(
    private router: Router,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.updateNumber(30);
  }

  setTab(tab: NumberTab): void {
    this.activeTab.set(tab);
  }

  pressDigit(digit: string): void {
    const current = String(this.currentNumberValue());
    let nextStr = current === '0' ? digit : current + digit;
    let nextVal = parseInt(nextStr, 10);
    if (isNaN(nextVal)) nextVal = 0;
    if (nextVal > 99999) nextVal = 99999;
    this.updateNumber(nextVal);
  }

  backspace(): void {
    const current = String(this.currentNumberValue());
    if (current.length <= 1) {
      this.updateNumber(0);
    } else {
      const nextStr = current.slice(0, -1);
      this.updateNumber(parseInt(nextStr, 10) || 0);
    }
  }

  clearNumber(): void {
    this.updateNumber(0);
  }

  addAmount(amount: number): void {
    const nextVal = Math.min(99999, this.currentNumberValue() + amount);
    this.updateNumber(nextVal);
  }

  selectPreset(amount: number): void {
    this.updateNumber(amount);
    this.activeTab.set('counter');
    this.speakCurrentNumber();
  }

  showCustomPhrase(kn: string, tr: string, en: string): void {
    this.activeModalData.set({
      digits: '',
      kannada: kn,
      transliteration: tr,
      english: en,
    });
    this.showFullscreen.set(true);
  }

  private updateNumber(val: number): void {
    this.currentNumberValue.set(val);
    const result = convertNumberToKannada(val);
    this.currentNumber.set(result);
    this.activeModalData.set({
      digits: String(result.value),
      kannada: result.currencyKn,
      transliteration: result.currencyTranslit,
      english: `${result.value} rupees`,
    });
  }

  getKnResult(n: number): KannadaNumberResult {
    return convertNumberToKannada(n);
  }

  toKnDigits(n: number): string {
    return convertNumberToKannada(n).digitsKn;
  }

  async speakCurrentNumber(): Promise<void> {
    const text = this.currentNumber().currencyKn;
    await this.speakText(text);
  }

  async speakText(text: string): Promise<void> {
    if (!text) return;
    if (this.isSpeaking()) {
      this.audioService.stop();
      this.isSpeaking.set(false);
      this.speakingText.set(null);
      return;
    }
    this.isSpeaking.set(true);
    this.speakingText.set(text);
    try {
      await this.audioService.speak(text);
    } catch {
      // Silently catch
    } finally {
      this.isSpeaking.set(false);
      this.speakingText.set(null);
      if (typeof document !== 'undefined') {
        (document.activeElement as HTMLElement)?.blur();
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
