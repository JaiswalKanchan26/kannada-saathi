import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { PhraseService } from '../../core/services/phrase.service';
import { AudioService } from '../../core/services/audio.service';
import { ActivityService } from '../../core/services/activity.service';
import { TranslationService } from '../../core/services/translation.service';
import { Phrase } from '../../core/models/models';

export type ConversationTab = 'livetalk' | 'phrase';
export type SituationType = 'Auto' | 'Cafe' | 'Shop' | 'Hotel';

export interface LiveTalkMessage {
  id: string;
  sender: 'you' | 'local';
  english: string;
  kannada: string;
  transliteration?: string;
  timestamp: Date;
}

export interface SuggestedReply {
  english: string;
  kannada: string;
  transliteration: string;
}

export interface LocalPreset {
  kannada: string;
  english: string;
  transliteration: string;
}

interface QuickScenario {
  label: string;
  icon: string;
  query: string;
  tipText: string;
}

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [FormsModule, BottomNavComponent],
  template: `
    <div class="conv-viewport" role="main">
      <!-- Uniform Emerald Header matching Home Screen -->
      <header class="conv-header">
        <div class="header-top-row">
          <button class="header-back-btn" (click)="goBack()" aria-label="Go back to home" id="btn-conv-back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 class="header-title">Quick Conversation</h1>
        </div>

        <!-- Phrase | Live Talk Switcher Toggle -->
        <div class="mode-toggle-wrap">
          <div class="mode-toggle" role="tablist" aria-label="Conversation mode">
            <button
              class="mode-btn"
              [class.active]="activeTab() === 'phrase'"
              (click)="setTab('phrase')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'phrase'"
              id="tab-btn-phrase"
            >
              Phrase
            </button>
            <button
              class="mode-btn"
              [class.active]="activeTab() === 'livetalk'"
              (click)="setTab('livetalk')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'livetalk'"
              id="tab-btn-livetalk"
            >
              Live Talk
            </button>
          </div>
        </div>
      </header>

      <!-- ======================================================== -->
      <!-- TAB 1: LIVE TALK MODE                                    -->
      <!-- ======================================================== -->
      @if (activeTab() === 'livetalk') {
        <div class="livetalk-container">

          <!-- SCREEN 1: START (when no messages yet) -->
          @if (messages().length === 0) {
            <div class="start-scroll animate-fade-in">
              <div class="start-header-text">
                <h2 class="start-title">Talk to anyone in Kannada</h2>
                <p class="start-sub">We translate both ways, out loud.</p>
              </div>

              <!-- 3 Numbered Steps -->
              <div class="steps-list">
                <!-- Step 1 -->
                <div class="step-card" id="step-card-1">
                  <div class="step-badge">1</div>
                  <div class="step-info">
                    <h3 class="step-title">Tap "You speak"</h3>
                    <p class="step-desc">Say it in English. We play it in Kannada.</p>
                  </div>
                </div>

                <!-- Step 2 -->
                <div class="step-card" id="step-card-2">
                  <div class="step-badge">2</div>
                  <div class="step-info">
                    <h3 class="step-title">Hand over the phone</h3>
                    <p class="step-desc">The local taps "Local speaks" and replies.</p>
                  </div>
                </div>

                <!-- Step 3 -->
                <div class="step-card" id="step-card-3">
                  <div class="step-badge">3</div>
                  <div class="step-info">
                    <h3 class="step-title">Read the reply in English</h3>
                    <p class="step-desc">Suggested answers appear for you.</p>
                  </div>
                </div>
              </div>

              <!-- Situation Chips -->
              <div class="situation-section">
                <label class="situation-label">Where are you?</label>
                <div class="situation-chips" role="radiogroup" aria-label="Select your location or situation">
                  @for (sit of situationList; track sit) {
                    <button
                      class="sit-pill"
                      [class.active]="selectedSituation() === sit"
                      (click)="setSituation(sit)"
                      role="radio"
                      [attr.aria-checked]="selectedSituation() === sit"
                      [id]="'sit-chip-' + sit.toLowerCase()"
                    >
                      {{ sit }}
                    </button>
                  }
                </div>
              </div>

              <!-- Quick starter suggestion prompts -->
              <div class="starter-prompts-section">
                <label class="situation-label">Quick start for {{ selectedSituation() }}:</label>
                <div class="starter-cards">
                  @for (starter of currentStarters(); track starter.english) {
                    <button class="starter-btn" (click)="sendYourMessage(starter.english, starter.kannada, starter.transliteration)">
                      <div class="starter-kn font-kannada">{{ starter.kannada }}</div>
                      <div class="starter-en">{{ starter.english }}</div>
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- SCREEN 2: CONVERSATION (when messages exist) -->
          @if (messages().length > 0) {
            <div class="conv-messages-area animate-fade-in" #messagesArea>
              <div class="conv-controls-bar">
                <span class="active-sit-tag">{{ selectedSituation() }} Conversation</span>
                <button class="restart-conv-btn" (click)="clearConversation()" id="btn-restart-conv" aria-label="Start new conversation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  New Talk
                </button>
              </div>

              <div class="messages-list">
                @for (msg of messages(); track msg.id) {
                  <!-- YOU MESSAGE (Emerald Green Bubble) -->
                  <!-- You speak English → translated to Kannada → played aloud to local -->
                  @if (msg.sender === 'you') {
                    <div class="msg-bubble you-bubble animate-slide-up" [id]="'msg-' + msg.id">
                      <div class="bubble-sender-row">
                        <span class="bubble-sender-you">You said</span>
                        <span class="bubble-lang-tag">EN → ಕನ್ನಡ</span>
                      </div>
                      <!-- Big Kannada: what local sees/hears -->
                      <div class="bubble-kn font-kannada">{{ msg.kannada }}</div>
                      @if (msg.transliteration) {
                        <div class="bubble-tr">{{ msg.transliteration }}</div>
                      }
                      <!-- Small English: your original words -->
                      <div class="bubble-en-small">Your words: "{{ msg.english }}"</div>
                      <button
                        class="play-again-btn"
                        [class.speaking]="playingMessageId() === msg.id"
                        (click)="playAudio(msg.kannada, msg.id)"
                        [id]="'btn-play-' + msg.id"
                        aria-label="Play again"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        </svg>
                        <span>{{ playingMessageId() === msg.id ? 'Playing...' : 'Play Kannada again' }}</span>
                      </button>
                    </div>
                  }

                  <!-- LOCAL MESSAGE (White Bubble) -->
                  <!-- Local speaks Kannada → translated to English → tourist reads it -->
                  @if (msg.sender === 'local') {
                    <div class="msg-bubble local-bubble animate-slide-up" [id]="'msg-' + msg.id">
                      <div class="bubble-sender-row">
                        <span class="bubble-sender-local">Local said</span>
                        <span class="bubble-lang-tag-local">ಕನ್ನಡ → EN</span>
                      </div>
                      <!-- Big English: what tourist understands -->
                      <div class="local-en">{{ msg.english }}</div>
                      <!-- Small Kannada: what local actually said -->
                      <div class="local-kn font-kannada">ಅವರು ಹೇಳಿದ್ದು: "{{ msg.kannada }}"</div>
                    </div>
                  }
                }
              </div>

              <!-- Suggested replies section (Dynamically contextual + customizable) -->
              <div class="suggested-replies-wrap">
                <div class="suggested-header-row">
                  <div class="suggested-label">YOU CAN REPLY</div>
                  <span class="suggested-hint">Tap to reply or speak your own</span>
                </div>

                <div class="suggested-list">
                  @for (reply of dynamicSuggestedReplies(); track reply.english) {
                    <button
                      class="suggested-btn"
                      (click)="sendYourMessage(reply.english, reply.kannada, reply.transliteration)"
                      [id]="'reply-btn-' + reply.english.toLowerCase().replace(' ', '-')"
                    >
                      <span class="suggested-btn-en">{{ reply.english }}</span>
                      <span class="suggested-btn-kn font-kannada">{{ reply.kannada }}</span>
                    </button>
                  }
                </div>

                <!-- Custom inline reply box so replies are NEVER limited to hardcoded text -->
                <div class="custom-reply-box">
                  <input
                    type="text"
                    class="custom-reply-input"
                    [(ngModel)]="customReplyText"
                    placeholder="Or type anything you want to say in English..."
                    (keyup.enter)="sendCustomReply()"
                    id="input-custom-reply"
                  />
                  <button class="custom-reply-send" [disabled]="!customReplyText.trim()" (click)="sendCustomReply()">
                    Send
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- FIXED BOTTOM BAR WITH TWO 76px LABELLED MICS -->
          <footer class="dual-mic-bar">
            <!-- You speak (English) - Solid Emerald Green -->
            <button
              class="mic-btn you-mic-btn"
              (click)="openYouSpeakModal()"
              id="btn-you-speak"
              aria-label="You speak in English"
            >
              <svg class="mic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span class="mic-btn-main">You speak</span>
              <span class="mic-btn-sub">English</span>
            </button>

            <!-- Local speaks (Kannada) - Outlined Emerald Green -->
            <button
              class="mic-btn local-mic-btn"
              (click)="openLocalSpeakingScreen()"
              id="btn-local-speaks"
              aria-label="Local speaks in Kannada"
            >
              <svg class="mic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span class="mic-btn-main">Local speaks</span>
              <span class="mic-btn-sub">Kannada</span>
            </button>
          </footer>
        </div>

        <!-- ======================================================== -->
        <!-- SCREEN 3: LOCAL SPEAKING (CLEAN WHITE FULLSCREEN)        -->
        <!-- ======================================================== -->
        @if (isLocalSpeaking()) {
          <div class="local-speaking-overlay animate-fade-in" role="dialog" aria-modal="true" aria-label="Local speaking modal">
            <div class="ls-header">
              <button class="ls-close-btn" (click)="closeLocalSpeaking()" id="btn-ls-close" aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <span class="ls-header-title">Kannada → English</span>
              <div style="width: 40px"></div>
            </div>

            <!-- Big Friendly Greeting in Kannada -->
            <div class="ls-greeting font-kannada">
              ನಮಸ್ಕಾರ, ಸ್ವಲ್ಪ ಹೇಳಿ
            </div>
            <div class="ls-greeting-sub">"Hello, please speak"</div>

            <!-- Animated Mic Centerpiece with Kannada Saathi Emerald theme -->
            <div class="ls-mic-center">
              <div class="pulse-ring-outer" [class.animating]="isListeningLocal()"></div>
              <div class="pulse-ring-inner" [class.animating]="isListeningLocal()"></div>
              <div class="ls-mic-circle" (click)="toggleLocalMic()">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>

              <div class="ls-status-title">{{ isListeningLocal() ? 'Listening...' : 'Tap mic to speak' }}</div>
              <div class="ls-status-kn font-kannada">ಮಾತನಾಡಿ</div>
              <div class="ls-status-hint">Speak in Kannada</div>
            </div>

            <!-- Local Quick Presets (1-tap testing & fallback) -->
            <div class="ls-presets-box">
              <span class="ls-presets-label">Common replies for {{ selectedSituation() }}:</span>
              <div class="ls-chips-row">
                @for (preset of currentLocalPresets(); track preset.kannada) {
                  <button class="ls-preset-chip" (click)="submitLocalReply(preset.kannada, preset.english, preset.transliteration)">
                    <span class="font-kannada">{{ preset.kannada }}</span>
                    <span class="chip-en">({{ preset.english }})</span>
                  </button>
                }
              </div>
            </div>

            <!-- Done Button -->
            <button class="ls-done-btn" (click)="finishLocalSpeaking()" id="btn-ls-done">
              Done
            </button>
          </div>
        }

        <!-- ======================================================== -->
        <!-- YOU SPEAK INPUT / VOICE MODAL                            -->
        <!-- ======================================================== -->
        @if (isYouSpeakModalOpen()) {
          <div class="you-speak-overlay animate-fade-in" role="dialog" aria-modal="true">
            <div class="you-speak-card animate-slide-up">
              <div class="ys-header">
                <span class="ys-title">Speak in English</span>
                <button class="ys-close-btn" (click)="closeYouSpeakModal()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <!-- Input text row -->
              <div class="ys-input-wrap">
                <input
                  type="text"
                  class="ys-input"
                  [(ngModel)]="youInputText"
                  placeholder="e.g. Please go by meter"
                  (keyup.enter)="submitYouCustomText()"
                  autofocus
                  id="input-you-speak"
                />
                @if (youInputText) {
                  <button class="ys-clear-btn" (click)="youInputText = ''">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                }
              </div>

              <!-- Voice Recognition Button -->
              <button class="ys-mic-btn" [class.listening]="isListeningYou()" (click)="toggleYouVoice()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <span>{{ isListeningYou() ? 'Listening... Speak now' : 'Tap to speak English' }}</span>
              </button>

              <!-- Quick situation phrases -->
              <div class="ys-quick-phrases">
                <div class="ys-quick-label">Or choose one:</div>
                <div class="ys-quick-list">
                  @for (starter of currentStarters(); track starter.english) {
                    <button class="ys-quick-item" (click)="sendYourMessage(starter.english, starter.kannada, starter.transliteration); closeYouSpeakModal()">
                      <span class="item-en">{{ starter.english }}</span>
                      <span class="item-kn font-kannada">{{ starter.kannada }}</span>
                    </button>
                  }
                </div>
              </div>

              <button class="ys-send-btn" [disabled]="!youInputText.trim()" (click)="submitYouCustomText()">
                Translate & Speak out loud
              </button>
            </div>
          </div>
        }
      }

      <!-- ======================================================== -->
      <!-- TAB 2: ORIGINAL PHRASE SEARCH / PHRASEBOOK MODE          -->
      <!-- ======================================================== -->
      @if (activeTab() === 'phrase') {
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

            <div class="input-actions-row">
              <button
                class="speak-btn"
                [class.listening]="isListeningPhrase()"
                (click)="toggleListeningPhrase()"
                id="btn-speak-phrase"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <span>{{ isListeningPhrase() ? 'Listening...' : 'Speak' }}</span>
              </button>

              <button class="find-btn" (click)="findMatchingPhrases()" id="btn-find-phrase">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
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
              <div class="result-header-row">
                <div class="match-badge-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Best phrase match</span>
                </div>
                <button class="show-to-btn" (click)="showFullscreen.set(true)" id="btn-show-to-someone">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                  <span>Show to someone</span>
                </button>
              </div>

              <div class="result-kn font-kannada">{{ bestMatch()!.kannada }}</div>
              <div class="result-tr">{{ bestMatch()!.transliteration }}</div>
              <div class="result-en">{{ bestMatch()!.english }}</div>

              <div class="result-actions">
                <button class="listen-action-btn" (click)="playAudio(bestMatch()!.kannada)" id="btn-listen-result">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  <span>Listen</span>
                </button>
                <button class="save-action-btn" [class.saved]="isSaved(bestMatch()!.id)" (click)="toggleSave(bestMatch()!)" id="btn-save-result">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span>{{ isSaved(bestMatch()!.id) ? 'Saved' : 'Save' }}</span>
                </button>
              </div>
            </div>
          }

          <!-- Contextual Local Tip Card -->
          <div class="tip-card">
            <div class="tip-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="tip-text-col">
              <span class="tip-label">Local tip</span>
              <span class="tip-body">{{ activeTip() }}</span>
            </div>
          </div>
        </div>

        <app-bottom-nav />

        <!-- Fullscreen "Show this to the other person" Modal -->
        @if (showFullscreen() && bestMatch()) {
          <div class="show-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
            <div class="show-modal-top">
              <span style="font-weight:700">Show to the other person</span>
              <button class="show-close-btn" (click)="showFullscreen.set(false)" id="btn-close-show-modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="show-content">
              <div class="show-kn font-kannada">{{ bestMatch()!.kannada }}</div>
              <div class="show-tr">{{ bestMatch()!.transliteration }}</div>
              <div class="show-en">{{ bestMatch()!.english }}</div>
            </div>
            <div class="show-float-bar">
              <button class="float-action-btn" (click)="playAudio(bestMatch()!.kannada)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>Listen</span>
              </button>
              <button class="float-action-btn" (click)="showFullscreen.set(false)">Close</button>
            </div>
          </div>
        }
      }
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

    .conv-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F8F9FA;
      position: relative;
    }

    /* Uniform Emerald Header matching Home Screen */
    .conv-header {
      flex-shrink: 0;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 0.85rem 1rem 0.95rem;
      z-index: 10;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.15);
    }

    .header-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .header-back-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .header-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      flex: 1;
      text-align: left;
    }

    .offline-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      white-space: nowrap;
    }

    /* Mode switcher toggle */
    .mode-toggle-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .mode-toggle {
      display: flex;
      background: rgba(0, 0, 0, 0.2);
      padding: 3px;
      border-radius: 9999px;
      width: 100%;
      max-width: 340px;
    }

    .mode-btn {
      flex: 1;
      padding: 0.45rem 1rem;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .mode-btn.active {
      background: #FFFFFF;
      color: var(--color-primary, #176B57);
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    }

    /* Live Talk layout */
    .livetalk-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    /* Start screen */
    .start-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 1.1rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .start-header-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .start-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .start-sub {
      font-size: 0.9rem;
      color: #4B5563;
      margin: 0;
    }

    /* 3 Step Cards */
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .step-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 0.9rem 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .step-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 0.85rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .step-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .step-desc {
      font-size: 0.82rem;
      color: #6B7280;
      margin: 0;
    }

    /* Situation chips */
    .situation-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .situation-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #374151;
    }

    .situation-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .sit-pill {
      padding: 0.45rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 600;
      border: 1px solid #D1D5DB;
      background: #FFFFFF;
      color: #374151;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sit-pill.active {
      background: var(--color-primary, #176B57);
      border-color: var(--color-primary, #176B57);
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(23, 107, 87, 0.25);
    }

    /* Starter prompt cards */
    .starter-prompts-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .starter-cards {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .starter-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s ease;
    }

    .starter-btn:hover {
      background: #F0FAF6;
      border-color: #A7F3D0;
    }

    .starter-kn {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-primary, #176B57);
    }

    .starter-en {
      font-size: 0.82rem;
      color: #4B5563;
      margin-top: 2px;
    }

    /* Dual mic bar - 76px tall targets */
    .dual-mic-bar {
      flex-shrink: 0;
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 1rem 1rem;
      background: #FFFFFF;
      border-top: 1px solid #E5E7EB;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
      z-index: 10;
    }

    .mic-btn {
      height: 76px;
      flex: 1;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }

    .you-mic-btn {
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25);
    }

    .you-mic-btn:active {
      transform: scale(0.98);
      background: #0f4f40;
    }

    .local-mic-btn {
      background: #FFFFFF;
      color: var(--color-primary, #176B57);
      border: 2px solid var(--color-primary, #176B57);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .local-mic-btn:active {
      transform: scale(0.98);
      background: #F0FAF6;
    }

    .mic-svg {
      width: 22px;
      height: 22px;
      margin-bottom: 2px;
    }

    .mic-btn-main {
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .mic-btn-sub {
      font-size: 0.74rem;
      font-weight: 500;
      opacity: 0.85;
    }

    /* Conversation Area */
    .conv-messages-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 0.75rem 1rem;
    }

    .conv-controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .active-sit-tag {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-primary, #176B57);
      background: #E8F5E9;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
    }

    .restart-conv-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: 1px solid #D1D5DB;
      border-radius: 9999px;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #4B5563;
      cursor: pointer;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    /* Bubbles */
    .msg-bubble {
      border-radius: 18px;
      padding: 1.1rem;
      box-sizing: border-box;
      max-width: 100%;
    }

    /* YOU bubble: emerald green */
    .you-bubble {
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.2);
    }

    .bubble-sender-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .bubble-sender-you {
      font-size: 0.72rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.75);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .bubble-lang-tag {
      font-size: 0.68rem;
      font-weight: 600;
      background: rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.9);
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.25);
    }

    /* Big Kannada in You-bubble: this is what the local reads/hears */
    .bubble-kn {
      font-size: 1.65rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.35;
      margin-bottom: 0.35rem;
    }

    .bubble-tr {
      font-size: 0.88rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 0.55rem;
    }

    /* Small English in You-bubble: your original words reference */
    .bubble-en-small {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 0.6rem;
      font-style: italic;
    }

    .play-again-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .play-again-btn:active {
      background: rgba(255, 255, 255, 0.28);
    }

    .play-again-btn.speaking {
      background: rgba(255, 255, 255, 0.35) !important;
      border-color: #FFFFFF !important;
      animation: speaking-pulse 1.3s ease-in-out infinite;
    }

    /* LOCAL bubble: clean white */
    .local-bubble {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .bubble-sender-local {
      font-size: 0.72rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .bubble-lang-tag-local {
      font-size: 0.68rem;
      font-weight: 600;
      background: #F0FAF6;
      color: var(--color-primary, #176B57);
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid #D9F2E8;
    }

    /* Big English in Local-bubble: what tourist understands */
    .local-en {
      font-size: 1.35rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.45rem;
      line-height: 1.3;
    }

    /* Small Kannada in Local-bubble: what local actually said */
    .local-kn {
      font-size: 0.88rem;
      color: #6B7280;
      font-style: italic;
    }

    .local-tr {
      font-size: 0.82rem;
      color: #6B7280;
      font-style: italic;
    }

    /* Suggested Replies Section */
    .suggested-replies-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
    }

    .suggested-header-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .suggested-label {
      font-size: 0.74rem;
      font-weight: 700;
      color: #6B7280;
      letter-spacing: 0.05em;
    }

    .suggested-hint {
      font-size: 0.72rem;
      color: #9CA3AF;
    }

    .suggested-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .suggested-btn {
      min-height: 52px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 14px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      text-align: left;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: all 0.15s ease;
    }

    .suggested-btn:active {
      background: #F0FAF6;
      border-color: #86EFAC;
    }

    .suggested-btn-en {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
    }

    .suggested-btn-kn {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-primary, #176B57);
    }

    /* Custom inline reply box */
    .custom-reply-box {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.4rem;
    }

    .custom-reply-input {
      flex: 1;
      height: 44px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      border-radius: 12px;
      padding: 0 0.85rem;
      font-size: 0.88rem;
      outline: none;
      color: #1F2937;
    }

    .custom-reply-input:focus {
      border-color: var(--color-primary, #176B57);
    }

    .custom-reply-send {
      height: 44px;
      padding: 0 1.1rem;
      border-radius: 12px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 0.88rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }

    .custom-reply-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ======================================================== */
    /* SCREEN 3: LOCAL SPEAKING OVERLAY                         */
    /* ======================================================== */
    .local-speaking-overlay {
      position: fixed;
      inset: 0;
      background: #FFFFFF;
      z-index: 999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.25rem 1.25rem 2rem;
      box-sizing: border-box;
    }

    .ls-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ls-close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #F3F4F6;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .ls-header-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #4B5563;
    }

    .ls-greeting {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--color-primary, #176B57);
      text-align: center;
      margin-top: 1rem;
      line-height: 1.25;
    }

    .ls-greeting-sub {
      font-size: 0.9rem;
      color: #6B7280;
      text-align: center;
      margin-top: 0.25rem;
    }

    .ls-mic-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 1.5rem 0;
    }

    .ls-mic-circle {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(23, 107, 87, 0.35);
      z-index: 2;
      transition: transform 0.15s ease;
    }

    .ls-mic-circle:active {
      transform: scale(0.94);
    }

    .pulse-ring-outer, .pulse-ring-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      pointer-events: none;
    }

    .pulse-ring-outer.animating {
      width: 180px;
      height: 180px;
      background: rgba(23, 107, 87, 0.12);
      animation: pulse-ring 2s infinite ease-out;
    }

    .pulse-ring-inner.animating {
      width: 140px;
      height: 140px;
      background: rgba(23, 107, 87, 0.2);
      animation: pulse-ring 2s infinite 0.4s ease-out;
    }

    @keyframes pulse-ring {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
    }

    .ls-status-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #111827;
      margin-top: 1.25rem;
    }

    .ls-status-kn {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-primary, #176B57);
      margin-top: 0.2rem;
    }

    .ls-status-hint {
      font-size: 0.85rem;
      color: #6B7280;
      margin-top: 0.2rem;
    }

    .ls-presets-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ls-presets-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #6B7280;
    }

    .ls-chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      max-height: 140px;
      overflow-y: auto;
    }

    .ls-preset-chip {
      padding: 0.5rem 0.85rem;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      font-size: 0.85rem;
      color: #1F2937;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .ls-preset-chip:active {
      background: #F0FAF6;
      border-color: var(--color-primary, #176B57);
      color: var(--color-primary, #176B57);
    }

    .chip-en {
      font-size: 0.75rem;
      color: #6B7280;
    }

    .ls-done-btn {
      height: 60px;
      width: 100%;
      border-radius: 16px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 1.1rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ls-done-btn:active {
      background: #0f4f40;
    }

    /* You speak input modal */
    .you-speak-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 998;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .you-speak-card {
      width: 100%;
      background: #FFFFFF;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      padding: 1.25rem 1.25rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 85dvh;
      overflow-y: auto;
    }

    .ys-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ys-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #111827;
    }

    .ys-close-btn {
      background: #F3F4F6;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .ys-input-wrap {
      display: flex;
      align-items: center;
      background: #F3F4F6;
      border: 1px solid #D1D5DB;
      border-radius: 12px;
      padding: 0 0.75rem;
    }

    .ys-input {
      flex: 1;
      height: 48px;
      border: none;
      background: transparent;
      font-size: 1rem;
      outline: none;
    }

    .ys-clear-btn {
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
    }

    .ys-mic-btn {
      height: 50px;
      border-radius: 12px;
      background: #F0FAF6;
      border: 1.5px solid #A7F3D0;
      color: var(--color-primary, #176B57);
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .ys-quick-phrases {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .ys-quick-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #6B7280;
    }

    .ys-quick-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      max-height: 180px;
      overflow-y: auto;
    }

    .ys-quick-item {
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-en {
      font-size: 0.88rem;
      font-weight: 600;
      color: #111827;
    }

    .item-kn {
      font-size: 0.88rem;
      color: var(--color-primary, #176B57);
    }

    .ys-send-btn {
      height: 52px;
      border-radius: 14px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 1rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }

    .ys-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Phrase mode styles */
    .conv-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .scenarios-row {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .scenario-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0.5rem 0.9rem;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      white-space: nowrap;
    }

    .scenario-chip.active {
      background: var(--color-primary, #176B57);
      border-color: var(--color-primary, #176B57);
      color: #FFFFFF;
    }

    .input-card {
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }

    .input-card-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #6B7280;
      letter-spacing: 0.05em;
    }

    .input-row {
      display: flex;
      align-items: center;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 0.25rem;
    }

    .phrase-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      color: #111827;
      background: transparent;
    }

    .clear-x-btn {
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
    }

    .input-actions-row {
      display: flex;
      gap: 0.5rem;
    }

    .speak-btn, .find-btn {
      flex: 1;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .speak-btn {
      background: #F0FAF6;
      color: var(--color-primary, #176B57);
      border: 1px solid #A7F3D0;
    }

    .find-btn {
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
    }

    /* Result Card */
    .result-card {
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }

    .result-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .match-badge-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary, #176B57);
      background: #F0FAF6;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }

    .show-to-btn {
      background: transparent;
      border: none;
      color: var(--color-primary, #176B57);
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .result-kn {
      font-size: 1.55rem;
      font-weight: 800;
      color: var(--color-primary, #176B57);
      line-height: 1.3;
    }

    .result-tr {
      font-size: 0.95rem;
      color: #4B5563;
      font-style: italic;
    }

    .result-en {
      font-size: 1.05rem;
      color: #111827;
      font-weight: 600;
    }

    .result-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
      border-top: 1px solid #F3F4F6;
      padding-top: 0.75rem;
    }

    .listen-action-btn, .save-action-btn {
      flex: 1;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
    }

    .listen-action-btn {
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      border: none;
    }

    .save-action-btn {
      background: #FFFFFF;
      color: #374151;
      border: 1px solid #D1D5DB;
    }

    .save-action-btn.saved {
      color: var(--color-primary, #176B57);
      border-color: var(--color-primary, #176B57);
      background: #F0FAF6;
    }

    .tip-card {
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      border-radius: 14px;
      padding: 0.85rem 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .tip-icon-box {
      color: #D97706;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .tip-text-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tip-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #92400E;
      text-transform: uppercase;
    }

    .tip-body {
      font-size: 0.85rem;
      color: #78350F;
      line-height: 1.4;
    }

    /* Fullscreen Modal */
    .show-modal-overlay {
      position: fixed;
      inset: 0;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      z-index: 999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 1.5rem;
    }

    .show-modal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .show-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #FFFFFF;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .show-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }

    .show-kn {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.25;
    }

    .show-tr {
      font-size: 1.2rem;
      opacity: 0.85;
      font-style: italic;
    }

    .show-en {
      font-size: 1.15rem;
      font-weight: 600;
    }

    .show-float-bar {
      display: flex;
      gap: 1rem;
    }

    .float-action-btn {
      flex: 1;
      height: 52px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .font-kannada {
      font-family: 'Noto Sans Kannada', system-ui, -apple-system, sans-serif;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    .animate-slide-up {
      animation: slideUp 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class ConversationComponent implements OnInit, OnDestroy {
  activeTab = signal<ConversationTab>('livetalk');

  situationList: SituationType[] = ['Auto', 'Cafe', 'Shop', 'Hotel'];
  selectedSituation = signal<SituationType>('Auto');

  messages = signal<LiveTalkMessage[]>([]);
  playingMessageId = signal<string | null>(null);

  isLocalSpeaking = signal<boolean>(false);
  isListeningLocal = signal<boolean>(false);

  isYouSpeakModalOpen = signal<boolean>(false);
  isListeningYou = signal<boolean>(false);
  youInputText = '';
  customReplyText = '';

  inputText = '';
  isListeningPhrase = signal<boolean>(false);
  bestMatch = signal<Phrase | null>(null);
  showFullscreen = signal<boolean>(false);
  selectedScenario = signal<string>('Auto');
  activeTip = signal<string>("You can say 'Meter haaki, please' when requesting an auto driver.");

  scenarios: QuickScenario[] = [
    { label: 'Auto', icon: 'auto', query: 'Go by meter', tipText: "You can also say 'Meter haaki, please' when asking an auto driver to use the meter." },
    { label: 'Hotel / Cafe', icon: 'hotel', query: 'coffee', tipText: "Saying 'Filter coffee kudisi' (give filter coffee) sounds more natural at local cafes." },
    { label: 'Shopping', icon: 'shopping', query: 'How much', tipText: "'Eshtu?' (how much?) is the quickest way to ask for a price anywhere in Karnataka." },
    { label: 'Directions', icon: 'map', query: 'Where is', tipText: "'Nayite' (straight), 'Balagake' (right), 'Edagake' (left) — the three words to navigate Karnataka!" },
  ];

  private nativeSpeechRecognition: any = null;
  private activeLocalRecognition: any = null;
  private activeYouRecognition: any = null;

  // Situational base content dictionary
  private situationData: Record<SituationType, {
    starters: SuggestedReply[];
    suggestedReplies: SuggestedReply[];
    localPresets: LocalPreset[];
  }> = {
    Auto: {
      starters: [
        { english: 'Please go by meter', kannada: 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ', transliteration: 'Dayavittu meter haaki' },
        { english: 'Go to Majestic', kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಗೆ ಹೋಗಿ', transliteration: 'Majestic ge hogi' },
        { english: 'How much?', kannada: 'ಎಷ್ಟು?', transliteration: 'Eshtu?' },
        { english: 'Stop here', kannada: 'ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ', transliteration: 'Ille nillisi' }
      ],
      suggestedReplies: [
        { english: 'Thank you', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavaada' },
        { english: 'Go to Majestic', kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಗೆ ಹೋಗಿ', transliteration: 'Majestic ge hogi' },
        { english: 'Please go by meter', kannada: 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ', transliteration: 'Dayavittu meter haaki' },
        { english: 'I will pay by UPI', kannada: 'ಯುಪಿಐ ಮಾಡ್ತೀನಿ', transliteration: 'UPI maadtheeni' },
        { english: 'Stop here', kannada: 'ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ', transliteration: 'Ille nillisi' }
      ],
      localPresets: [
        { kannada: 'ಸರಿ, ಕೂತ್ಕೊಳ್ಳಿ', english: 'Okay, get in.', transliteration: 'Sari, kootkolli' },
        { kannada: '100 ರೂಪಾಯಿ ಕೊಡಿ', english: 'Give 100 rupees.', transliteration: '100 roopayi kodi' },
        { kannada: 'ಎಲ್ಲಿಗೆ ಹೋಗ್ಬೇಕು?', english: 'Where do you want to go?', transliteration: 'Ellige hogbeku?' },
        { kannada: 'ಮೀಟರ್ ಬರಲ್ಲ ಸರ್', english: 'Meter won\'t come there sir.', transliteration: 'Meter baralla sir' },
        { kannada: 'ಆಯ್ತು', english: 'Done / Okay.', transliteration: 'Aaythu' }
      ]
    },
    Cafe: {
      starters: [
        { english: 'One filter coffee please', kannada: 'ಒಂದು ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ', transliteration: 'Ondu filter coffee kodi' },
        { english: 'No sugar', kannada: 'ಸಕ್ಕರೆ ಬೇಡ', transliteration: 'Sakkare beda' },
        { english: 'Two masala dosas', kannada: 'ಎರಡು ಮಸಾಲ ದೋಸೆ ಕೊಡಿ', transliteration: 'Eradu masala dose kodi' },
        { english: 'Bill please', kannada: 'ಬಿಲ್ ಕೊಡಿ', transliteration: 'Bill kodi' }
      ],
      suggestedReplies: [
        { english: 'Thank you', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavaada' },
        { english: 'No sugar please', kannada: 'ಸಕ್ಕರೆ ಬೇಡ', transliteration: 'Sakkare beda' },
        { english: 'I will pay by UPI', kannada: 'ಗೂಗಲ್ ಪೇ ಮಾಡ್ತೀನಿ', transliteration: 'Google Pay maadtheeni' },
        { english: 'Bill please', kannada: 'ಬಿಲ್ ಕೊಡಿ', transliteration: 'Bill kodi' },
        { english: 'Drinking water please', kannada: 'ಕುಡಿಯುವ ನೀರು ಕೊಡಿ', transliteration: 'Kudiyuva neeru kodi' }
      ],
      localPresets: [
        { kannada: 'ಹತ್ತು ನಿಮಿಷ ಆಗುತ್ತೆ, ಕೂತ್ಕೊಳ್ಳಿ', english: 'Takes 10 mins, please sit.', transliteration: 'Hatthu nimisha aagutthe, kootkolli' },
        { kannada: 'ಕ್ಯಾಶ್ ಅಥವಾ ಕ್ಯೂಆರ್ ಕೋಡ್?', english: 'Cash or QR code scanner?', transliteration: 'Cash athava QR code?' },
        { kannada: 'ದೋಸೆ ಖಾಲಿಯಾಗಿದೆ, ಇಡ್ಲಿ ಇದೆ', english: 'Dosa finished, idli is there.', transliteration: 'Dose khaaliyaagide, idli ide' },
        { kannada: 'ಇನ್ನೇನಾದ್ರೂ ಬೇಕಾ?', english: 'Need anything else?', transliteration: 'Innenadru beka?' }
      ]
    },
    Shop: {
      starters: [
        { english: 'How much per kilo?', kannada: 'ಕೆಜಿಗೆ ಎಷ್ಟು?', transliteration: 'Kejige eshtu?' },
        { english: 'Give a bag', kannada: 'ಒಂದು ಬ್ಯಾಗ್ ಕೊಡಿ', transliteration: 'Ondu bag kodi' },
        { english: 'Too expensive, reduce a bit', kannada: 'ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ', transliteration: 'Svalpa kammi maadi' },
        { english: 'Do you have UPI QR code?', kannada: 'QR ಕೋಡ್ ಇದೆಯಾ?', transliteration: 'QR code ideya?' }
      ],
      suggestedReplies: [
        { english: 'Thank you', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavaada' },
        { english: 'Give one kilo', kannada: 'ಒಂದು ಕೆಜಿ ಕೊಡಿ', transliteration: 'Ondu kg kodi' },
        { english: 'I will scan QR code', kannada: 'ಸ್ಕ್ಯಾನ್ ಮಾಡ್ತೀನಿ', transliteration: 'Scan maadtheeni' },
        { english: 'Give exact change', kannada: 'ಚಿಲ್ಲರೆ ಕೊಡಿ', transliteration: 'Chillare kodi' }
      ],
      localPresets: [
        { kannada: 'ಐವತ್ತು ರೂಪಾಯಿ ಮಾತ್ರ', english: 'Fifty rupees only.', transliteration: 'Aivathu roopayi maathra' },
        { kannada: 'ಫಿಕ್ಸ್ ರೇಟ್ ಸರ್, ಕಮ್ಮಿ ಆಗಲ್ಲ', english: 'Fixed rate, cannot reduce.', transliteration: 'Fixed rate sir, kammi aagalla' },
        { kannada: 'ಗೂಗಲ್ ಪೇ ಇಲ್ಲಿದೆ', english: 'Google Pay QR is here.', transliteration: 'Google Pay illide' },
        { kannada: 'ಚಿಲ್ಲರೆ ಕೊಡಿ', english: 'Please give exact change.', transliteration: 'Chillare kodi' }
      ]
    },
    Hotel: {
      starters: [
        { english: 'Table for two please', kannada: 'ಇಬ್ಬರಿಗೆ ಜಾಗ ಇದೆಯಾ?', transliteration: 'Ibbarige jaaga ideya?' },
        { english: 'What is today\'s special?', kannada: 'ಇವತ್ತು ಸ್ಪೆಷಲ್ ಏನು?', transliteration: 'Ivatthu special enu?' },
        { english: 'Make it less spicy', kannada: 'ಖಾರ ಕಮ್ಮಿ ಮಾಡಿ', transliteration: 'Khaara kammi maadi' },
        { english: 'Bring the bill', kannada: 'ಬಿಲ್ ತನ್ನಿ', transliteration: 'Bill thanni' }
      ],
      suggestedReplies: [
        { english: 'Thank you', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavaada' },
        { english: 'Water please', kannada: 'ನೀರು ಕೊಡಿ', transliteration: 'Neeru kodi' },
        { english: 'Bill please', kannada: 'ಬಿಲ್ ತನ್ನಿ', transliteration: 'Bill thanni' },
        { english: 'Is takeaway available?', kannada: 'ಪಾರ್ಸಲ್ ಕೊಡಿ', transliteration: 'Parcel kodi' }
      ],
      localPresets: [
        { kannada: 'ಎಸಿ ಅಥವಾ ನಾನ್-ಎಸಿ?', english: 'AC or non-AC?', transliteration: 'AC athava non-AC?' },
        { kannada: 'ಐದು ನಿಮಿಷ ವೇಟ್ ಮಾಡಿ', english: 'Please wait 5 minutes.', transliteration: 'Aidu nimisha wait maadi' },
        { kannada: 'ಸೌತ್ ಇಂಡಿಯನ್ ಊಟ ರೆಡಿ ಇದೆ', english: 'South Indian meals is ready.', transliteration: 'South Indian oota ready ide' },
        { kannada: 'ಹಾ ಬನ್ನಿ, ಕೂತ್ಕೊಳ್ಳಿ', english: 'Yes come in, please sit.', transliteration: 'Haa banni, kootkolli' }
      ]
    }
  };

  constructor(
    private phraseService: PhraseService,
    private audioService: AudioService,
    private activityService: ActivityService,
    private translationService: TranslationService,
    private router: Router
  ) {
    this.initNativeSpeechRecognition();
  }

  private async initNativeSpeechRecognition(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      this.nativeSpeechRecognition = SpeechRecognition;
    } catch (e) {
      console.warn('Native SpeechRecognition plugin not available:', e);
    }
  }

  ngOnInit(): void {
    this.inputText = 'Go by meter';
    this.findMatchingPhrases();
  }

  ngOnDestroy(): void {
    this.stopAllListening();
  }

  private stopAllListening(): void {
    if (this.activeLocalRecognition) {
      try { this.activeLocalRecognition.abort(); } catch {}
      this.activeLocalRecognition = null;
    }
    if (this.activeYouRecognition) {
      try { this.activeYouRecognition.abort(); } catch {}
      this.activeYouRecognition = null;
    }
    this.isListeningLocal.set(false);
    this.isListeningYou.set(false);
    this.isListeningPhrase.set(false);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  setTab(tab: ConversationTab): void {
    this.activeTab.set(tab);
  }

  setSituation(sit: SituationType): void {
    this.selectedSituation.set(sit);
  }

  currentStarters(): SuggestedReply[] {
    return this.situationData[this.selectedSituation()].starters;
  }

  currentLocalPresets(): LocalPreset[] {
    return this.situationData[this.selectedSituation()].localPresets;
  }

  /**
   * Dynamically generates suggested replies based on the latest message context
   * instead of relying solely on a static list!
   */
  dynamicSuggestedReplies(): SuggestedReply[] {
    const list = this.messages();
    if (list.length === 0) {
      return this.situationData[this.selectedSituation()].suggestedReplies;
    }

    const lastMsg = list[list.length - 1];
    const text = (lastMsg.english + ' ' + lastMsg.kannada).toLowerCase();

    // Contextual detection: Price / fare / meter
    if (text.includes('rupee') || text.includes('ರೂಪಾಯಿ') || text.includes('meter') || text.includes('ಮೀಟರ್') || text.includes('fare') || text.includes('cost')) {
      return [
        { english: 'I will pay by UPI', kannada: 'ಯುಪಿಐ ಮಾಡ್ತೀನಿ', transliteration: 'UPI maadtheeni' },
        { english: 'A bit high, reduce please', kannada: 'ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ', transliteration: 'Svalpa kammi maadi' },
        { english: 'Okay, agreed', kannada: 'ಸರಿ, ಆಯ್ತು', transliteration: 'Sari, aaythu' },
        { english: 'Here is the cash', kannada: 'ದುಡ್ಡು ತಗೊಳ್ಳಿ', transliteration: 'Duddu thagolli' }
      ];
    }

    // Contextual detection: Location / destination question
    if (text.includes('where') || text.includes('ಎಲ್ಲಿಗೆ') || text.includes('destination') || text.includes('place')) {
      return [
        { english: 'Go to Majestic', kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಗೆ ಹೋಗಿ', transliteration: 'Majestic ge hogi' },
        { english: 'Go to Indiranagar', kannada: 'ಇಂದಿರಾನಗರಕ್ಕೆ ಹೋಗಿ', transliteration: 'Indiranagar ge hogi' },
        { english: 'Go to Airport', kannada: 'ಏರ್‌ಪೋರ್ಟ್‌ಗೆ ಹೋಗಿ', transliteration: 'Airport ge hogi' },
        { english: 'Stop here', kannada: 'ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ', transliteration: 'Ille nillisi' }
      ];
    }

    // Contextual detection: Agreement / Confirmation ("Okay get in", "sit", etc.)
    if (text.includes('get in') || text.includes('sit') || text.includes('ಕೂತ್ಕೊಳ್ಳಿ') || text.includes('ಬನ್ನಿ')) {
      return [
        { english: 'Thank you', kannada: 'ಧನ್ಯವಾದ', transliteration: 'Dhanyavaada' },
        { english: 'Go to Majestic', kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಗೆ ಹೋಗಿ', transliteration: 'Majestic ge hogi' },
        { english: 'Please drive carefully', kannada: 'ನಿಧಾನವಾಗಿ ಹೋಗಿ', transliteration: 'Nidhanavagi hogi' },
        { english: 'I am in a hurry', kannada: 'ಸ್ವಲ್ಪ ಬೇಗ ಹೋಗಿ', transliteration: 'Svalpa bega hogi' }
      ];
    }

    // Default fallback to situational suggestions
    return this.situationData[this.selectedSituation()].suggestedReplies;
  }

  // ----------------------------------------------------
  // Live Talk Actions
  // ----------------------------------------------------
  sendYourMessage(english: string, kannada: string, transliteration?: string): void {
    const newMsg: LiveTalkMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sender: 'you',
      english,
      kannada,
      transliteration: transliteration || '',
      timestamp: new Date(),
    };

    this.messages.update(list => [...list, newMsg]);

    // Speak Kannada out loud
    this.audioService.speakKannada(kannada);

    this.activityService.log('translation', newMsg.id, `Live Talk: ${english}`);
  }

  async sendCustomReply(): Promise<void> {
    const text = this.customReplyText.trim();
    if (!text) return;

    this.customReplyText = '';

    // Check offline match first
    const offlineMatch = this.findOfflineMatch(text);
    if (offlineMatch) {
      this.sendYourMessage(offlineMatch.english, offlineMatch.kannada, offlineMatch.transliteration);
      return;
    }

    // Live translate dynamically
    try {
      const res = await this.translationService.translate(text);
      this.sendYourMessage(text, res.kannada, res.transliteration);
    } catch {
      this.sendYourMessage(text, text, '');
    }
  }

  async playAudio(kannada: string, msgId?: string): Promise<void> {
    if (!kannada) return;
    if (this.playingMessageId()) {
      this.audioService.stop();
      this.playingMessageId.set(null);
      return;
    }
    if (msgId) {
      this.playingMessageId.set(msgId);
    }
    try {
      await this.audioService.speakKannada(kannada);
    } catch {
      // Silently finish
    } finally {
      this.playingMessageId.set(null);
    }
  }

  clearConversation(): void {
    this.messages.set([]);
  }

  // ----------------------------------------------------
  // "You Speak" Handlers
  // ----------------------------------------------------
  openYouSpeakModal(): void {
    this.youInputText = '';
    this.isYouSpeakModalOpen.set(true);
    this.toggleYouVoice();
  }

  closeYouSpeakModal(): void {
    this.stopAllListening();
    this.isYouSpeakModalOpen.set(false);
  }

  toggleYouVoice(): void {
    if (this.isListeningYou()) {
      this.stopAllListening();
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;

        this.isListeningYou.set(true);
        this.activeYouRecognition = recognition;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.youInputText = transcript;
        };

        recognition.onerror = () => {
          this.isListeningYou.set(false);
        };

        recognition.onend = () => {
          this.isListeningYou.set(false);
          if (this.youInputText.trim()) {
            this.submitYouCustomText();
          }
        };

        recognition.start();
      } catch {
        this.isListeningYou.set(false);
      }
    } else {
      const starter = this.currentStarters()[0];
      this.youInputText = starter.english;
    }
  }

  async submitYouCustomText(): Promise<void> {
    const text = this.youInputText.trim();
    if (!text) return;

    this.closeYouSpeakModal();

    const offlineMatch = this.findOfflineMatch(text);
    if (offlineMatch) {
      this.sendYourMessage(offlineMatch.english, offlineMatch.kannada, offlineMatch.transliteration);
      return;
    }

    try {
      const res = await this.translationService.translate(text);
      this.sendYourMessage(text, res.kannada, res.transliteration);
    } catch {
      this.sendYourMessage(text, text, '');
    }
  }

  private findOfflineMatch(text: string): SuggestedReply | null {
    const q = text.toLowerCase();
    for (const sit of Object.values(this.situationData)) {
      for (const item of [...sit.starters, ...sit.suggestedReplies]) {
        if (item.english.toLowerCase().includes(q) || q.includes(item.english.toLowerCase())) {
          return item;
        }
      }
    }
    const phraseResults = this.phraseService.searchPhrases(text);
    if (phraseResults.length > 0) {
      return {
        english: phraseResults[0].english,
        kannada: phraseResults[0].kannada,
        transliteration: phraseResults[0].transliteration
      };
    }
    return null;
  }

  // ----------------------------------------------------
  // "Local Speaks" Screen Handlers
  // ----------------------------------------------------
  openLocalSpeakingScreen(): void {
    this.isLocalSpeaking.set(true);
    this.startLocalListening();
  }

  closeLocalSpeaking(): void {
    this.stopAllListening();
    this.isLocalSpeaking.set(false);
  }

  toggleLocalMic(): void {
    if (this.isListeningLocal()) {
      this.stopAllListening();
    } else {
      this.startLocalListening();
    }
  }

  startLocalListening(): void {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'kn-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        this.isListeningLocal.set(true);
        this.activeLocalRecognition = recognition;

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          this.handleSpokenKannada(spoken);
        };

        recognition.onerror = (e: any) => {
          console.warn('Kannada speech recognition note:', e);
          this.isListeningLocal.set(false);
        };

        recognition.onend = () => {
          this.isListeningLocal.set(false);
        };

        recognition.start();
      } catch {
        this.isListeningLocal.set(false);
      }
    } else {
      this.isListeningLocal.set(false);
    }
  }

  async handleSpokenKannada(kannadaText: string): Promise<void> {
    this.stopAllListening();

    const presets = this.currentLocalPresets();
    const match = presets.find(p => p.kannada.includes(kannadaText) || kannadaText.includes(p.kannada));

    if (match) {
      this.submitLocalReply(match.kannada, match.english, match.transliteration);
      return;
    }

    // Use translation service to translate Kannada → English
    try {
      const res = await this.translationService.translateToEnglish(kannadaText);
      const en = res.english && !this.translationService.isKannadaScript(res.english)
        ? res.english
        : this.translationService.transliterateKannada(kannadaText);
      this.submitLocalReply(kannadaText, en, res.transliteration);
    } catch {
      const translit = this.translationService.transliterateKannada(kannadaText);
      this.submitLocalReply(kannadaText, translit, translit);
    }
  }

  submitLocalReply(kannada: string, english: string, transliteration?: string): void {
    const newMsg: LiveTalkMessage = {
      id: 'local-' + Date.now(),
      sender: 'local',
      english,
      kannada,
      transliteration: transliteration || '',
      timestamp: new Date()
    };

    this.messages.update(list => [...list, newMsg]);
    this.closeLocalSpeaking();
  }

  finishLocalSpeaking(): void {
    if (this.messages().length === 0 || this.messages()[this.messages().length - 1].sender === 'you') {
      const p = this.currentLocalPresets()[0];
      this.submitLocalReply(p.kannada, p.english, p.transliteration);
    } else {
      this.closeLocalSpeaking();
    }
  }

  // ----------------------------------------------------
  // Phrase Mode Methods
  // ----------------------------------------------------
  selectScenario(s: QuickScenario): void {
    this.selectedScenario.set(s.label);
    this.inputText = s.query;
    this.activeTip.set(s.tipText);
    this.findMatchingPhrases();
  }

  clearInput(): void {
    this.inputText = '';
    this.bestMatch.set(null);
  }

  onInputChange(val: string): void {
    if (val && val.length > 1) {
      this.findMatchingPhrases();
    }
  }

  findMatchingPhrases(): void {
    if (!this.inputText.trim()) return;
    const results = this.phraseService.searchPhrases(this.inputText.trim());
    if (results.length > 0) {
      this.bestMatch.set(results[0]);
    }
  }

  toggleListeningPhrase(): void {
    if (this.isListeningPhrase()) {
      this.stopAllListening();
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'en-IN';
        this.isListeningPhrase.set(true);

        recognition.onresult = (event: any) => {
          this.inputText = event.results[0][0].transcript;
          this.findMatchingPhrases();
        };

        recognition.onend = () => {
          this.isListeningPhrase.set(false);
        };

        recognition.start();
      } catch {
        this.isListeningPhrase.set(false);
      }
    }
  }

  isSaved(phraseId: string): boolean {
    return this.phraseService.isSaved(phraseId);
  }

  toggleSave(phrase: Phrase): void {
    this.phraseService.toggleSave(phrase.id);
  }
}
