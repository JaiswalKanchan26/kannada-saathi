import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { LessonService } from '../../core/services/lesson.service';
import { Lesson } from '../../core/models/models';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="learn-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="learn-header">
        <div class="header-side-box">
        <button class="back-btn" id="btn-af-back" (click)="router.navigate(['/home'])" aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        </div>

        <h1 class="header-title">Learn Kannada</h1>

        <div class="header-side-box right">
          <span class="header-pill-badge">{{ completedCount() }}/{{ totalCount() }}</span>
        </div>
      </header>

      <!-- Scrollable Main Content -->
      <div class="learn-scroll-content animate-fade-in">
        <!-- Overall Progress Card -->
        <div class="progress-card">
          <div class="progress-top-row">
            <div class="progress-title-col">
              <span class="progress-main-lbl">Overall Progress</span>
              <span class="progress-sub-lbl">{{ completedCount() }} of {{ totalCount() }} lessons finished</span>
            </div>
            
            <div class="progress-badges-col">
              <span class="progress-pct-badge">{{ progressPercent() }}%</span>
            </div>
          </div>

          <div class="progress-track" role="progressbar" [attr.aria-valuenow]="progressPercent()" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" [style.width.%]="progressPercent()"></div>
          </div>
        </div>

        <!-- Category Tabs Row -->
        <div class="category-pills-row" role="tablist" aria-label="Lesson categories">
          @for (cat of categories(); track cat) {
            <button
              class="pill-btn"
              [class.active]="activeCategory() === cat"
              [id]="'cat-' + cat"
              (click)="activeCategory.set(cat)"
              role="tab"
              [attr.aria-selected]="activeCategory() === cat"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Lessons List -->
        <div class="lessons-list" role="tabpanel">
          @for (lesson of filteredLessons(); track lesson.id) {
            <a
              [routerLink]="['/learn', lesson.id]"
              class="lesson-card"
              [id]="'lesson-' + lesson.id"
              [attr.aria-label]="lesson.titleEn + (isCompleted(lesson.id) ? ' (completed)' : '')"
            >
              <!-- Icon Box in soft mint background -->
              <div class="lesson-icon-box" [class.completed]="isCompleted(lesson.id)" aria-hidden="true">
                @if (lesson.icon === 'hand' || lesson.category === 'Basics' && lesson.id === 'l001') {
                  <!-- Hand/Wave outline SVG icon -->
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"/>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                  </svg>
                } @else if (lesson.icon === 'hash' || lesson.titleEn.includes('Numbers')) {
                  <!-- Numbers / Hash outline SVG icon -->
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9"/>
                    <line x1="4" y1="15" x2="20" y2="15"/>
                    <line x1="10" y1="3" x2="8" y2="21"/>
                    <line x1="16" y1="3" x2="14" y2="21"/>
                  </svg>
                } @else if (lesson.icon === 'bus' || lesson.category === 'Travel') {
                  <!-- Bus outline SVG icon -->
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="15" rx="3"/>
                    <path d="M3 11h18"/>
                    <circle cx="7.5" cy="15.5" r="1.5"/>
                    <circle cx="16.5" cy="15.5" r="1.5"/>
                    <path d="M6 18v2M18 18v2"/>
                  </svg>
                } @else if (lesson.icon === 'utensils' || lesson.category === 'Food') {
                  <!-- Restaurant Utensils outline SVG icon -->
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2v20M21 2c0 2.5-1.5 4.5-3 5v15"/>
                    <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
                    <path d="M9 9v13"/>
                  </svg>
                } @else {
                  <!-- Polite Expressions / Heart outline SVG icon -->
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                }
              </div>

              <!-- Lesson Info -->
              <div class="lesson-content">
                <h2 class="lesson-name">{{ lesson.titleEn }}</h2>
                <div class="lesson-meta-row">
                  <span class="meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{{ lesson.phraseIds.length }} phrases</span>
                  </span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{{ lesson.durationMinutes }} min</span>
                  </span>
                </div>
              </div>

              <!-- Right Status (Checkmark or Chevron) -->
              @if (isCompleted(lesson.id)) {
                <div class="lesson-completed-badge" aria-label="Completed" title="Completed">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              } @else {
                <svg class="lesson-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              }
            </a>
          }
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

    .learn-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Emerald Header with Curved Bottom */
    .learn-header {
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

    .header-side-box.right {
      justify-content: flex-end;
      width: auto;
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

    .header-pill-badge {
      font-size: 0.74rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      white-space: nowrap;
    }

    /* Scrollable Container */
    .learn-scroll-content {
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

    /* Progress Card */
    .progress-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.15rem 1.15rem 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1.15rem;
    }

    .progress-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .progress-title-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }

    .progress-main-lbl {
      font-size: 1.02rem;
      font-weight: 800;
      color: #111827;
    }

    .progress-sub-lbl {
      font-size: 0.8rem;
      color: #6B7280;
    }

    .progress-badges-col {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .completed-pill-tag {
      font-size: 0.74rem;
      font-weight: 700;
      background: #E8F5EF;
      color: #176B57;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .progress-pct-badge {
      font-size: 1.1rem;
      font-weight: 800;
      color: #176B57;
    }

    .progress-track {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: #E8F5EF;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: #176B57;
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    /* Category Filter Pills */
    .category-pills-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .category-pills-row::-webkit-scrollbar {
      display: none;
    }

    .pill-btn {
      padding: 0.45rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      border: 1px solid #E5E7EB;
      background: #FFFFFF;
      color: #4B5563;
      transition: all 0.15s ease;
      white-space: nowrap;
      min-height: 36px;
    }

    .pill-btn:hover {
      border-color: #176B57;
      color: #176B57;
    }

    .pill-btn.active {
      background: #176B57;
      color: #FFFFFF;
      border-color: #176B57;
      box-shadow: 0 2px 8px rgba(23, 107, 87, 0.25);
    }

    /* Lessons List */
    .lessons-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .lesson-card {
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

    .lesson-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .lesson-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .lesson-content {
      flex: 1;
      text-align: left;
    }

    .lesson-name {
      font-size: 0.98rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 3px;
      line-height: 1.25;
    }

    .lesson-meta-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.77rem;
      color: #6B7280;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .meta-dot {
      color: #D1D5DB;
    }

    .lesson-completed-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(23, 107, 87, 0.3);
    }

    .lesson-chevron {
      color: #9CA3AF;
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }

    .lesson-card:hover .lesson-chevron {
      color: #176B57;
      transform: translateX(2px);
    }
  `],
})
export class LearnComponent implements OnInit {
  categories = signal<string[]>([]);
  activeCategory = signal('All');
  completedCount = signal(0);
  totalCount = signal(0);

  private allLessons: Lesson[] = [];

  constructor(
    private lessonService: LessonService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.allLessons = this.lessonService.getLessons();
    const cats = ['All', ...this.lessonService.getCategories()];
    this.categories.set(cats);
    this.totalCount.set(this.allLessons.length);
    this.completedCount.set(this.lessonService.getCompletedCount());
  }

  filteredLessons(): Lesson[] {
    const cat = this.activeCategory();
    if (cat === 'All') return this.allLessons;
    return this.allLessons.filter(l => l.category === cat);
  }

  isCompleted(id: string): boolean {
    return this.lessonService.isCompleted(id);
  }

  progressPercent(): number {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  }
}
