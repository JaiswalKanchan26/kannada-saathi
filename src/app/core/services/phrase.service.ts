import { Injectable, signal } from '@angular/core';
import { Phrase, SavedPhrase } from '../models/models';
import { PHRASES, getDailyPhraseId } from '../data/phrases.data';
import { StorageService } from './storage.service';

const SAVED_KEY = 'ks_saved_phrases';

@Injectable({ providedIn: 'root' })
export class PhraseService {
  private _savedPhrases = signal<SavedPhrase[]>([]);
  readonly savedPhrases = this._savedPhrases.asReadonly();

  constructor(private storage: StorageService) {
    const saved = this.storage.get<SavedPhrase[]>(SAVED_KEY, []);
    this._savedPhrases.set(saved);
  }

  getAllPhrases(): Phrase[] {
    return PHRASES;
  }

  getPhraseById(id: string): Phrase | undefined {
    return PHRASES.find(p => p.id === id);
  }

  getPhrasesBySituation(situationId: string): Phrase[] {
    return PHRASES.filter(p => p.situationId === situationId);
  }

  searchPhrases(query: string): Phrase[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PHRASES.filter(p =>
      p.english.toLowerCase().includes(q) ||
      p.transliteration.toLowerCase().includes(q) ||
      p.kannada.includes(query)
    );
  }

  getDailyPhrase(): Phrase | undefined {
    return this.getPhraseById(getDailyPhraseId());
  }

  getRelatedPhrases(phraseId: string): Phrase[] {
    const phrase = this.getPhraseById(phraseId);
    if (!phrase?.relatedPhraseIds?.length) return [];
    return phrase.relatedPhraseIds
      .map(id => this.getPhraseById(id))
      .filter((p): p is Phrase => p !== undefined);
  }

  isSaved(phraseId: string): boolean {
    return this._savedPhrases().some(s => s.phraseId === phraseId);
  }

  isPhraseSaved(phraseId: string): boolean {
    return this.isSaved(phraseId);
  }

  toggleSave(phraseId: string): boolean {
    const current = this._savedPhrases();
    if (this.isSaved(phraseId)) {
      const updated = current.filter(s => s.phraseId !== phraseId);
      this._savedPhrases.set(updated);
      this.storage.set(SAVED_KEY, updated);
      return false;
    } else {
      const updated = [...current, { phraseId, savedAt: new Date().toISOString() }];
      this._savedPhrases.set(updated);
      this.storage.set(SAVED_KEY, updated);
      return true;
    }
  }

  toggleSavePhrase(phraseId: string): boolean {
    return this.toggleSave(phraseId);
  }

  getSavedPhrasesWithDetails(): Phrase[] {
    return this._savedPhrases()
      .map(s => this.getPhraseById(s.phraseId))
      .filter((p): p is Phrase => p !== undefined);
  }

  get savedCount(): number {
    return this._savedPhrases().length;
  }
}
