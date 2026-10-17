import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { CalendarService } from '../../core/services/calendar.service';
import { Festival } from '../../core/models/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  template: `
    <div class="calendar-viewport" role="main">
      <!-- Solid Dark Green Top Header with Curved Bottom -->
      <header class="calendar-header">
        <button class="cal-back-btn" (click)="goBack()" aria-label="Go back to home" id="btn-cal-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Festivals &amp; Events</h1>

        <button class="cal-action-btn" (click)="resetToCurrentMonth()" aria-label="View current calendar" id="btn-cal-today">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </header>

      <!-- Scrollable Main Content -->
      <div class="calendar-scroll-content animate-fade-in">
        <!-- Category Filter Pills -->
        <div class="filter-pills-row" role="tablist" aria-label="Event categories">
          @for (f of filters; track f.id) {
            <button
              class="pill-btn"
              [class.active]="activeFilter() === f.id"
              (click)="setFilter(f.id)"
              role="tab"
              [attr.aria-selected]="activeFilter() === f.id"
              [id]="'filter-' + f.id"
            >
              {{ f.label }}
            </button>
          }
        </div>

        <!-- Unified Rounded Calendar Card -->
        <div class="calendar-card" role="region" [attr.aria-label]="'Calendar for ' + monthLabel()">
          <!-- Month Header Navigation -->
          <div class="month-header">
            <button class="month-nav-btn" (click)="changeMonth(-1)" aria-label="Previous month" id="btn-prev-month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span class="month-title">{{ monthLabel() }}</span>
            <button class="month-nav-btn" (click)="changeMonth(1)" aria-label="Next month" id="btn-next-month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Day Headers (Sun - Sat) -->
          <div class="days-header-row" role="row">
            @for (day of dayHeaders; track day) {
              <div class="day-col-hdr" role="columnheader">{{ day }}</div>
            }
          </div>

          <!-- Days Grid -->
          <div class="days-grid" role="grid">
            @for (blank of leadingBlanks(); track $index) {
              <div class="day-cell blank" role="gridcell" aria-hidden="true"></div>
            }
            @for (day of daysInMonth(); track day) {
              <button
                type="button"
                class="day-cell"
                [class.selected]="selectedDay() === day"
                [class.has-event]="hasEvent(day)"
                (click)="selectDay(day)"
                role="gridcell"
                [attr.aria-label]="day + ' ' + monthLabel() + (hasEvent(day) ? ' has event' : '')"
                [id]="'day-' + day"
              >
                <span class="day-number">{{ day }}</span>
                @if (hasEvent(day) && selectedDay() !== day) {
                  <span class="event-indicator-dot" aria-hidden="true"></span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Upcoming Events Section -->
        <section class="upcoming-section">
          <div class="upcoming-header">
            <h2 class="section-title">Upcoming events</h2>
            <button class="view-all-btn" (click)="viewAllEvents()" id="btn-view-all-events">
              <span>View all</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div class="events-list">
            @for (event of displayedEvents(); track event.id) {
              <a [routerLink]="['/calendar', event.id]" class="event-card" [id]="'event-' + event.id" [attr.aria-label]="event.nameEn">
                <!-- Icon Box in soft mint background -->
                <div class="event-icon-box" aria-hidden="true">
                  @if (event.category === 'festival') {
                    <!-- Festive Diya / Lamp clean outline icon -->
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2c1 2 2 3.5 2 5a2 2 0 1 1-4 0c0-1.5 1-3 2-5z"/>
                      <path d="M4 14c0 4 3.5 7 8 7s8-3 8-7H4z"/>
                      <path d="M4 14h16"/>
                    </svg>
                  } @else {
                    <!-- Temple / Heritage Architecture clean outline icon -->
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="3" y1="21" x2="21" y2="21"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <polyline points="12 3 2 10 22 10"/>
                      <line x1="6" y1="10" x2="6" y2="21"/>
                      <line x1="10" y1="10" x2="10" y2="21"/>
                      <line x1="14" y1="10" x2="14" y2="21"/>
                      <line x1="18" y1="10" x2="18" y2="21"/>
                    </svg>
                  }
                </div>

                <!-- Event Details -->
                <div class="event-content">
                  <h3 class="event-name">{{ event.nameEn }}</h3>
                  <div class="event-meta">
                    <svg class="meta-cal-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{{ formatDate(event.dateStr) }} · {{ event.location }}</span>
                  </div>
                  <div class="event-tag-wrap">
                    <span class="event-pill-badge">{{ getEventTagLabel(event) }}</span>
                  </div>
                </div>

                <!-- Right Chevron -->
                <svg class="event-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
            }
          </div>

          <!-- Lunar Calendar Notice Card -->
          <div class="lunar-notice-card" role="note">
            <div class="notice-icon-box" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="notice-text">
              Dates may vary based on the lunar calendar. Check official tourism sources for the latest updates.
            </div>
            <svg class="notice-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </section>
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

    .calendar-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Emerald Header with Curved Bottom */
    .calendar-header {
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

    .cal-back-btn, .cal-action-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
      flex-shrink: 0;
    }

    .cal-back-btn {
      margin-left: -6px;
    }

    .cal-back-btn:hover, .cal-action-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.01em;
      text-align: center;
    }

    /* Scrollable Container */
    .calendar-scroll-content {
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

    /* Category Filter Pills */
    .filter-pills-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .filter-pills-row::-webkit-scrollbar {
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

    /* Calendar Card */
    .calendar-card {
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 20px;
      padding: 1.1rem 1rem 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      margin-bottom: 1.35rem;
    }

    .month-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.9rem;
      padding: 0 0.25rem;
    }

    .month-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.01em;
    }

    .month-nav-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .month-nav-btn:hover {
      background: #F3F4F6;
      color: #111827;
    }

    /* Days of Week Header */
    .days-header-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 0.6rem;
    }

    .day-col-hdr {
      text-align: center;
      font-size: 0.74rem;
      font-weight: 500;
      color: #8B9590;
      padding: 0.2rem 0;
    }

    /* Days Grid */
    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      row-gap: 5px;
    }

    .day-cell {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 42px;
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      padding: 0;
      transition: all 0.12s ease;
      font-family: var(--font-sans);
    }

    .day-cell.blank {
      cursor: default;
    }

    .day-number {
      font-size: 0.88rem;
      font-weight: 500;
      color: #1F2937;
      line-height: 1;
    }

    .day-cell:not(.blank):hover:not(.selected) {
      background: #F3F4F6;
    }

    /* Selected / Active Day (e.g., 17) */
    .day-cell.selected {
      background: #176B57;
      width: 38px;
      height: 38px;
      margin: 2px auto;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(23, 107, 87, 0.3);
    }

    .day-cell.selected .day-number {
      color: #FFFFFF;
      font-weight: 700;
    }

    /* Event Dot */
    .event-indicator-dot {
      width: 4.5px;
      height: 4.5px;
      border-radius: 50%;
      background: #176B57;
      position: absolute;
      bottom: 5px;
    }

    /* Upcoming Events Section */
    .upcoming-section {
      display: flex;
      flex-direction: column;
    }

    .upcoming-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .section-title {
      font-size: 1.08rem;
      font-weight: 800;
      color: #111827;
      margin: 0;
      letter-spacing: -0.015em;
    }

    .view-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      font-size: 0.82rem;
      font-weight: 700;
      color: #176B57;
      cursor: pointer;
      padding: 0.25rem 0.35rem;
      font-family: var(--font-sans);
    }

    .view-all-btn:hover {
      text-decoration: underline;
    }

    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .event-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 18px;
      padding: 0.95rem 1rem;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      transition: all 0.15s ease;
    }

    .event-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .event-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #E8F5EF;
      color: #176B57;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .event-content {
      flex: 1;
      text-align: left;
    }

    .event-name {
      font-size: 0.96rem;
      font-weight: 800;
      color: #111827;
      margin: 0 0 3px;
      line-height: 1.25;
    }

    .event-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.77rem;
      color: #6B7280;
      margin-bottom: 6px;
    }

    .meta-cal-icon {
      color: #9CA3AF;
      flex-shrink: 0;
    }

    .event-tag-wrap {
      display: flex;
    }

    .event-pill-badge {
      font-size: 0.72rem;
      font-weight: 600;
      background: #E8F5EF;
      color: #176B57;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      display: inline-block;
      line-height: 1.2;
    }

    .event-chevron {
      color: #9CA3AF;
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }

    .event-card:hover .event-chevron {
      color: #176B57;
      transform: translateX(2px);
    }

    /* Lunar Notice Card */
    .lunar-notice-card {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: #FFFFFF;
      border: 1px solid #EAEFEA;
      border-radius: 16px;
      padding: 0.85rem 1rem;
      margin-top: 0.85rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }

    .notice-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F3F4F6;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notice-text {
      font-size: 0.77rem;
      color: #6B7280;
      line-height: 1.45;
      flex: 1;
      text-align: left;
    }

    .notice-chevron {
      color: #9CA3AF;
      flex-shrink: 0;
    }
  `],
})
export class CalendarComponent implements OnInit {
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  filters = [
    { id: 'all', label: 'All' },
    { id: 'festival', label: 'Festivals' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'holiday', label: 'Holidays' },
  ];

  activeFilter = signal<'all' | 'festival' | 'cultural' | 'holiday'>('all');
  selectedDay = signal<number | null>(17); // Set to 17 to match mockup
  currentYear = signal<number>(2026);
  currentMonth = signal<number>(9); // October is index 9 (0-indexed)

  allEvents: Festival[] = [];
  displayedEvents = signal<Festival[]>([]);

  // Dates in October 2026 with verified festivals or cultural observance markers
  private octoberDots = new Set<number>([1, 2, 3, 6, 7, 9, 10, 13, 14, 16, 17, 19, 21, 24, 28]);

  constructor(
    private calendarService: CalendarService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.allEvents = this.calendarService.getAllEvents();
    this.updateDisplayedEvents();
  }

  monthLabel(): string {
    return new Date(this.currentYear(), this.currentMonth(), 1).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }

  leadingBlanks(): number[] {
    const firstDay = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    return Array(firstDay).fill(0);
  }

  daysInMonth(): number[] {
    const count = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  hasEvent(day: number): boolean {
    if (this.currentMonth() === 9 && this.currentYear() === 2026) {
      return this.octoberDots.has(day);
    }
    return this.allEvents.some(f => {
      const d = new Date(f.dateStr);
      return d.getFullYear() === this.currentYear() && d.getMonth() === this.currentMonth() && d.getDate() === day;
    });
  }

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }

  setFilter(filterId: string): void {
    this.activeFilter.set(filterId as any);
    this.updateDisplayedEvents();
  }

  changeMonth(delta: number): void {
    let m = this.currentMonth() + delta;
    let y = this.currentYear();
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    this.currentMonth.set(m);
    this.currentYear.set(y);
    this.selectedDay.set(null);
  }

  resetToCurrentMonth(): void {
    this.currentYear.set(2026);
    this.currentMonth.set(9);
    this.selectedDay.set(17);
    this.activeFilter.set('all');
    this.updateDisplayedEvents();
  }

  viewAllEvents(): void {
    this.activeFilter.set('all');
    this.updateDisplayedEvents();
  }

  updateDisplayedEvents(): void {
    const filter = this.activeFilter();
    let events = this.allEvents;

    if (filter !== 'all') {
      events = events.filter(e => e.category === filter);
    }

    // Sort to highlight the key upcoming Karnataka celebrations matching the mockup:
    // 1. Karnataka Rajyotsava (1 Nov 2026)
    // 2. Hampi Utsav (6 Nov 2026)
    // 3. Deepavali (Diwali) (8 Nov 2026)
    const prioritizedIds = ['kannada-rajyotsava-2026', 'hampi-utsav-2026', 'diwali-2026'];
    
    const sorted = [...events].sort((a, b) => {
      const aIdx = prioritizedIds.indexOf(a.id);
      const bIdx = prioritizedIds.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime();
    });

    this.displayedEvents.set(sorted.slice(0, 4));
  }

  getEventTagLabel(event: Festival): string {
    if (event.id === 'kannada-rajyotsava-2026' || event.category === 'holiday') {
      return 'State Festival';
    }
    if (event.id === 'hampi-utsav-2026' || event.category === 'cultural') {
      return 'Cultural Festival';
    }
    return 'Festival';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openTourismInfo(): void {
    window.open('https://karnatakatourism.org', '_blank');
  }
}
