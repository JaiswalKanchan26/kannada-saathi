import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { SITUATIONS } from '../../core/data/situations.data';
import { Situation } from '../../core/models/models';

@Component({
  selector: 'app-situations',
  standalone: true,
  imports: [RouterLink, FormsModule, BottomNavComponent],
  template: `
    <div class="situations-viewport" role="main">
      <!-- Dark Green Solid Top Header -->
      <header class="situations-header">
        <button class="header-back-btn" (click)="goBack()" aria-label="Go back to home" id="btn-situations-back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 class="header-title">Situations</h1>

        <button class="header-search-btn" (click)="focusSearch()" aria-label="Search situations" id="btn-header-search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </header>

      <!-- Scrollable Main Content -->
      <div class="situations-scroll-content animate-fade-in">
        <!-- Search Bar -->
        <div class="search-wrap" role="search">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            #searchInput
            type="search"
            placeholder="Search situations..."
            aria-label="Search situations"
            id="situations-search-input"
            [(ngModel)]="searchQuery"
          />
        </div>

        <!-- Situations List -->
        <div class="situations-list" role="list">
          @for (s of filteredSituations(); track s.id) {
            <a
              [routerLink]="['/situations', s.id]"
              class="situation-card"
              [id]="'situation-' + s.id"
              role="listitem"
              [attr.aria-label]="s.titleEn + ', ' + s.titleKn"
            >
              <!-- Icon Box in soft mint background -->
              <div class="situation-icon-box" aria-hidden="true">
                @if (s.id === 'auto-transport') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <path d="M9 17h6"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                } @else if (s.id === 'food-dining') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2v20M21 2c0 2.5-1.5 4.5-3 5v15"/>
                    <path d="M6 2v7a3 3 0 0 0 6 0V2"/>
                    <path d="M9 9v13"/>
                  </svg>
                } @else if (s.id === 'shopping') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8h12l1.5 12H4.5L6 8z"/>
                    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
                  </svg>
                } @else if (s.id === 'directions') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                } @else if (s.id === 'accommodation') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
                  </svg>
                } @else if (s.id === 'education-work') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                } @else if (s.id === 'healthcare') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                } @else {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                }
              </div>

              <!-- Title & Kannada Subtitle -->
              <div class="situation-text-col">
                <span class="situation-title-en">{{ s.titleEn }}</span>
                <span class="situation-title-kn font-kannada">{{ s.titleKn }}</span>
              </div>

              <!-- Right Chevron -->
              <svg class="situation-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </a>
          }

          @if (filteredSituations().length === 0) {
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p class="empty-title">No situations found</p>
              <p class="empty-desc">Try searching for words like 'auto', 'food', or 'directions'.</p>
            </div>
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

    .situations-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F9FAF9;
      position: relative;
    }

    /* Solid Dark Green Top Header */
    .situations-header {
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

    .header-back-btn, .header-search-btn {
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

    .header-back-btn {
      margin-left: -6px;
    }

    .header-back-btn:hover, .header-search-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.015em;
    }

    /* Scrollable Container */
    .situations-scroll-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.85rem 1rem calc(var(--nav-height) + var(--safe-bottom) + 1.25rem);
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    /* Search Bar */
    .search-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 9999px;
      padding: 0 1rem;
      height: 44px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      margin-bottom: 1rem;
      transition: border-color 0.15s ease;
    }

    .search-wrap:focus-within {
      border-color: #176B57;
      box-shadow: 0 2px 10px rgba(23, 107, 87, 0.1);
    }

    .search-icon {
      flex-shrink: 0;
    }

    .search-wrap input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      font-size: 0.88rem;
      color: #1F2937;
      font-family: var(--font-sans);
    }

    .search-wrap input::placeholder {
      color: #9CA3AF;
    }

    /* Situations List */
    .situations-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .situation-card {
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

    .situation-card:hover {
      border-color: #B2E4D0;
      box-shadow: 0 4px 14px rgba(23, 107, 87, 0.08);
      transform: translateY(-1px);
    }

    .situation-icon-box {
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

    .situation-text-col {
      flex: 1;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .situation-title-en {
      font-size: 0.98rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.25;
    }

    .situation-title-kn {
      font-size: 0.86rem;
      font-weight: 600;
      color: #176B57;
      line-height: 1.25;
    }

    .situation-chevron {
      color: #9CA3AF;
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }

    .situation-card:hover .situation-chevron {
      color: #176B57;
      transform: translateX(2px);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1F2937;
      margin: 0.75rem 0 0.25rem;
    }

    .empty-desc {
      font-size: 0.82rem;
      color: #6B7280;
      margin: 0;
    }
  `],
})
export class SituationsComponent {
  situations = SITUATIONS;
  searchQuery = '';

  constructor(private router: Router) {}

  filteredSituations(): Situation[] {
    if (!this.searchQuery.trim()) return this.situations;
    const q = this.searchQuery.toLowerCase().trim();
    return this.situations.filter(
      s =>
        s.titleEn.toLowerCase().includes(q) ||
        s.descriptionEn.toLowerCase().includes(q) ||
        s.titleKn.includes(q)
    );
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  focusSearch(): void {
    const el = document.getElementById('situations-search-input');
    if (el) el.focus();
  }
}
