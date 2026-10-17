import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { PhraseService } from '../../core/services/phrase.service';
import { AudioService } from '../../core/services/audio.service';
import { ActivityService } from '../../core/services/activity.service';
import { Phrase } from '../../core/models/models';

interface QuickScenario {
  label: string;
  icon: string; // key for SVG icon
  query: string;
  tipText: string;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [FormsModule, BottomNavComponent],
  template: `
    <div class="conv-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="conv-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back to home" id="btn-conv-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Quick Conversation</h1>

        <div class="header-offline-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Offline phrases available</span>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="conv-scroll animate-fade-in">
        <!-- Scenario Chips Row -->
        <div class="scenarios-row" role="tablist" aria-label="Conversation scenarios">
          @for (s of scenarios; track s.label) {
            <button
              class="scenario-chip"
              [class.active]="selectedScenario() === s.label"
              (click)="selectScenario(s)"
              role="tab"
              [attr.aria-selected]="selectedScenario() === s.label"
              [id]="'chip-' + s.label"
            >
              <!-- Inline SVG Icon per scenario -->
              @if (s.icon === 'auto') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h4l3 5v3h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              } @else if (s.icon === 'hotel') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              } @else if (s.icon === 'shopping') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              } @else if (s.icon === 'map') {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              }
              <span>{{ s.label }}</span>
            </button>
          }
        </div>

        <!-- Search / Input Card -->
        <div class="input-card">
          <div class="input-card-label">ENGLISH OR TRANSLITERATION</div>

          <div class="input-row">
            <input
              type="text"
              class="phrase-input"
              [(ngModel)]="inputText"
              (ngModelChange)="onInputChange($event)"
              placeholder="Type what you want to say..."
              aria-label="Enter phrase in English"
              id="conversation-input"
              autocomplete="off"
            />
            @if (inputText) {
              <button class="clear-x-btn" (click)="clearInput()" aria-label="Clear input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            }
          </div>

          <!-- Action Buttons Row -->
          <div class="input-actions-row">
            <!-- Speak / Mic Button -->
            <button
              class="speak-btn"
              [class.listening]="isListening()"
              (click)="toggleListening()"
              [title]="isListening() ? 'Stop listening' : 'Speak phrase'"
              id="btn-speak"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span>{{ isListening() ? 'Listening...' : 'Speak' }}</span>
            </button>

            <!-- Find Phrase Button -->
            <button
              class="find-btn"
              (click)="findMatchingPhrases()"
              id="btn-find-phrase"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>Find phrase</span>
            </button>
          </div>
        </div>

        <!-- Best Match Result Card -->
        @if (bestMatch()) {
          <div class="result-card">
            <!-- Top Row: Badge + Show to someone -->
            <div class="result-header-row">
              <div class="match-badge-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>{{ isExactMatch() ? 'Best phrase match' : 'Suggested match' }}</span>
              </div>

              <button
                class="show-to-btn"
                (click)="showFullscreen.set(true)"
                title="Show to the other person fullscreen"
                id="btn-show-to-someone"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
                <span>Show to someone</span>
              </button>
            </div>

            <!-- Kannada Output -->
            <div class="result-kn font-kannada">{{ bestMatch()!.kannada }}</div>
            <div class="result-tr">{{ bestMatch()!.transliteration }}</div>
            <div class="result-en">{{ bestMatch()!.english }}</div>

            <!-- Divider -->
            <div class="result-divider"></div>

            <!-- Action Buttons: Listen + Save -->
            <div class="result-actions">
              <button
                class="listen-action-btn"
                (click)="playAudio(bestMatch()!.kannada)"
                aria-label="Listen pronunciation"
                id="btn-listen-result"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>Listen</span>
              </button>

              <button
                class="save-action-btn"
                [class.saved]="isSaved(bestMatch()!.id)"
                (click)="toggleSave(bestMatch()!)"
                [aria-label]="isSaved(bestMatch()!.id) ? 'Remove from saved' : 'Save phrase'"
                id="btn-save-result"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  [attr.fill]="isSaved(bestMatch()!.id) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ isSaved(bestMatch()!.id) ? 'Saved' : 'Save phrase' }}</span>
              </button>
            </div>

            <!-- Matched from phrasebook indicator -->
            @if (isExactMatch()) {
              <div class="matched-from-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>Matched from your phrasebook</span>
              </div>
            }
          </div>

          <!-- Other Results -->
          @if (matchingList().length > 1) {
            <div class="other-results">
              <h3 class="other-results-title">More matches</h3>
              @for (phrase of matchingList().slice(1, 4); track phrase.id) {
                <div class="other-result-card" (click)="selectMatch(phrase)" [id]="'other-result-' + phrase.id">
                  <div class="other-result-texts">
                    <div class="other-kn font-kannada">{{ phrase.kannada }}</div>
                    <div class="other-tr">{{ phrase.transliteration }}</div>
                    <div class="other-en">{{ phrase.english }}</div>
                  </div>
                  <button
                    class="mini-listen-btn"
                    (click)="playAudio(phrase.kannada); $event.stopPropagation()"
                    aria-label="Listen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        }

        <!-- Contextual Local Tip Card -->
        <div class="tip-card">
          <div class="tip-icon-box" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="tip-text-col">
            <span class="tip-label">Local tip</span>
            <span class="tip-body">{{ activeTip() }}</span>
          </div>
        </div>
      </div>

      <app-bottom-nav />

      <!-- ======================================================== -->
      <!-- Fullscreen "Show this to the other person" Modal -->
      <!-- ======================================================== -->
      @if (showFullscreen() && bestMatch()) {
        <div class="show-modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-label="Show phrase to someone">
          <!-- Top Bar -->
          <div class="show-modal-top">
            <div class="show-hint-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Show this to the other person</span>
            </div>
            <button class="show-close-btn" (click)="showFullscreen.set(false)" aria-label="Close fullscreen" id="btn-close-show-modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Centered Text -->
          <div class="show-content">
            <div class="show-kn font-kannada">{{ bestMatch()!.kannada }}</div>
            <div class="show-tr">{{ bestMatch()!.transliteration }}</div>
            <div class="show-en">{{ bestMatch()!.english }}</div>
          </div>

          <!-- Bottom Architectural Watermark -->
          <div class="show-watermark" aria-hidden="true">
            <svg width="260" height="100" viewBox="0 0 260 100" fill="none" stroke="#FFFFFF" stroke-width="1.1" opacity="0.14">
              <path d="M100 38 C100 17 160 17 160 38 Z"/>
              <line x1="130" y1="4" x2="130" y2="17"/>
              <circle cx="130" cy="4" r="3" fill="#FFFFFF"/>
              <rect x="96" y="38" width="68" height="6" rx="2"/>
              <path d="M88 52 L130 42 L172 52 Z"/>
              <line x1="101" y1="52" x2="101" y2="82"/>
              <line x1="116" y1="52" x2="116" y2="82"/>
              <line x1="130" y1="52" x2="130" y2="82"/>
              <line x1="144" y1="52" x2="144" y2="82"/>
              <line x1="159" y1="52" x2="159" y2="82"/>
              <path d="M36 46 C36 30 64 30 64 46 Z"/>
              <path d="M196 46 C196 30 224 30 224 46 Z"/>
              <rect x="28" y="46" width="44" height="36" rx="1"/>
              <rect x="188" y="46" width="44" height="36" rx="1"/>
              <rect x="8" y="82" width="244" height="6" rx="1"/>
              <rect x="0" y="90" width="260" height="7" rx="1"/>
            </svg>
          </div>

          <!-- Floating Action Bar -->
          <div class="show-float-bar">
            <button class="float-action-btn" (click)="playAudio(bestMatch()!.kannada)" id="btn-show-listen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <span>Listen</span>
            </button>

            <button class="float-action-btn" (click)="showFullscreen.set(false)" id="btn-show-close-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 14 10 14 10 20"/>
                <polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <span>Show full</span>
            </button>

            <button
              class="float-action-btn"
              [class.saved]="isSaved(bestMatch()!.id)"
              (click)="toggleSave(bestMatch()!)"
              id="btn-show-save"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                [attr.fill]="isSaved(bestMatch()!.id) ? '#176B57' : 'none'"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ isSaved(bestMatch()!.id) ? 'Saved' : 'Save' }}</span>
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
      background: #F9FAF9;
    }

    .conv-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Emerald Header with Curved Bottom */
    .conv-header {
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
    .conv-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.85rem 1rem calc(var(--nav-height) + var(--safe-bottom) + 1.25rem);
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    /* Scenario Chips */
    .scenarios-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 2px;
      margin-bottom: 1rem;
      scrollbar-width: none;
    }

    .scenarios-row::-webkit-scrollbar {
      display: none;
    }

    .scenario-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.48rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      border: 1.5px solid #E5E7EB;
      background: #FFFFFF;
      color: #4B5563;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .scenario-chip:hover:not(.active) {
      border-color: #176B57;
      color: #176B57;
    }

    .scenario-chip.active {
      background: #176B57;
      color: #FFFFFF;
      border-color: #176B57;
      box-shadow: 0 2px 8px rgba(23, 107, 87, 0.25);
    }

    /* Input Card */
    .input-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.1rem 1.1rem 0.85rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1rem;
    }

    .input-card-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #9CA3AF;
      text-transform: uppercase;
      margin-bottom: 0.65rem;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #F9FAF9;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 0.6rem 0.85rem;
      margin-bottom: 0.85rem;
      transition: border-color 0.2s ease;
    }

    .input-row:focus-within {
      border-color: #176B57;
      background: #FFFFFF;
    }

    .phrase-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 1.05rem;
      font-weight: 500;
      color: #111827;
      font-family: inherit;
      min-width: 0;
    }

    .phrase-input::placeholder {
      color: #9CA3AF;
      font-weight: 400;
    }

    .clear-x-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      flex-shrink: 0;
      transition: color 0.15s ease;
    }

    .clear-x-btn:hover {
      color: #4B5563;
    }

    .input-actions-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .speak-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.55rem 1.1rem;
      border: 1.5px solid #D1D5DB;
      border-radius: 9999px;
      background: #FFFFFF;
      color: #374151;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .speak-btn:hover {
      border-color: #176B57;
      color: #176B57;
    }

    .speak-btn.listening {
      background: #FEF2F2;
      border-color: #EF4444;
      color: #DC2626;
      animation: pulse-red 1.5s ease infinite;
    }

    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.65; }
    }

    .find-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.55rem 1rem;
      border: none;
      border-radius: 9999px;
      background: #176B57;
      color: #FFFFFF;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
      font-family: inherit;
    }

    .find-btn:hover {
      background: #135545;
    }

    /* Result Card */
    .result-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1rem;
      text-align: left;
    }

    .result-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .match-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      background: #E8F5EF;
      color: #176B57;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid #B2E4D0;
    }

    .show-to-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #F9FAF9;
      border: 1.5px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0.28rem 0.75rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: #374151;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .show-to-btn:hover {
      border-color: #176B57;
      color: #176B57;
    }

    .result-kn {
      font-size: 1.75rem;
      font-weight: 800;
      color: #176B57;
      line-height: 1.3;
      margin-bottom: 0.35rem;
    }

    .result-tr {
      font-size: 0.95rem;
      font-style: italic;
      color: #6B7280;
      margin-bottom: 0.3rem;
    }

    .result-en {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0;
    }

    .result-divider {
      height: 1px;
      background: #F3F4F6;
      margin: 0.85rem 0;
    }

    .result-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.65rem;
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
      transition: background 0.15s ease;
      font-family: inherit;
    }

    .listen-action-btn:hover {
      background: #135545;
    }

    .save-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      flex: 1;
      padding: 0.65rem 1rem;
      background: #FFFFFF;
      color: #374151;
      border: 1.5px solid #D1D5DB;
      border-radius: 12px;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .save-action-btn:hover {
      border-color: #176B57;
      color: #176B57;
    }

    .save-action-btn.saved {
      background: #E8F5EF;
      color: #176B57;
      border-color: #B2E4D0;
    }

    .matched-from-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.76rem;
      color: #9CA3AF;
    }

    /* Other Results */
    .other-results {
      margin-bottom: 1rem;
    }

    .other-results-title {
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9CA3AF;
      margin: 0 0 0.65rem;
    }

    .other-result-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 16px;
      padding: 0.85rem 1rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .other-result-card:hover {
      border-color: #B2E4D0;
      background: #FAFFFE;
    }

    .other-result-texts {
      flex: 1;
      text-align: left;
    }

    .other-kn {
      font-size: 1rem;
      font-weight: 700;
      color: #176B57;
      line-height: 1.35;
    }

    .other-tr {
      font-size: 0.78rem;
      font-style: italic;
      color: #6B7280;
      margin-top: 2px;
    }

    .other-en {
      font-size: 0.8rem;
      color: #4B5563;
      margin-top: 2px;
    }

    .mini-listen-btn {
      width: 34px;
      height: 34px;
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

    .mini-listen-btn:hover {
      background: #D1F0E3;
    }

    /* Local Tip Card */
    .tip-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 18px;
      padding: 0.95rem 1.1rem;
      margin-bottom: 0.5rem;
      text-align: left;
    }

    .tip-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #DCFCE7;
      color: #15803D;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .tip-text-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .tip-label {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #15803D;
    }

    .tip-body {
      font-size: 0.84rem;
      color: #166534;
      line-height: 1.5;
    }

    /* ========================================================= */
    /* FULLSCREEN "SHOW TO SOMEONE" MODAL */
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

    .show-modal-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 5;
    }

    .show-hint-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.84rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
    }

    .show-close-btn {
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
      transition: background 0.15s ease;
    }

    .show-close-btn:hover {
      background: rgba(255, 255, 255, 0.28);
    }

    .show-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: auto 0;
      padding: 1rem 0;
      position: relative;
      z-index: 5;
    }

    .show-kn {
      font-size: 2.4rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.35;
      margin-bottom: 0.85rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .show-tr {
      font-size: 1.1rem;
      font-style: italic;
      color: #B2E4D0;
      margin-bottom: 1rem;
    }

    .show-en {
      font-size: 1.25rem;
      font-weight: 600;
      color: #FFFFFF;
    }

    .show-watermark {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      user-select: none;
      z-index: 2;
    }

    .show-float-bar {
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

    .float-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      background: transparent;
      border: none;
      color: #1F2937;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0.35rem 0.85rem;
      border-radius: 12px;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .float-action-btn:hover {
      background: #F3F4F6;
    }

    .float-action-btn.saved {
      color: #176B57;
    }
  `],
})
export class ConversationComponent implements OnInit {
  inputText = '';
  isListening = signal<boolean>(false);
  bestMatch = signal<Phrase | null>(null);
  matchingList = signal<Phrase[]>([]);
  isExactMatch = signal<boolean>(true);
  showFullscreen = signal<boolean>(false);
  selectedScenario = signal<string>('Auto');

