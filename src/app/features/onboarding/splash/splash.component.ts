import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../core/services/preferences.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
    <div class="splash-viewport" role="main" aria-label="Kannada Saathi Splash Screen">
      <!-- Ambient backdrop for wide screens -->
      <div class="ambient-backdrop" aria-hidden="true"></div>

      <!-- Mobile-optimized frame -->
      <main class="splash-card">
        <!-- Background Artwork -->
        <div class="splash-bg" aria-hidden="true">
          <img
            src="assets/Splash_Screen.png"
            alt="Karnataka Heritage Landscape"
            class="splash-bg-image"
          />
          <div class="splash-gradient-scrim"></div>
        </div>

        <!-- Upper Branding Section -->
        <div class="splash-header animate-slide-up">
          <!-- Official Emblem Logo -->
          <div class="logo-wrapper" aria-hidden="true">
            <img src="assets/Namma_Logo.png" alt="Namma Kannada Logo" class="brand-logo-img" />
          </div>

          <!-- App Title -->
          <h1 class="brand-title">
            <span class="title-line">Namma</span>
            <span class="title-line">Kannada</span>
          </h1>

          <!-- Tagline -->
          <p class="tagline">Speak &bull; Understand &bull; Learn</p>

          <!-- Kannada Connecting Slogan -->
          <div class="slogan-group">
            <p class="kannada-phrase font-kannada">ಕನ್ನಡ ನಮ್ಮದು, ಎಲ್ಲರದು</p>
            <p class="kannada-translation">Kannada connects us all</p>
          </div>
        </div>

        <!-- Lower Loading Footer Section -->
        <footer class="splash-footer animate-fade-in" aria-label="Loading Kannada Saathi...">
          <p class="journey-text">
            Your Kannada journey<br />begins here...
          </p>

          <!-- Smooth Dual-Tone Progress Bar -->
          <div
            class="progress-pill"
            role="progressbar"
            [attr.aria-valuenow]="progressPercent()"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-fill" [style.width.%]="progressPercent()"></div>
            <div class="progress-track-bg"></div>
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100dvh;
    }

    .splash-viewport {
      position: relative;
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #EAE6DB;
    }

    /* Ambient background on widescreen / desktop */
    .ambient-backdrop {
      position: absolute;
      inset: -20px;
      background-image: url('/assets/Splash_Screen.png');
      background-size: cover;
      background-position: center bottom;
      filter: blur(28px) brightness(0.9) saturate(1.1);
      opacity: 0.6;
      transform: scale(1.05);
    }

    /* Mobile Frame container: full screen on mobile, phone-aspect framed on desktop */
    .splash-card {
      position: relative;
      width: 100%;
      max-width: 440px;
      height: 100dvh;
      max-height: 940px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 16px 48px rgba(14, 46, 38, 0.22);
      background-color: #FAF6ED;
      z-index: 2;
    }

    @media (min-width: 480px) and (min-height: 700px) {
      .splash-card {
        height: min(94vh, 920px);
        border-radius: 36px;
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
    }

    /* Background image & lighting scrim */
    .splash-bg {
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
    }

    .splash-bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center bottom;
      display: block;
      pointer-events: none;
      user-select: none;
    }

    /* Subtle top scrim to guarantee high text contrast across screens */
    .splash-gradient-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(254, 249, 238, 0.55) 0%,
        rgba(254, 249, 238, 0.35) 30%,
        rgba(254, 249, 238, 0) 55%,
        rgba(254, 249, 238, 0.45) 88%,
        rgba(254, 249, 238, 0.85) 100%
      );
      pointer-events: none;
    }

    /* Header content containing logo and typography - shifted downwards with larger typography */
    .splash-header {
      position: relative;
      z-index: 5;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: clamp(4.25rem, 8.5vh, 6rem) 1.5rem 0.5rem;
    }

    .logo-wrapper {
      margin-bottom: 0.75rem;
      filter: drop-shadow(0 6px 14px rgba(19, 77, 63, 0.22));
      transition: transform 0.3s ease;
    }

    .brand-logo-img {
      width: 96px;
      height: 96px;
      display: inline-block;
      object-fit: contain;
    }

    .brand-title {
      margin: 0;
      display: flex;
      flex-direction: column;
      line-height: 1.08;
      letter-spacing: -0.025em;
    }

    .title-line {
      font-size: clamp(2.35rem, 6.8vw, 2.75rem);
      font-weight: 800;
      color: #0E4839;
      text-shadow: 0 1px 4px rgba(255, 255, 255, 0.7);
    }

    .tagline {
      margin: 0.75rem 0 0;
      font-size: clamp(0.95rem, 2.8vw, 1.08rem);
      font-weight: 600;
      color: #245546;
      letter-spacing: 0.05em;
      opacity: 0.95;
    }

    .slogan-group {
      margin-top: clamp(1.2rem, 3vh, 1.75rem);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
    }

    .kannada-phrase {
      margin: 0;
      font-size: clamp(1.35rem, 4vw, 1.6rem);
      font-weight: 700;
      color: #10483A;
      letter-spacing: 0.01em;
      text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
    }

    .kannada-translation {
      margin: 0;
      font-size: clamp(0.92rem, 2.6vw, 1.05rem);
      font-weight: 600;
      color: #275949;
      letter-spacing: 0.01em;
      opacity: 0.95;
    }

    /* Footer section with journey prompt and progress bar */
    .splash-footer {
      position: relative;
      z-index: 5;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0 1.5rem clamp(2.25rem, 4.5vh, 3rem);
      gap: 0.85rem;
    }

    .journey-text {
      margin: 0;
      font-size: clamp(0.88rem, 2.5vw, 0.98rem);
      font-weight: 600;
      color: #19463A;
      line-height: 1.35;
      letter-spacing: 0.01em;
      text-shadow: 0 1px 3px rgba(255, 255, 255, 0.85);
    }

    /* Dual-Tone Rounded Progress Pill */
    .progress-pill {
      position: relative;
      width: min(170px, 48vw);
      height: 7px;
      border-radius: 999px;
      overflow: hidden;
      background-color: #EBD6B3;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    .progress-fill {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      background: linear-gradient(90deg, #0C5844 0%, #15735B 100%);
      border-radius: 999px;
      transition: width 0.08s linear;
      box-shadow: 0 0 6px rgba(12, 88, 68, 0.4);
    }

    .progress-track-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
  `],
})
export class SplashComponent implements OnInit, OnDestroy {
  progressPercent = signal<number>(0);
  private timerId: any = null;
  private intervalId: any = null;

  // Extended splash timeout duration (3800ms) for pleasant viewing
  private readonly SPLASH_DURATION_MS = 3800;

  constructor(private router: Router, private prefs: PreferencesService) {}

  ngOnInit(): void {
    const startTime = Date.now();
    const updateInterval = 40; // 25fps smooth progress update

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / this.SPLASH_DURATION_MS) * 100));
      this.progressPercent.set(pct);
      if (pct >= 100) {
        clearInterval(this.intervalId);
      }
    }, updateInterval);

    this.timerId = setTimeout(() => {
      this.navigateNext();
    }, this.SPLASH_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private navigateNext(): void {
    const p = this.prefs.prefs();
    if (p.onboardingComplete) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }
  }
}
