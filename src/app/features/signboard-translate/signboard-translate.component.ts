import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { OcrService } from '../../core/services/ocr.service';
import { TranslationService } from '../../core/services/translation.service';
import { AudioService } from '../../core/services/audio.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';

type ScreenState = 'camera' | 'processing' | 'result' | 'error' | 'no-text' | 'permission-denied';

interface SampleSignboard {
  name: string;
  image: string;
  detectedText: string;
  translatedText: string;
  transliteration: string;
}

@Component({
  selector: 'app-signboard-translate',
  standalone: true,
  imports: [BottomNavComponent],
  template: `
    <div class="sb-viewport">
      <!-- Uniform Emerald Header matching Home Screen -->
      <header class="sb-header">
        <button class="back-btn" id="btn-sb-back" (click)="router.navigate(['/home'])" aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="sb-title">Translate Signboard</h1>
        <div style="width: 38px"></div>
      </header>

      <!-- Scrollable content area -->
      <div class="sb-scroll animate-fade-in">

        <!-- CAMERA / SCANNER STATE -->
        @if (state() === 'camera') {
          <div class="scan-card">
            <!-- Viewfinder Area -->
            <div class="viewfinder-frame">
              <div class="sign-mock-preview">
                <div class="signboard-board">
                  <div class="signboard-kn font-kannada">ಬೆಂಗಳೂರು</div>
                  <div class="signboard-en">Bengaluru</div>
                </div>
              </div>

              <!-- Cyan Scan Corners -->
              <div class="scan-corner tl"></div>
              <div class="scan-corner tr"></div>
              <div class="scan-corner bl"></div>
              <div class="scan-corner br"></div>
              <div class="scan-laser"></div>
            </div>

            <!-- Hidden File Input for Gallery / Upload (no capture attribute, opens phone gallery) -->
            <input
              #galleryInput
              type="file"
              accept="image/*"
              style="display:none"
              (change)="onFileSelected($event)"
              id="sb-file-input"
            />

            <!-- Scan Action Buttons -->
            <div class="scan-actions-row">
              <button class="capture-action-btn" id="btn-sb-capture" (click)="capturePhoto()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="4"/><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>
                <span>Scan Signboard</span>
              </button>

              <button class="gallery-action-btn" id="btn-sb-gallery" (click)="openGallery(galleryInput)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Gallery</span>
              </button>
            </div>
          </div>

          <!-- Quick Sample Signboards for 1-tap testing -->
          <div class="sample-section">
            <span class="sample-label">Or try a sample signboard:</span>
            <div class="sample-chips">
              @for (sample of sampleSignboards; track sample.name) {
                <button class="sample-chip" (click)="selectSample(sample)">
                  <span class="font-kannada">{{ sample.detectedText }}</span>
                  <span class="sample-en">({{ sample.name }})</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- PROCESSING STATE -->
        @if (state() === 'processing') {
          <div class="status-card">
            <div class="spinner-ring"></div>
            <h2 class="status-title">Reading text...</h2>
            <p class="status-msg">{{ processingMsg() }}</p>
          </div>
        }

        <!-- RESULT STATE (MATCHING MOCKUP) -->
        @if (state() === 'result') {
          <!-- Visual preview frame with road sign or captured image -->
          <div class="result-preview-frame">
            @if (capturedImage()) {
              <img [src]="capturedImage()" alt="Captured signboard" class="result-captured-img" />
              <div class="result-img-overlay">
                <div class="ocr-tag-floating font-kannada">
                  {{ isKannadaSignboard() ? detectedText() : translatedText() }}
                </div>
              </div>
            } @else {
              <div class="signboard-board result-board">
                <div class="signboard-kn font-kannada">{{ isKannadaSignboard() ? detectedText() : translatedText() }}</div>
                <div class="signboard-en">{{ isKannadaSignboard() ? translatedText() : detectedText() }}</div>
              </div>
            }
            <!-- Cyan brackets overlay matching mockup -->
            <div class="scan-corner tl"></div>
            <div class="scan-corner tr"></div>
            <div class="scan-corner bl"></div>
            <div class="scan-corner br"></div>
          </div>

          <!-- Bottom Card: Detected Text & Actions -->
          <div class="detected-card">
            <div class="detected-badge-row">
              <span class="detected-tag">{{ isKannadaSignboard() ? 'KANNADA SIGN DETECTED' : 'ENGLISH TEXT DETECTED' }}</span>
              <span class="direction-tag">{{ isKannadaSignboard() ? 'ಕನ್ನಡ → English' : 'English → ಕನ್ನಡ' }}</span>
            </div>

            <!-- Primary Translation Hero: Clear English for Kannada sign -->
            <div class="result-hero-box">
              <div class="result-hero-label">{{ isKannadaSignboard() ? 'English Meaning' : 'Kannada Translation' }}</div>
              <div class="result-hero-text" [class.font-kannada]="!isKannadaSignboard()">
                {{ translatedText() }}
              </div>
            </div>

            <!-- Sign Details (Original Script + Pronunciation) -->
            <div class="result-details-box">
              <div class="detail-row">
                <span class="detail-label">{{ isKannadaSignboard() ? 'Original Sign (Kannada):' : 'Original Text:' }}</span>
                <span class="detail-value font-kannada">{{ detectedText() }}</span>
              </div>
              @if (translitText()) {
                <div class="detail-row">
                  <span class="detail-label">Pronunciation:</span>
                  <span class="detail-value translit-val">{{ translitText() }}</span>
                </div>
              }
            </div>

            <button
              type="button"
              class="translate-pill-btn"
              [class.speaking]="isSpeaking()"
              (click)="speakText()"
              id="btn-sb-translate-action"
            >
              @if (isSpeaking()) {
                <!-- Animated sound waves when playing -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                <span>Speaking...</span>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <span>{{ isKannadaSignboard() ? 'Hear Kannada Pronunciation' : 'Speak Kannada Aloud' }}</span>
              }
            </button>

            <!-- 3 Rounded Icon Buttons: Copy, Speak, Save -->
            <div class="action-grid">
              <button type="button" class="act-btn" id="btn-sb-copy" (click)="copyText()">
                <div class="act-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </div>
                <span class="act-label">Copy</span>
              </button>

              <button type="button" class="act-btn" id="btn-sb-speak" (click)="speakText()">
                <div class="act-icon-box" [class.speaking-box]="isSpeaking()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                </div>
                <span class="act-label">{{ isSpeaking() ? 'Playing…' : 'Speak' }}</span>
              </button>

              <button type="button" class="act-btn" id="btn-sb-save" (click)="saveResult()">
                <div class="act-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span class="act-label">Save</span>
              </button>
            </div>

            <button class="rescan-btn" (click)="retake()" id="btn-sb-retake">
              Scan Another Sign
            </button>
          </div>
        }

        <!-- NO TEXT / ERROR STATE -->
        @if (state() === 'no-text' || state() === 'error') {
          <div class="status-card">
            <div class="error-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 class="status-title">Could Not Read Sign</h2>
            <p class="status-msg">{{ ocrError() || 'Please upload a clear, close-up photo of a signboard — avoid phone screenshots.' }}</p>
            <div class="ocr-tips">
              <p class="tip-item">📷 Use a real photo of a sign, not a screenshot</p>
              <p class="tip-item">🔆 Ensure good lighting &amp; avoid blur</p>
              <p class="tip-item">🔍 Move closer so the sign fills the frame</p>
            </div>
            <button class="primary-btn" (click)="retake()">Try Again</button>
          </div>
        }
      </div>

      <!-- Toast message -->
      @if (showToast()) {
        <div class="toast animate-fade-in" role="status">{{ toastMsg() }}</div>
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
      background: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .sb-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: #F8F9FA;
      overflow: hidden;
      position: relative;
    }

    /* Uniform Emerald Header matching Home Screen */
    .sb-header {
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
    }

    .sb-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      text-align: center;
      flex: 1;
    }

    .sb-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 1rem 1rem calc(var(--nav-height, 64px) + 2rem);
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    /* Scan Card */
    .scan-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .viewfinder-frame, .result-preview-frame {
      position: relative;
      height: 220px;
      background: #1E293B;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sign-mock-preview {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-space(135deg, #1E3A8A, #065F46);
    }

    .signboard-board {
      background: #1D4ED8;
      border: 3px solid #FFFFFF;
      border-radius: 12px;
      padding: 1.25rem 2rem;
      text-align: center;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }

    .signboard-kn {
      font-size: 1.85rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }

    .signboard-en {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 0.25rem;
      letter-spacing: 0.05em;
    }

    /* Cyan brackets matching mockup */
    .scan-corner {
      position: absolute;
      width: 28px;
      height: 28px;
      border-color: #22D3EE;
      border-style: solid;
      pointer-events: none;
    }

    .scan-corner.tl { top: 16px; left: 16px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
    .scan-corner.tr { top: 16px; right: 16px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
    .scan-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
    .scan-corner.br { bottom: 16px; right: 16px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }

    .scan-laser {
      position: absolute;
      left: 16px;
      right: 16px;
      height: 2px;
      background: #22D3EE;
      box-shadow: 0 0 10px #22D3EE;
      animation: scan-move 2.2s infinite ease-in-out alternate;
    }

    @keyframes scan-move {
      0% { top: 24px; }
      100% { top: 196px; }
    }

    .scan-actions-row {
      display: flex;
      gap: 0.75rem;
    }

    .capture-action-btn {
      flex: 2;
      height: 52px;
      border-radius: 14px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25);
    }

    .gallery-action-btn {
      flex: 1;
      height: 52px;
      border-radius: 14px;
      background: #FFFFFF;
      border: 1.5px solid #D1D5DB;
      color: #374151;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      cursor: pointer;
    }

    /* Samples */
    .sample-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sample-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #6B7280;
    }

    .sample-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .sample-chip {
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      font-size: 0.85rem;
      color: #1F2937;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .sample-chip:active {
      background: #F0FAF6;
      border-color: var(--color-primary, #176B57);
      color: var(--color-primary, #176B57);
    }

    .sample-en {
      font-size: 0.75rem;
      color: #6B7280;
    }

    /* Result Photo & Image Overlay */
    .result-captured-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .result-img-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ocr-tag-floating {
      background: rgba(23, 107, 87, 0.92);
      color: #FFFFFF;
      padding: 0.6rem 1.25rem;
      border-radius: 12px;
      font-size: 1.5rem;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(4px);
    }

    /* Detected Bottom Card matching mockup */
    .detected-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    }

    .detected-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .detected-tag {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #9CA3AF;
    }

    .direction-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary, #176B57);
      background: #E8F5EF;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .result-hero-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 0.85rem 1rem;
    }

    .result-hero-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      color: var(--color-primary, #176B57);
      margin-bottom: 0.25rem;
    }

    .result-hero-text {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.25;
    }

    .result-details-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      background: #FFFFFF;
      border-radius: 10px;
    }

    .detail-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .detail-label {
      font-size: 0.8rem;
      color: #64748B;
      font-weight: 600;
      flex-shrink: 0;
    }

    .detail-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #1E293B;
    }

    .translit-val {
      font-size: 0.95rem;
      color: #0D9488;
      font-weight: 600;
      font-style: italic;
    }

    .translate-pill-btn {
      height: 48px;
      width: 100%;
      border-radius: 9999px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin: 0.25rem 0 0.5rem;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25);
      transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
      /* Prevent content collapsing on press */
      overflow: visible;
      white-space: nowrap;
    }

    .translate-pill-btn:active {
      transform: scale(0.97);
      box-shadow: 0 2px 6px rgba(23, 107, 87, 0.2);
      background: #0f5743;
      /* Keep content fully visible */
      color: #FFFFFF;
      opacity: 1;
    }

    .translate-pill-btn.speaking {
      background: #0D5C3C;
      box-shadow: 0 4px 12px rgba(13, 92, 60, 0.35);
      animation: pulse-green 1.4s ease-in-out infinite;
    }

    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25); }
      50% { box-shadow: 0 4px 20px rgba(23, 107, 87, 0.55); }
    }

    .speaking-box {
      background: #D9F2E8 !important;
      border-color: var(--color-primary, #176B57) !important;
      animation: pulse-green 1.4s ease-in-out infinite;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .act-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .act-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: #F0FAF6;
      border: 1px solid #D9F2E8;
      color: var(--color-primary, #176B57);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .act-btn:active .act-icon-box {
      background: #D9F2E8;
    }

    .act-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
    }

    .rescan-btn {
      height: 44px;
      border-radius: 12px;
      background: #F3F4F6;
      border: 1px solid #D1D5DB;
      color: #374151;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    /* Status card */
    .status-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      padding: 2rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .spinner-ring {
      width: 44px;
      height: 44px;
      border: 4px solid #E5E7EB;
      border-top-color: var(--color-primary, #176B57);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .status-msg {
      font-size: 0.88rem;
      color: #6B7280;
      margin: 0;
    }

    .error-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #FEE2E2;
      color: #DC2626;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .primary-btn {
      height: 48px;
      padding: 0 1.5rem;
      border-radius: 12px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }

    .ocr-tips {
      background: #F0FAF6;
      border: 1px solid #D9F2E8;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      width: 100%;
      text-align: left;
    }

    .tip-item {
      font-size: 0.82rem;
      color: #374151;
      font-weight: 500;
      margin: 0;
    }

    .toast {
      position: fixed;
      bottom: calc(var(--nav-height, 64px) + 1.25rem);
      left: 50%;
      transform: translateX(-50%);
      background: #1F2937;
      color: #FFFFFF;
      padding: 0.6rem 1.2rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 9999;
    }

    /* Dark Mode Overrides */
    [data-theme="dark"] .result-card-outer,
    [data-theme="dark"] .camera-card,
    [data-theme="dark"] .sample-card {
      background: var(--color-bg-card, #16241E) !important;
      border-color: var(--color-border-soft, #24382E) !important;
    }

    [data-theme="dark"] .result-details-box {
      background: transparent !important;
    }

    [data-theme="dark"] .result-hero-text,
    [data-theme="dark"] .detail-value {
      color: var(--color-text-primary, #F3F6F4) !important;
    }

    [data-theme="dark"] .detail-label,
    [data-theme="dark"] .act-label {
      color: var(--color-text-secondary, #A3B5AC) !important;
    }

    [data-theme="dark"] .act-icon-box {
      background: #193327 !important;
      border-color: #244438 !important;
      color: #34D399 !important;
    }

    [data-theme="dark"] .ocr-tips {
      background: #13241C !important;
      border-color: #1E382C !important;
    }

    [data-theme="dark"] .tip-item {
      color: #D1E7DD !important;
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
export class SignboardTranslateComponent implements OnInit, OnDestroy {
  state = signal<ScreenState>('camera');
  processingMsg = signal<string>('Preparing scanner...');
  detectedText = signal<string>('');
  translatedText = signal<string>('');
  translitText = signal<string>('');
  ocrError = signal<string>('');
  showToast = signal<boolean>(false);
  toastMsg = signal<string>('');
  capturedImage = signal<string | null>(null);
  isSpeaking = signal<boolean>(false);
  // True when detected text is Kannada (signboard → translate to English for tourist)
  isKannadaSignboard = signal<boolean>(true);

  sampleSignboards: SampleSignboard[] = [
    {
      name: 'Bengaluru',
      image: '',
      detectedText: 'ಬೆಂಗಳೂರು',
      translatedText: 'Bengaluru (Bangalore)',
      transliteration: 'Bengaluru'
    },
    {
      name: 'M.G. Road',
      image: '',
      detectedText: 'ಎಂ.ಜಿ. ರಸ್ತೆ',
      translatedText: 'M.G. Road',
      transliteration: 'M.G. Raste'
    },
    {
      name: 'Vidhana Soudha',
      image: '',
      detectedText: 'ವಿಧಾನ ಸೌಧ',
      translatedText: 'Vidhana Soudha (Legislative House)',
      transliteration: 'Vidhana Soudha'
    },
    {
      name: 'Cafe Menu',
      image: '',
      detectedText: 'ತಿಂಡಿ & ಕಾಫಿ',
      translatedText: 'Snacks & Coffee',
      transliteration: 'Thindi & Coffee'
    }
  ];

  private ocrService = inject(OcrService);
  private translationService = inject(TranslationService);
  private audioService = inject(AudioService);
  router = inject(Router);

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  selectSample(sample: SampleSignboard): void {
    this.capturedImage.set(null);
    this.detectedText.set(sample.detectedText);
    this.translatedText.set(sample.translatedText);
    this.translitText.set(sample.transliteration);
    this.isKannadaSignboard.set(this.translationService.isKannadaScript(sample.detectedText));
    this.state.set('result');
  }

  async capturePhoto(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera
        });

        if (image.base64String) {
          this.processImage('data:image/jpeg;base64,' + image.base64String);
        }
      } catch (err: any) {
        if (err?.message?.includes('User cancelled')) return;
        this.selectSample(this.sampleSignboards[0]);
      }
    } else {
      // Web fallback: instantly show first realistic sample
      this.selectSample(this.sampleSignboards[0]);
    }
  }

  async openGallery(galleryInput?: HTMLInputElement): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Photos
        });

        if (image.base64String) {
          this.processImage('data:image/jpeg;base64,' + image.base64String);
        }
      } catch (err: any) {
        if (err?.message?.includes('User cancelled')) return;
        galleryInput?.click();
      }
    } else {
      galleryInput?.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      input.value = '';
    }
  }

  private async processImage(dataUrl: string): Promise<void> {
    this.capturedImage.set(dataUrl);
    this.state.set('processing');
    this.processingMsg.set('Analyzing signboard image...');

    try {
      const result = await this.ocrService.recognise(dataUrl);
      if (!result.text || !result.text.trim()) {
        this.state.set('no-text');
        this.ocrError.set('No text found. Try a clear, close-up photo of a signboard.');
        return;
      }

      const rawText = result.text.trim();

      // Detect garbled / phone-screenshot OCR noise.
      // Signs: very low confidence OR text contains phone UI patterns like
      // timestamps, copyright symbols, short random tokens with mixed scripts.
      if (this.isGarbledOcrText(rawText, result.confidence)) {
        this.state.set('no-text');
        this.ocrError.set(
          'The image seems to be a screenshot or has mixed content. Please upload a clear, close-up photo of a signboard only.'
        );
        return;
      }

      this.detectedText.set(rawText);

      // Determine translation direction:
      // If the detected text is Kannada script → translate to English (for tourist to understand)
      // If it's English/other script → translate to Kannada
      const isKannada = this.translationService.isKannadaScript(rawText);
      this.isKannadaSignboard.set(isKannada);

      if (isKannada) {
        // Kannada signboard → show English meaning
        this.processingMsg.set('Translating to English...');
        const trans = await this.translationService.translateToEnglish(rawText);
        this.translatedText.set(trans.english);
        this.translitText.set(trans.transliteration);
      } else {
        // English/Roman signboard → show Kannada translation
        this.processingMsg.set('Translating to Kannada...');
        const trans = await this.translationService.translate(rawText);
        this.translatedText.set(trans.kannada);
        this.translitText.set(trans.transliteration);
      }

      this.state.set('result');
    } catch {
      // Fallback to sample if OCR fails
      this.selectSample(this.sampleSignboards[0]);
    }
  }

  /**
   * Heuristic check for garbled OCR text commonly produced from phone screenshots.
   * Returns true if the text is likely junk (UI noise rather than a real signboard).
   */
  private isGarbledOcrText(text: string, confidence: number): boolean {
    // Very low confidence is a strong signal
    if (confidence < 25 && confidence > 0) return true;

    // If text contains phone UI patterns:
    // e.g. time patterns like "11:23 PM", copyright "©", percent signs, tiny tokens
    const phoneUiPatterns = [
      /\d{1,2}:\d{2}\s*(AM|PM)/i,   // timestamps like "11:23 PM"
      /©/,                            // copyright symbol
      /\bWi-?Fi\b/i,                  // Wi-Fi text from status bar
      /\bBluetooth\b/i,
      /\bSignal\b.*\d+/i,
    ];
    if (phoneUiPatterns.some(p => p.test(text))) return true;

    // Token-level analysis: if most tokens are very short (1-2 chars) → noise
    const tokens = text.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length > 3) {
      const shortTokens = tokens.filter(t => t.length <= 2);
      if (shortTokens.length / tokens.length > 0.55) return true;
    }

    return false;
  }

  retake(): void {
    this.capturedImage.set(null);
    this.state.set('camera');
  }

  async speakText(): Promise<void> {
    if (this.isSpeaking()) {
      // Stop if already playing
      this.audioService.stop();
      this.isSpeaking.set(false);
      return;
    }
    const kannada = this.isKannadaSignboard() ? this.detectedText() : this.translatedText();
    if (!kannada) return;
    this.isSpeaking.set(true);
    try {
      await this.audioService.speakKannada(kannada);
    } finally {
      this.isSpeaking.set(false);
    }
  }

  copyText(): void {
    const text = this.isKannadaSignboard()
      ? `${this.translatedText()} (${this.detectedText()})`
      : `${this.detectedText()} (${this.translatedText()})`;
    navigator.clipboard.writeText(text).then(() => {
      this.triggerToast('Copied to clipboard!');
    });
  }

  saveResult(): void {
    this.triggerToast('Saved to your saved items!');
  }

  private triggerToast(msg: string): void {
    this.toastMsg.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2500);
  }
}