  scenarios: QuickScenario[] = [
    { label: 'Auto', icon: 'auto', query: 'Go by meter', tipText: "You can also say 'Meter haaki, please' when asking an auto driver to use the meter." },
    { label: 'Hotel / Cafe', icon: 'hotel', query: 'coffee', tipText: "Saying 'Filter coffee kudisi' (give filter coffee) sounds more natural at local cafes." },
    { label: 'Shopping', icon: 'shopping', query: 'How much', tipText: "'Eshtu?' (how much?) is the quickest way to ask for a price anywhere in Karnataka." },
    { label: 'Directions', icon: 'map', query: 'Where is', tipText: "'Nayite' (straight), 'Balagake' (right), 'Edagake' (left) — the three words to navigate Karnataka!" },
  ];

  currentTip = "You can also say 'Meter haaki, please' when asking an auto driver to use the meter.";

  activeTip = signal<string>("You can also say 'Meter haaki, please' when asking an auto driver to use the meter.");

  constructor(
    private phraseService: PhraseService,
    private audioService: AudioService,
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inputText = 'Go by meter';
    this.findMatchingPhrases();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  selectScenario(s: QuickScenario): void {
    this.selectedScenario.set(s.label);
    this.inputText = s.query;
    this.activeTip.set(s.tipText);
    this.findMatchingPhrases();
  }

  clearInput(): void {
    this.inputText = '';
    this.bestMatch.set(null);
    this.matchingList.set([]);
  }

  onInputChange(val: string): void {
    if (val && val.length > 1) {
      this.findMatchingPhrases();
    }
  }

  findMatchingPhrases(): void {
    if (!this.inputText.trim()) return;
    const q = this.inputText.trim();
    const results = this.phraseService.searchPhrases(q);

    if (results.length > 0) {
      this.bestMatch.set(results[0]);
      this.matchingList.set(results);
      this.isExactMatch.set(true);
      this.activityService.log('translation', results[0].id, results[0].english);
    } else {
      const fallback: Phrase = {
        id: 'offline-query',
        situationId: 'general',
        kannada: 'ಹೇಗೆ ಹೇಳುವುದು?',
        transliteration: 'Hege heluvudu?',
        english: `How to say: "${q}"`,
        verified: false,
        note: 'Phrase not found in offline dictionary. Try different keywords.'
      };
      this.bestMatch.set(fallback);
      this.matchingList.set([]);
      this.isExactMatch.set(false);
    }
  }

  selectMatch(phrase: Phrase): void {
    this.bestMatch.set(phrase);
  }

  playAudio(text: string): void {
    this.audioService.speak(text);
  }

  isSaved(id: string): boolean {
    return this.phraseService.isPhraseSaved(id);
  }

  toggleSave(phrase: Phrase): void {
    this.phraseService.toggleSavePhrase(phrase.id);
  }

  toggleListening(): void {
    if (this.isListening()) {
      this.isListening.set(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        this.isListening.set(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.inputText = transcript;
          this.isListening.set(false);
          this.findMatchingPhrases();
        };

        recognition.onerror = () => { this.isListening.set(false); };
        recognition.onend = () => { this.isListening.set(false); };
        recognition.start();
      } catch {
        this.simulateVoice();
      }
    } else {
      this.simulateVoice();
    }
  }

  private simulateVoice(): void {
    this.isListening.set(true);
    setTimeout(() => {
      this.inputText = 'How much for one coffee?';
      this.isListening.set(false);
      this.findMatchingPhrases();
    }, 1200);
  }
}
