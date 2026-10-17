import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { LessonService } from '../../../core/services/lesson.service';
import { AudioService } from '../../../core/services/audio.service';
import { ActivityService } from '../../../core/services/activity.service';
import { Lesson } from '../../../core/models/models';
import { LessonPhrase } from '../../../core/data/lessons.data';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [BottomNavComponent],
  template: `
    <div class="lesson-detail-viewport" role="main">
      <!-- Top Navigation Header -->
      <header class="lesson-header">
        <button class="back-btn" (click)="goBack()" aria-label="Back to lessons" id="btn-back-lesson">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        @if (lesson()) {
          <div class="header-titles">
            <span class="header-cat-badge">{{ lesson()!.category }}</span>
            <h1 class="header-title">{{ lesson()!.titleEn }}</h1>
          </div>
        }
      </header>

      @if (lesson()) {
        <div class="lesson-scroll-content animate-fade-in">
          <!-- Progress Indicator -->
          <div class="lesson-progress-wrap">
            <div class="progress-track" role="progressbar" [attr.aria-valuenow]="lessonProgress()" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill" [style.width.%]="lessonProgress()"></div>
            </div>
            <div class="progress-steps-lbl">
              <span>Phrase {{ currentIndex() + 1 }} of {{ phrases().length }}</span>
              <span>{{ lessonProgress() }}%</span>
            </div>
          </div>

          @if (completed()) {
            <!-- Completion Card with Clean Vector Icon (No Emojis!) -->
            <div class="completion-card">
              <div class="completion-trophy-box" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"/>
                  <path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/>
                </svg>
              </div>

              <h2 class="completion-title">Lesson Complete!</h2>
              <p class="completion-subtitle">
                Great job! You've learned all {{ phrases().length }} phrases in this lesson.
              </p>

              <button class="btn-primary-finish" (click)="router.navigate(['/learn'])" id="btn-finish-lesson">
                <span>Continue to Lessons</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          } @else {
            <!-- Interactive Lesson Flashcard -->
            <div class="flashcard-card">
              <h3 class="flashcard-kannada font-kannada">{{ currentPhrase()?.kannada }}</h3>
              <p class="flashcard-translit">{{ currentPhrase()?.transliteration }}</p>
              <p class="flashcard-english">{{ currentPhrase()?.english }}</p>
              
              @if (currentPhrase()?.hindi) {
                <div class="flashcard-hindi-row">
                  <span class="hindi-lbl">Hindi:</span>
                  <span class="hindi-val">{{ currentPhrase()?.hindi }}</span>
                </div>
              }

              <!-- Listen Audio Button -->
              <div class="flashcard-audio-row">
                <button class="listen-btn" (click)="playPhrase()" [attr.aria-label]="'Listen to: ' + currentPhrase()?.english" id="btn-lesson-listen">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                  <span>Listen Pronunciation</span>
                </button>
              </div>
            </div>

            <!-- Navigation Controls -->
            <div class="nav-buttons-row">
              <button
                class="prev-btn"
                (click)="prev()"
                [disabled]="currentIndex() === 0"
                aria-label="Previous phrase"
                id="btn-lesson-prev"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
                <span>Previous</span>
              </button>

              <button
                class="next-btn"
                (click)="next()"
                [attr.aria-label]="isLast() ? 'Complete lesson' : 'Next phrase'"
                id="btn-lesson-next"
              >
                <span>{{ isLast() ? 'Complete Lesson' : 'Next Phrase' }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  @if (isLast()) {
                    <polyline points="20 6 9 17 4 12"/>
                  } @else {
                    <path d="M9 5l7 7-7 7"/>
                  }
                </svg>
              </button>
            </div>

            <!-- All Phrases in Lesson -->
            <div class="phrases-drawer">
              <h4 class="drawer-title">All Phrases in this Lesson</h4>
              <div class="drawer-list">
                @for (p of phrases(); track p.id; let i = $index) {
                  <button
                    class="drawer-row"
                    [class.current]="i === currentIndex()"
                    (click)="goTo(i)"
                    [id]="'lp-' + p.id"
                    [attr.aria-current]="i === currentIndex() ? 'true' : null"
                  >
                    <span class="drawer-num">{{ i + 1 }}</span>
                    <div class="drawer-text-col">
                      <span class="drawer-kn font-kannada">{{ p.kannada }}</span>
                      <span class="drawer-en">{{ p.english }}</span>
                    </div>
                  </button>
                }
              </div>
            </div>
          }
        </div>
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

    .lesson-detail-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Top Navigation Header */
    .lesson-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem 0.65rem;
      background: #F9FAF9;
      z-index: 5;
    }

    .back-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
      margin-left: -6px;
      flex-shrink: 0;
    }

    .back-btn:hover {
      background: #F3F4F6;
    }

    .header-titles {
      flex: 1;
      text-align: left;
    }

    .header-cat-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #176B57;
      display: block;
      margin-bottom: 2px;
    }

    .header-title {
      font-size: 1.18rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.015em;
      line-height: 1.25;
    }

    /* Scrollable Container */
    .lesson-scroll-content {
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

    /* Progress Wrap */
    .lesson-progress-wrap {
      margin-bottom: 1.15rem;
    }

    .progress-track {
      width: 100%;
      height: 7px;
      border-radius: 999px;
      background: #E8F5EF;
      overflow: hidden;
      margin-bottom: 0.4rem;
    }

    .progress-fill {
      height: 100%;
      background: #176B57;
      border-radius: 999px;
      transition: width 0.25s ease;
    }

    .progress-steps-lbl {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.76rem;
      color: #6B7280;
      font-weight: 500;
    }

    /* Flashcard Card */
    .flashcard-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 22px;
      padding: 1.5rem 1.25rem;
      box-shadow: 0 3px 14px rgba(0, 0, 0, 0.03);
      text-align: center;
      margin-bottom: 1rem;
    }

    .flashcard-kannada {
      font-size: clamp(1.85rem, 5.8vw, 2.3rem);
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.5rem;
      line-height: 1.35;
    }

    .flashcard-translit {
      font-size: 1.05rem;
      font-style: italic;
      color: #6B7280;
      margin: 0 0 0.5rem;
    }

    .flashcard-english {
      font-size: 1.15rem;
      font-weight: 700;
      color: #176B57;
      margin: 0 0 0.75rem;
      line-height: 1.3;
    }

    .flashcard-hindi-row {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      color: #4B5563;
      margin-bottom: 1rem;
    }

    .hindi-lbl {
      color: #9CA3AF;
      font-weight: 600;
    }

    .flashcard-audio-row {
      display: flex;
      justify-content: center;
      margin-top: 0.5rem;
    }

    .listen-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #E8F5EF;
      border: 1px solid rgba(23, 107, 87, 0.15);
      border-radius: 12px;
      padding: 0.65rem 1.2rem;
      color: #176B57;
      font-size: 0.88rem;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .listen-btn:hover {
      background: #D9F2E8;
      border-color: #176B57;
      transform: translateY(-1px);
    }

    /* Navigation Controls Row */
    .nav-buttons-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .prev-btn {
      flex: 1;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      color: #374151;
      font-size: 0.92rem;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .prev-btn:hover:not(:disabled) {
      border-color: #176B57;
      color: #176B57;
    }

    .prev-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .next-btn {
      flex: 1;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      background: #176B57;
      border: none;
      border-radius: 14px;
      color: #FFFFFF;
      font-size: 0.92rem;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25);
      transition: all 0.15s ease;
    }

    .next-btn:hover {
      background: #0F5444;
      transform: translateY(-1px);
    }

    /* All Phrases Drawer */
    .phrases-drawer {
      margin-top: 1rem;
    }

    .drawer-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.75rem;
      text-align: left;
    }

    .drawer-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .drawer-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1.5px solid #EAEFEA;
      border-radius: 14px;
      padding: 0.8rem 0.95rem;
      text-align: left;
      cursor: pointer;
      font-family: var(--font-sans);
      transition: all 0.15s ease;
      width: 100%;
    }

    .drawer-row:hover {
      border-color: #B2E4D0;
    }

    .drawer-row.current {
      border-color: #176B57;
      background: #F0FAF5;
    }

    .drawer-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #F3F4F6;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .drawer-row.current .drawer-num {
      background: #176B57;
      color: #FFFFFF;
    }

    .drawer-text-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .drawer-kn {
      font-size: 0.98rem;
      font-weight: 700;
      color: #111827;
    }

    .drawer-en {
      font-size: 0.8rem;
      color: #6B7280;
    }

    /* Completion Card */
    .completion-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 24px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1rem;
    }

    .completion-trophy-box {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.15);
    }

    .completion-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 0.4rem;
      letter-spacing: -0.015em;
    }

    .completion-subtitle {
      font-size: 0.88rem;
      color: #6B7280;
      line-height: 1.45;
      margin: 0 0 1.75rem;
      max-width: 280px;
    }

    .btn-primary-finish {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #176B57;
      color: #FFFFFF;
      border: none;
      border-radius: 9999px;
      padding: 0.85rem 1.75rem;
      font-size: 0.98rem;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.25);
      transition: all 0.15s ease;
    }

    .btn-primary-finish:hover {
      background: #0F5444;
      transform: translateY(-1px);
    }
  `],
})
export class LessonDetailComponent implements OnInit {
  lesson = signal<Lesson | undefined>(undefined);
  phrases = signal<LessonPhrase[]>([]);
  currentIndex = signal(0);
  completed = signal(false);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private lessonService: LessonService,
    private audioService: AudioService,
    private activity: ActivityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.lesson.set(this.lessonService.getLessonById(id));
    this.phrases.set(this.lessonService.getPhrasesForLesson(id));
    this.completed.set(this.lessonService.isCompleted(id));
  }

  currentPhrase(): LessonPhrase | undefined {
    return this.phrases()[this.currentIndex()];
  }

  isLast(): boolean {
    return this.currentIndex() === this.phrases().length - 1;
  }

  lessonProgress(): number {
    const total = this.phrases().length;
    if (total === 0) return 0;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  }

  next(): void {
    if (this.isLast()) {
      const lesson = this.lesson();
      if (lesson) {
        this.lessonService.markComplete(lesson.id);
        this.activity.track({ type: 'lesson_completed', referenceId: lesson.id, label: lesson.titleEn });
      }
      this.completed.set(true);
    } else {
      this.currentIndex.update(i => i + 1);
    }
  }

  prev(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  goTo(index: number): void {
    this.currentIndex.set(index);
  }

  async playPhrase(): Promise<void> {
    const phrase = this.currentPhrase();
    if (!phrase) return;
    try {
      await this.audioService.speak(phrase.kannada);
    } catch {
      // Silently finish
    }
  }

  goBack(): void {
    this.router.navigate(['/learn']);
  }
}
