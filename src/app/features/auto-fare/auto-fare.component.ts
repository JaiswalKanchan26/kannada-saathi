import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { AutoFareService, FareEstimate } from '../../core/services/auto-fare.service';

interface RoutePreset {
  from: string;
  to: string;
  distanceKm: number;
  timeMin: number;
  fareMin: number;
  fareMax: number;
}

@Component({
  selector: 'app-auto-fare',
  standalone: true,
  imports: [FormsModule, BottomNavComponent],
  template: `
    <div class="af-viewport">
      <!-- Uniform Emerald Header matching Home Screen -->
      <header class="af-header">
        <button class="back-btn" id="btn-af-back" (click)="router.navigate(['/home'])" aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="af-title">Auto Fare Simulator</h1>
        <div style="width: 38px"></div>
      </header>

      <div class="af-scroll animate-fade-in">
        <!-- Location Picker Card 1: From -->
        <div class="location-card" id="card-af-from">
          <div class="loc-icon-wrap from-pin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="loc-text-col">
            <span class="loc-label">From</span>
            <input
              type="text"
              class="loc-input"
              [(ngModel)]="fromLocation"
              placeholder="e.g. M.G. Road, Bengaluru"
              id="af-input-from"
            />
          </div>
          <svg class="loc-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <!-- Location Picker Card 2: To -->
        <div class="location-card" id="card-af-to">
          <div class="loc-icon-wrap to-pin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="loc-text-col">
            <span class="loc-label">To</span>
            <input
              type="text"
              class="loc-input"
              [(ngModel)]="toLocation"
              placeholder="e.g. Lalbagh, Bengaluru"
              id="af-input-to"
            />
          </div>
          <svg class="loc-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <!-- Interactive Map Preview matching Mockup -->
        <div class="map-preview-card">
          <div class="map-canvas">
            <!-- Simulated Bengaluru City Map Lines -->
            <svg class="map-roads-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
              <!-- Grid streets -->
              <line x1="20" y1="50" x2="380" y2="70" stroke="#E2E8F0" stroke-width="6"/>
              <line x1="40" y1="120" x2="360" y2="140" stroke="#E2E8F0" stroke-width="8"/>
              <line x1="80" y1="20" x2="100" y2="180" stroke="#E2E8F0" stroke-width="5"/>
              <line x1="220" y1="10" x2="200" y2="190" stroke="#E2E8F0" stroke-width="7"/>
              <line x1="320" y1="30" x2="310" y2="170" stroke="#E2E8F0" stroke-width="5"/>
              <!-- Park / Lake water body -->
              <path d="M310 80 Q360 90 350 140 Q320 160 300 130 Z" fill="#BFDBFE" opacity="0.6"/>

              <!-- Active Blue Route Polyline connecting Origin & Destination -->
              <path
                d="M300 70 L260 72 L230 110 L150 135 L80 140"
                fill="none"
                stroke="#2563EB"
                stroke-width="4.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Origin Marker: M.G. Road (Red pin) -->
              <g transform="translate(300, 52)">
                <circle cx="0" cy="0" r="14" fill="#EF4444"/>
                <circle cx="0" cy="0" r="5" fill="#FFFFFF"/>
                <text x="-48" y="-4" fill="#1E293B" font-size="11" font-weight="700">M.G. Road</text>
              </g>

              <!-- Destination Marker: Lalbagh (Green pin) -->
              <g transform="translate(80, 140)">
                <circle cx="0" cy="0" r="14" fill="#0D6938"/>
                <circle cx="0" cy="0" r="5" fill="#FFFFFF"/>
                <text x="18" y="4" fill="#1E293B" font-size="11" font-weight="700">Lalbagh</text>
              </g>

              <!-- Bengaluru Auto Rickshaw Icon on Route -->
              <g transform="translate(205, 110)">
                <rect x="-14" y="-10" width="28" height="20" rx="5" fill="#F59E0B" stroke="#000" stroke-width="1.5"/>
                <rect x="-14" y="-10" width="28" height="7" rx="3" fill="#000"/>
                <circle cx="-8" cy="10" r="3.5" fill="#1E293B"/>
                <circle cx="8" cy="10" r="3.5" fill="#1E293B"/>
                <circle cx="0" cy="-2" r="3" fill="#FEF08A"/>
              </g>
            </svg>
          </div>
        </div>

        <!-- Big Green Button: Get Directions matching Mockup -->
        <button class="directions-pill-btn" (click)="openDirections()" id="btn-af-directions">
          Get Directions
        </button>

        <!-- Distance + Estimates Section (below Get Directions) -->
        <div class="distance-section-outer">
          <!-- Section Header -->
          <div class="dist-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
            </svg>
            <span>Estimate Fare</span>
          </div>

          <!-- 3 Cards Row matching mockup: Distance | Est. Time | Est. Fare -->
          <div class="three-card-row">
            <!-- Distance Input Card (editable, left) -->
            <div class="dist-card editable-dist-card" id="card-af-dist">
              <span class="card-mini-label">
                Distance
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-left:2px">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </span>
              <div class="editable-dist-row">
                <input
                  type="number"
                  id="af-distance-input"
                  class="dist-number-input"
                  [(ngModel)]="enteredDistance"
                  min="0.1"
                  max="100"
                  step="0.5"
                  placeholder="0"
                />
                <span class="dist-unit-label">km</span>
              </div>
            </div>

            <!-- Estimated Time Card -->
            <div class="dist-card est-card">
              <span class="card-mini-label">Est. Time</span>
              <span class="card-value">~{{ estimatedTime }} min</span>
            </div>

            <!-- Estimated Fare Card -->
            <div class="dist-card est-card">
              <span class="card-mini-label">Est. Fare</span>
              <span class="card-value fare-value">₹{{ estimatedFare.min }} - {{ estimatedFare.max }}</span>
            </div>
          </div>

          <!-- Day / Night Charges Banner -->
          <div class="charge-time-banner" [class.night-banner]="isNight">
            <div class="banner-icon-wrap">
              @if (isNight) {
                <!-- Moon icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              } @else {
                <!-- Sun icon -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              }
            </div>
            <div class="banner-text-col">
              <span class="banner-title">{{ isNight ? 'Night-time charges apply' : 'Day-time charges apply' }}</span>
              <span class="banner-subtitle">
                {{ isNight
                  ? 'Night surcharge (10 PM – 5 AM): +' + fareService.NIGHT_SURCHARGE_PCT + '% on base fare'
                  : 'Day fare: ₹' + fareService.BASE_FARE + ' for first ' + fareService.BASE_DISTANCE + ' km, then ₹' + fareService.PER_KM_RATE + '/km' }}
              </span>
            </div>
          </div>

          <!-- Day vs Night Rate Reference -->
          <div class="rate-table">
            <div class="rate-row">
              <div class="rate-badge day-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
                Day (5 AM – 10 PM)
              </div>
              <span class="rate-val">₹{{ fareService.BASE_FARE }} for {{ fareService.BASE_DISTANCE }} km · ₹{{ fareService.PER_KM_RATE }}/km after</span>
            </div>
            <div class="rate-divider"></div>
            <div class="rate-row">
              <div class="rate-badge night-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Night (10 PM – 5 AM)
              </div>
              <span class="rate-val">+{{ fareService.NIGHT_SURCHARGE_PCT }}% surcharge on total fare</span>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="estimate-disclaimer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Estimates only · Actual fare may vary · Day &amp; night charges differ</span>
          </div>
        </div>

        <!-- Quick Routes Preset Chips -->
        <div class="presets-section">
          <span class="presets-label">Popular routes in Bengaluru:</span>
          <div class="presets-chips">
            @for (preset of popularRoutes; track preset.from) {
              <button class="preset-chip" (click)="selectPreset(preset)">
                <span>{{ preset.from.split(',')[0] }} → {{ preset.to.split(',')[0] }}</span>
              </button>
            }
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
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .af-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: #FFFFFF;
      overflow: hidden;
      position: relative;
    }

    /* Uniform Emerald Header matching Home Screen */
    .af-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      min-height: 56px;
      flex-shrink: 0;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.15);
      z-index: 10;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.18);
      border: none;
      color: #FFFFFF;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .af-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      text-align: center;
      flex: 1;
    }

    .af-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 1.1rem 1rem calc(var(--nav-height, 64px) + 2rem);
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    /* Location Picker Cards */
    .location-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }

    .loc-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .from-pin {
      background: #F0FAF6;
      color: var(--color-primary, #176B57);
    }

    .to-pin {
      background: #F0FAF6;
      color: var(--color-primary, #176B57);
    }

    .loc-text-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .loc-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6B7280;
    }

    .loc-input {
      border: none;
      outline: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1F2937;
      background: transparent;
      padding: 0;
      width: 100%;
    }

    .loc-chevron {
      flex-shrink: 0;
    }

    /* Map Preview Card */
    .map-preview-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .map-canvas {
      position: relative;
      height: 200px;
      background: #F8FAFC;
    }

    .map-roads-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .estimate-disclaimer {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.73rem;
      font-weight: 600;
      color: #9CA3AF;
      padding: 0 0.2rem;
    }

    /* Get Directions Button */
    .directions-pill-btn {
      height: 52px;
      width: 100%;
      border-radius: 9999px;
      background: var(--color-primary, #176B57);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(23, 107, 87, 0.25);
      margin-top: 0.25rem;
    }

    .directions-pill-btn:active {
      background: #0f4f40;
    }

    /* Distance + Estimates Section (below Get Directions) */
    .distance-section-outer {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .dist-section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* 3-card row: Distance | Est. Time | Est. Fare */
    .three-card-row {
      display: flex;
      gap: 0.55rem;
      align-items: stretch;
    }

    .dist-card {
      flex: 1;
      border-radius: 14px;
      padding: 0.65rem 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* Left editable distance card — green border like mockup */
    .editable-dist-card {
      background: #FFFFFF;
      border: 2px solid var(--color-primary, #176B57);
    }

    .editable-dist-card:focus-within {
      box-shadow: 0 0 0 3px rgba(23, 107, 87, 0.12);
    }

    /* Right estimate cards — muted */
    .est-card {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
    }

    .card-mini-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #6B7280;
      letter-spacing: 0.02em;
    }

    .editable-dist-row {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }

    .dist-number-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 1.3rem;
      font-weight: 800;
      color: #111827;
      padding: 0;
      min-width: 0;
    }

    .dist-number-input::placeholder {
      color: #9CA3AF;
    }

    .dist-unit-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #6B7280;
      flex-shrink: 0;
    }

    .card-value {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
    }

    .fare-value {
      font-size: 0.95rem;
    }

    /* Day / Night Banner */
    .charge-time-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #FFF7ED;
      border: 1px solid #FED7AA;
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .charge-time-banner.night-banner {
      background: #EEF2FF;
      border-color: #C7D2FE;
    }

    .banner-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #F59E0B;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .night-banner .banner-icon-wrap {
      color: #818CF8;
    }

    .banner-text-col {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .banner-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #92400E;
    }

    .night-banner .banner-title {
      color: #3730A3;
    }

    .banner-subtitle {
      font-size: 0.74rem;
      color: #B45309;
    }

    .night-banner .banner-subtitle {
      color: #4338CA;
    }

    /* Rate Table */
    .rate-table {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .rate-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .rate-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.74rem;
      font-weight: 700;
      padding: 0.22rem 0.55rem;
      border-radius: 9999px;
    }

    .day-badge {
      background: #FEF3C7;
      color: #92400E;
    }

    .night-badge {
      background: #EEF2FF;
      color: #3730A3;
    }

    .rate-val {
      font-size: 0.76rem;
      font-weight: 600;
      color: #374151;
      text-align: right;
    }

    .rate-divider {
      height: 1px;
      background: #E5E7EB;
      margin: 0 -0.1rem;
    }

    /* Presets */
    .presets-section {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-top: 0.25rem;
    }

    .presets-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #6B7280;
    }

    .presets-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .preset-chip {
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      font-size: 0.82rem;
      color: #374151;
      cursor: pointer;
    }

    .preset-chip:active {
      background: #F0FAF6;
      border-color: var(--color-primary, #176B57);
      color: var(--color-primary, #176B57);
    }

    /* Dark Mode Overrides */
    [data-theme="dark"] .location-card,
    [data-theme="dark"] .map-preview-card,
    [data-theme="dark"] .distance-section-outer,
    [data-theme="dark"] .editable-dist-card,
    [data-theme="dark"] .preset-chip {
      background: var(--color-bg-card, #16241E) !important;
      border-color: var(--color-border-soft, #24382E) !important;
    }

    [data-theme="dark"] .map-canvas {
      background: #112019 !important;
    }

    [data-theme="dark"] .est-card,
    [data-theme="dark"] .rate-table {
      background: var(--color-bg-subtle, #14201A) !important;
      border-color: var(--color-border, #24382E) !important;
    }

    [data-theme="dark"] .from-pin,
    [data-theme="dark"] .to-pin {
      background: #1E382C !important;
      color: #34D399 !important;
    }

    [data-theme="dark"] .loc-input,
    [data-theme="dark"] .dist-number-input,
    [data-theme="dark"] .card-value,
    [data-theme="dark"] .preset-chip {
      color: var(--color-text-primary, #F3F6F4) !important;
    }

    [data-theme="dark"] .loc-label,
    [data-theme="dark"] .card-mini-label,
    [data-theme="dark"] .dist-unit-label,
    [data-theme="dark"] .rate-val,
    [data-theme="dark"] .presets-label {
      color: var(--color-text-secondary, #A3B5AC) !important;
    }

    [data-theme="dark"] .charge-time-banner {
      background: #1F2E22 !important;
      border-color: #2F4A37 !important;
    }

    [data-theme="dark"] .charge-time-banner.night-banner {
      background: #1E2338 !important;
      border-color: #2C3558 !important;
    }

    [data-theme="dark"] .charge-time-banner .banner-icon-wrap {
      background: #16241E !important;
    }

    [data-theme="dark"] .rate-divider {
      background: #24382E !important;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AutoFareComponent implements OnInit {
  fromLocation = 'M.G. Road, Bengaluru';
  toLocation = 'Lalbagh, Bengaluru';
  enteredDistance = 4.2;

  popularRoutes: RoutePreset[] = [
    { from: 'M.G. Road, Bengaluru', to: 'Lalbagh, Bengaluru', distanceKm: 4.2, timeMin: 15, fareMin: 60, fareMax: 80 },
    { from: 'Indiranagar, Bengaluru', to: 'Koramangala, Bengaluru', distanceKm: 6.8, timeMin: 22, fareMin: 95, fareMax: 120 },
    { from: 'Majestic, Bengaluru', to: 'Malleshwaram, Bengaluru', distanceKm: 3.5, timeMin: 12, fareMin: 50, fareMax: 70 },
    { from: 'Electronic City, Bengaluru', to: 'Silk Board, Bengaluru', distanceKm: 8.5, timeMin: 28, fareMin: 130, fareMax: 160 }
  ];

  currentRoute = signal<RoutePreset>(this.popularRoutes[0]);

  fareService = inject(AutoFareService);
  router = inject(Router);

  /** True when current local time is between 10 PM and 5 AM (night surcharge active). */
  get isNight(): boolean {
    return this.fareService.isNightTime();
  }

  get estimatedTime(): number {
    const d = Number(this.enteredDistance) || 0;
    return Math.max(1, Math.round(d * 3.5));
  }

  get estimatedFare(): { min: number; max: number } {
    const d = Number(this.enteredDistance) || 0;
    return this.fareService.calculateFare(d, this.isNight);
  }

  ngOnInit(): void {}

  selectPreset(preset: RoutePreset): void {
    this.fromLocation = preset.from;
    this.toLocation = preset.to;
    this.enteredDistance = preset.distanceKm;
    this.currentRoute.set(preset);
  }

  openDirections(): void {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(this.fromLocation)}&destination=${encodeURIComponent(this.toLocation)}`;
    window.open(url, '_blank');
  }
}
