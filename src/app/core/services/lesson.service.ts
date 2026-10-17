import { Injectable, signal } from '@angular/core';
import { LessonProgress } from '../models/models';
import { LESSONS, LESSON_PHRASES, LessonPhrase } from '../data/lessons.data';
import { PHRASES } from '../data/phrases.data';
import { StorageService } from './storage.service';

const PROGRESS_KEY = 'ks_lesson_progress';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private _progress = signal<LessonProgress[]>([]);
  readonly progress = this._progress.asReadonly();

  constructor(private storage: StorageService) {
    const saved = this.storage.get<LessonProgress[]>(PROGRESS_KEY, []);
    this._progress.set(saved);
  }

  getLessons() {
    return LESSONS;
  }

  getLessonById(id: string) {
    return LESSONS.find(l => l.id === id);
  }

  getLessonsByCategory(category: string) {
    return LESSONS.filter(l => l.category === category);
  }

  getCategories(): string[] {
    return [...new Set(LESSONS.map(l => l.category))];
  }

  getPhrasesForLesson(lessonId: string): LessonPhrase[] {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return [];
    return lesson.phraseIds.map(id => {
      const lp = LESSON_PHRASES.find(lp => lp.id === id);
      if (lp) return lp;
      const p = PHRASES.find(p => p.id === id);
      if (p) return { id: p.id, kannada: p.kannada, transliteration: p.transliteration, english: p.english };
      return null;
    }).filter((p): p is LessonPhrase => p !== null);
  }

  isCompleted(lessonId: string): boolean {
    return this._progress().some(p => p.lessonId === lessonId && p.completed);
  }

  getCompletedCount(): number {
    return this._progress().filter(p => p.completed).length;
  }

  markComplete(lessonId: string): void {
    const current = this._progress();
    const existing = current.find(p => p.lessonId === lessonId);
    let updated: LessonProgress[];
    if (existing) {
      updated = current.map(p =>
        p.lessonId === lessonId ? { ...p, completed: true, completedAt: new Date().toISOString() } : p
      );
    } else {
      updated = [...current, { lessonId, completed: true, completedAt: new Date().toISOString() }];
    }
    this._progress.set(updated);
    this.storage.set(PROGRESS_KEY, updated);
  }

  resetProgress(): void {
    this._progress.set([]);
    this.storage.remove(PROGRESS_KEY);
  }
}
