import { Injectable } from '@angular/core';
import { Festival } from '../models/models';
import { FESTIVALS } from '../data/festivals.data';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  getAllEvents(): Festival[] {
    return FESTIVALS;
  }

  getEventById(id: string): Festival | undefined {
    return FESTIVALS.find(f => f.id === id);
  }

  getEventsByMonth(year: number, month: number): Festival[] {
    return FESTIVALS.filter(f => {
      const d = new Date(f.dateStr);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  getEventsByCategory(category: Festival['category']): Festival[] {
    return FESTIVALS.filter(f => f.category === category);
  }

  getUpcomingEvents(count = 3): Festival[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return FESTIVALS
      .filter(f => new Date(f.dateStr) >= today)
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
      .slice(0, count);
  }

  getNextFestival(): Festival | undefined {
    return this.getUpcomingEvents(1)[0];
  }

  getDatesWithEvents(year: number, month: number): Set<number> {
    const events = this.getEventsByMonth(year, month);
    const dates = new Set<number>();
    events.forEach(f => {
      const d = new Date(f.dateStr);
      dates.add(d.getDate());
    });
    return dates;
  }

  getRelatedEvents(currentId: string, count = 3): Festival[] {
    return FESTIVALS
      .filter(f => f.id !== currentId)
      .slice(0, count);
  }
}
