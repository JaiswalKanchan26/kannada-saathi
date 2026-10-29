import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { PreferencesService } from '../../core/services/preferences.service';
import { LessonService } from '../../core/services/lesson.service';
import { PhraseService } from '../../core/services/phrase.service';
import { ActivityService } from '../../core/services/activity.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="profile-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="profile-header">
        <div class="header-side-box">
        <button class="back-btn" id="btn-af-back" (click)="router.navigate(['/home'])" aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        </div>

        <h1 class="header-title">Your Profile</h1>

        <a routerLink="/settings" class="header-action-btn" aria-label="Open settings" id="btn-profile-settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </a>
      </header>

      <!-- Scrollable Main Content -->
      <div class="profile-scroll-content animate-fade-in">
        <!-- User Profile Card -->
        <div class="user-card">
          <!-- Person Outline Avatar -->
          <div class="user-avatar-box" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <div class="user-info">
            <h2 class="user-name">{{ prefs().displayName || 'Guest Learner' }}</h2>
            
            <div class="user-badges-row">
              <span class="user-badge purpose-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                <span>{{ formatPurpose(prefs().purpose) }}</span>
              </span>

              <span class="user-badge level-badge">
                {{ formatLevel(prefs().level) }}
              </span>
            </div>

            <a routerLink="/welcome" class="edit-prefs-link" id="link-edit-prefs">
              <span>Edit preferences</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Progress Summary 3-Card Grid -->
        <div class="stats-row">
          <div class="stat-box" id="stat-streak">
            <div class="stat-icon-wrap" aria-hidden="true">
              <!-- Flame Outline SVG Icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.63-1.5-3-2.5-4.5-1 1.5-2.5 2.87-2.5 4.5z"/>
                <path d="M12 2c1.5 3 4 5.5 4 9.5a6 6 0 1 1-12 0c0-4 3.5-7.5 5-11.5 1 2.5 2 3.5 3 2z"/>
              </svg>
            </div>
            <div class="stat-value">{{ streakDays() }}</div>
            <div class="stat-label">Day streak</div>
          </div>

          <a routerLink="/learn" class="stat-box clickable" id="stat-lessons">
            <div class="stat-icon-wrap" aria-hidden="true">
              <!-- Book Outline SVG Icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div class="stat-value">{{ completedLessons() }} / {{ totalLessons() }}</div>
            <div class="stat-label">Lessons completed</div>
          </a>

          <a routerLink="/saved" class="stat-box clickable" id="stat-saved">
            <div class="stat-icon-wrap" aria-hidden="true">
              <!-- Bookmark Outline SVG Icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="stat-value">{{ savedCount() }}</div>
            <div class="stat-label">Saved phrases</div>
          </a>
        </div>

        <!-- Section: Your Learning -->
        <section class="learning-section">
          <h2 class="section-title">Your Learning</h2>

          <div class="menu-list">
            <!-- 1. Saved Phrases -->
            <a routerLink="/saved" class="menu-card" id="menu-saved-phrases">
              <div class="menu-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="menu-text-col">
                <span class="menu-title">Saved Phrases</span>
                <span class="menu-desc">Your offline phrasebook</span>
              </div>
              <svg class="menu-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>

            <!-- 2. Festivals & Events -->
            <a routerLink="/calendar" class="menu-card" id="menu-festivals">
              <div class="menu-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="menu-text-col">
                <span class="menu-title">Festivals & Events</span>
                <span class="menu-desc">Explore Karnataka's culture</span>
              </div>
              <svg class="menu-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>

            <!-- 3. App Settings -->
            <a routerLink="/settings" class="menu-card" id="menu-settings">
              <div class="menu-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div class="menu-text-col">
                <span class="menu-title">App Settings</span>
                <span class="menu-desc">Theme, font size, audio, name</span>
              </div>
              <svg class="menu-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>

            <!-- 4. Learning Preferences -->
            <a routerLink="/welcome" class="menu-card" id="menu-learning-prefs">
              <div class="menu-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div class="menu-text-col">
                <span class="menu-title">Learning Preferences</span>
                <span class="menu-desc">Update your goals and interests</span>
              </div>
              <svg class="menu-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          </div>
        </section>

        <!-- "Did you know?" Card -->
        <div class="did-you-know-card" role="complementary" aria-label="Did you know?">
          <div class="dyk-icon-wrap" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="9" y1="18" x2="15" y2="18"/>
              <line x1="10" y1="22" x2="14" y2="22"/>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"/>
            </svg>
          </div>
          <div class="dyk-content">
            <h3 class="dyk-title">Did you know?</h3>
            <p class="dyk-text">
              Kannada has one of the oldest literary traditions in the world, dating back over 1,500 years.
            </p>
          </div>
        </div>
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

    .profile-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Dark Green Top Header with Curved Bottom */
    .profile-header {
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

    .header-side-box {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-shrink: 0;
    }

    .header-icon-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.01em;
      text-align: center;
    }

    .header-action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      text-decoration: none;
      transition: background 0.15s ease;
      margin-right: -4px;
      flex-shrink: 0;
    }

    .header-action-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .settings-icon-btn:hover {
      background: rgba(23, 107, 87, 0.08);
    }

    /* Scrollable Container */
    .profile-scroll-content {
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

    /* User Profile Card */
    .user-card {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.2rem 1.15rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1rem;
    }

    .user-avatar-box {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      text-align: left;
    }

    .user-name {
      font-size: 1.18rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.45rem;
      letter-spacing: -0.015em;
    }

    .user-badges-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }

    .user-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.22rem 0.65rem;
      border-radius: 9999px;
      line-height: 1.2;
    }

    .purpose-badge {
      background: #F0EFFE;
      color: #5548D9;
      border: 1px solid #E3E0FD;
    }

    .level-badge {
      background: #F3F4F6;
      color: #4B5563;
      border: 1px solid #E5E7EB;
    }

    .edit-prefs-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: #176B57;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .edit-prefs-link:hover {
      text-decoration: underline;
    }

    /* 3-Card Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
      margin-bottom: 1.35rem;
    }

    .stat-box {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 0.95rem 0.5rem 0.85rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .stat-box.clickable {
      cursor: pointer;
    }

    .stat-box.clickable:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .stat-icon-wrap {
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.4rem;
    }

    .stat-value {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      margin-bottom: 0.15rem;
    }

    .stat-label {
      font-size: 0.72rem;
      color: #6B7280;
      font-weight: 500;
      line-height: 1.2;
    }

    /* Learning Section */
    .learning-section {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.15rem;
    }

    .section-title {
      font-size: 1.08rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.85rem;
      text-align: left;
      letter-spacing: -0.015em;
    }

    .menu-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .menu-card {
      display: flex;
      align-items: center;
      gap: 0.95rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 0.95rem 1rem;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
    }

    .menu-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .menu-icon-box {
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

    .menu-text-col {
      flex: 1;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .menu-title {
      font-size: 0.96rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.25;
    }

    .menu-desc {
      font-size: 0.78rem;
      color: #6B7280;
      font-weight: 450;
      line-height: 1.3;
    }

    .menu-chevron {
      color: #9CA3AF;
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }

    .menu-card:hover .menu-chevron {
      color: #176B57;
      transform: translateX(2px);
    }

    /* "Did you know?" Card */
    .did-you-know-card {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 1.05rem 1.15rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      margin-bottom: 0.5rem;
    }

    .dyk-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .dyk-content {
      flex: 1;
      text-align: left;
    }

    .dyk-title {
      font-size: 0.96rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 3px;
    }

    .dyk-text {
      font-size: 0.8rem;
      line-height: 1.48;
      color: #6B7280;
      margin: 0;
    }
  `],
})
export class ProfileComponent implements OnInit {
  private preferencesService = inject(PreferencesService);
  private lessonService = inject(LessonService);
  private phraseService = inject(PhraseService);
  private activityService = inject(ActivityService);
  public router = inject(Router);

  prefs = signal(this.preferencesService.prefs());
  streakDays = signal(1);
  completedLessons = signal(0);
  totalLessons = signal(5);
  savedCount = signal(0);

  ngOnInit(): void {
    this.prefs.set(this.preferencesService.prefs());
    this.streakDays.set(this.activityService.getStreak() || 1);
    this.completedLessons.set(this.lessonService.getCompletedCount());
    const lessons = this.lessonService.getLessons();
    this.totalLessons.set(lessons.length > 0 ? lessons.length : 5);
    this.savedCount.set(this.phraseService.savedCount);
  }

  formatPurpose(p: string | null): string {
    if (p === 'tourist') return 'Tourist';
    if (p === 'resident') return 'Resident';
    if (p === 'both') return 'Explorer';
    return 'Tourist';
  }

  formatLevel(lvl: string | null): string {
    if (lvl === 'beginner') return 'Beginner';
    if (lvl === 'some') return 'Intermediate';
    return 'Beginner';
  }
}
