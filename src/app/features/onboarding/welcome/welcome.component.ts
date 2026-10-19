import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferencesService } from '../../../core/services/preferences.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  template: `
    <div class="welcome-viewport" role="main" aria-label="Welcome to Kannada Saathi">
      <!-- Ambient backdrop for wide screens -->
      <div class="ambient-backdrop" aria-hidden="true"></div>

      <!-- Mobile-optimized card frame -->
      <main class="welcome-card animate-fade-in">
        <!-- Top Navigation Bar -->
        <header class="top-bar">
          <button
            class="back-btn"
            id="btn-back"
            (click)="goBack()"
            aria-label="Go back to splash screen"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </header>

        <!-- Main Content Area -->
        <div class="content-wrapper">
          <!-- Text Header -->
          <section class="welcome-header">
            <div class="welcome-logo-badge" aria-hidden="true">
              <img src="assets/Namma_Logo.png" alt="Namma Kannada Logo" class="welcome-logo-img" />
            </div>

            <h1 class="welcome-title">
              <span class="title-greeting">Welcome to</span>
              <span class="title-app">Namma Kannada!</span>
            </h1>

            <p class="welcome-description">
              Your everyday companion for Kannada language, culture and real-life communication.
            </p>
          </section>

          <!-- Scenic Illustration Card -->
          <div class="illustration-card" aria-label="Illustration of a traveler exploring Karnataka heritage monuments">
            <img
              src="assets/Welcome_Screen.png"
              alt="Traveler exploring Karnataka heritage temples"
              class="illustration-img"
            />
          </div>

          <!-- Bottom Action Area -->
          <footer class="actions-section">
            <button
              class="btn-get-started"
              id="btn-get-started"
              (click)="getStarted()"
              aria-label="Get Started with Kannada Saathi"
            >
              <span>Get Started</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="arrow-icon"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <!-- Login Prompt -->
            <div class="login-row">
              <span class="account-prompt">Already have an account?</span>
              <button
                type="button"
                class="link-login"
                id="btn-login"
                (click)="login()"
                aria-label="Login to existing account"
              >
                Login
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100dvh;
    }

    .welcome-viewport {
      position: relative;
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #EDE8DE;
    }

    /* Ambient backdrop for desktop/wide viewports */
    .ambient-backdrop {
      position: absolute;
      inset: -20px;
      background-image: url('/assets/Welcome_Screen.png');
      background-size: cover;
      background-position: center 60%;
      filter: blur(28px) brightness(0.92) saturate(1.1);
      opacity: 0.55;
      transform: scale(1.05);
    }

    /* Card Frame */
    .welcome-card {
      position: relative;
      width: 100%;
      max-width: 440px;
      height: 100dvh;
      max-height: 940px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 16px 48px rgba(14, 46, 38, 0.2);
      background-color: #FAF8F2;
      z-index: 2;
    }

    @media (min-width: 480px) and (min-height: 700px) {
      .welcome-card {
        height: min(94vh, 920px);
        border-radius: 36px;
        border: 1px solid rgba(255, 255, 255, 0.7);
      }
    }

    /* Top Navigation */
    .top-bar {
      padding: clamp(0.75rem, 2vh, 1.25rem) 1.25rem 0;
      display: flex;
      align-items: center;
      z-index: 5;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: #0E4839;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      margin-left: -6px;
    }

    .back-btn:hover {
      background-color: rgba(14, 72, 57, 0.08);
    }

    .back-btn:active {
      transform: scale(0.94);
    }

    /* Content Layout */
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.5rem 1.5rem clamp(1.5rem, 3.5vh, 2.5rem);
      gap: 1rem;
    }

    /* Header text */
    .welcome-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      padding-top: 0.25rem;
    }

    .welcome-logo-badge {
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 4px 10px rgba(14, 72, 57, 0.16));
    }

    .welcome-logo-img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      display: block;
    }

    .welcome-title {
      margin: 0;
      display: flex;
      flex-direction: column;
      line-height: 1.18;
      letter-spacing: -0.025em;
    }

    .title-greeting {
      font-size: clamp(1.75rem, 4.8vw, 2.05rem);
      font-weight: 800;
      color: #0E4839;
    }

    .title-app {
      font-size: clamp(1.75rem, 4.8vw, 2.05rem);
      font-weight: 800;
      color: #0E4839;
    }

    .welcome-description {
      margin: 0.85rem 0 0;
      font-size: clamp(0.92rem, 2.6vw, 1rem);
      color: #386053;
      line-height: 1.5;
      font-weight: 450;
      max-width: 330px;
    }

    /* Scenic Illustration Frame */
    .illustration-card {
      width: 100%;
      height: clamp(200px, 31vh, 260px);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(14, 46, 38, 0.08);
      border: 1px solid rgba(14, 72, 57, 0.08);
      position: relative;
      background-color: #EBF4EE;
      margin: auto 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .illustration-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 58%;
      display: block;
      user-select: none;
      pointer-events: none;
    }

    /* Actions Section */
    .actions-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      gap: 1rem;
      padding-top: 0.5rem;
    }

    /* Get Started Pill Button */
    .btn-get-started {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      min-height: 52px;
      padding: 0.9rem 1.75rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, #0B5540 0%, #0E654C 100%);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 700;
      font-family: var(--font-sans);
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(11, 85, 64, 0.32);
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-get-started:hover {
      background: linear-gradient(135deg, #084735 0%, #0B5540 100%);
      box-shadow: 0 8px 22px rgba(11, 85, 64, 0.42);
      transform: translateY(-1px);
    }

    .btn-get-started:active {
      transform: translateY(1px) scale(0.99);
      box-shadow: 0 3px 10px rgba(11, 85, 64, 0.3);
    }

    .arrow-icon {
      transition: transform 0.2s ease;
    }

    .btn-get-started:hover .arrow-icon {
      transform: translateX(3px);
    }

    /* Login row */
    .login-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      font-size: 0.925rem;
    }

    .account-prompt {
      color: #6C7F77;
      font-weight: 450;
    }

    .link-login {
      background: transparent;
      border: none;
      color: #0E654C;
      font-weight: 700;
      font-size: 0.925rem;
      font-family: var(--font-sans);
      cursor: pointer;
      padding: 0.25rem 0.35rem;
      transition: color 0.15s ease;
    }

    .link-login:hover {
      color: #084735;
      text-decoration: underline;
    }
  `],
})
export class WelcomeComponent {
  constructor(private router: Router, private prefs: PreferencesService) {}

  goBack(): void {
    this.router.navigate(['/splash']);
  }

  getStarted(): void {
    this.router.navigate(['/onboarding/language']);
  }

  login(): void {
    this.prefs.update({ isGuest: false, displayName: 'Demo User', onboardingComplete: true });
    this.router.navigate(['/home']);
  }
}
