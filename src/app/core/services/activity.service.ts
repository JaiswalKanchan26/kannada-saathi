import { Injectable, signal } from '@angular/core';
import { RecentActivity } from '../models/models';
import { StorageService } from './storage.service';

const ACTIVITY_KEY = 'ks_activity';
const MAX_ACTIVITY = 20;

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private _activities = signal<RecentActivity[]>([]);
  readonly activities = this._activities.asReadonly();

  constructor(private storage: StorageService) {
    const saved = this.storage.get<RecentActivity[]>(ACTIVITY_KEY, []);
    this._activities.set(saved);
  }

  track(activity: Omit<RecentActivity, 'timestamp'>): void {
    const item: RecentActivity = {
      ...activity,
      timestamp: new Date().toISOString(),
    };
    const updated = [item, ...this._activities()].slice(0, MAX_ACTIVITY);
    this._activities.set(updated);
    this.storage.set(ACTIVITY_KEY, updated);
  }

  log(type: RecentActivity['type'], referenceId: string, label: string): void {
    this.track({ type, referenceId, label });
  }

  getRecent(limit = 5): RecentActivity[] {
    return this._activities().slice(0, limit);
  }

  getByType(type: RecentActivity['type']): RecentActivity[] {
    return this._activities().filter(a => a.type === type);
  }

  getStreak(): number {
    const activities = this._activities();
    if (!activities.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const dayMs = 86400000;
    let checkDate = new Date(today);

    while (true) {
      const hasActivity = activities.some(a => {
        const d = new Date(a.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === checkDate.getTime();
      });
      if (!hasActivity) break;
      streak++;
      checkDate = new Date(checkDate.getTime() - dayMs);
    }
    return streak;
  }

  clear(): void {
    this._activities.set([]);
    this.storage.remove(ACTIVITY_KEY);
  }
}
