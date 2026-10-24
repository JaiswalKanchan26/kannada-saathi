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

        <!-- 3 Stats Cards in a Grid matching Mockup -->
        <div class="stats-grid">
          <!-- Distance -->
          <div class="stat-card">
            <div class="stat-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <span class="stat-label">Distance</span>
            <span class="stat-value">{{ currentRoute().distanceKm }} km</span>
          </div>

          <!-- Estimated Time -->
          <div class="stat-card">
            <div class="stat-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
            <span class="stat-label">Estimated Time</span>
            <span class="stat-value">{{ currentRoute().timeMin }} min</span>
          </div>

          <!-- Estimated Fare -->
          <div class="stat-card">
            <div class="stat-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
              </svg>
            </div>
            <span class="stat-label">Estimated Fare</span>
            <span class="stat-value">₹ {{ currentRoute().fareMin }} - {{ currentRoute().fareMax }}</span>
          </div>
        </div>

        <!-- Big Green Button: Get Directions matching Mockup -->
        <button class="directions-pill-btn" (click)="openDirections()" id="btn-af-directions">
          Get Directions
        </button>

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
      background: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .af-viewport {
      height: 100dvh;
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: #F8F9FA;
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
    }

    .stat-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 0.85rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.3rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }

    .stat-icon-wrap {
      color: var(--color-primary, #176B57);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #6B7280;
    }

    .stat-value {
      font-size: 0.95rem;
      font-weight: 800;
      color: #111827;
      white-space: nowrap;
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

  popularRoutes: RoutePreset[] = [
    { from: 'M.G. Road, Bengaluru', to: 'Lalbagh, Bengaluru', distanceKm: 4.2, timeMin: 15, fareMin: 60, fareMax: 80 },
    { from: 'Indiranagar, Bengaluru', to: 'Koramangala, Bengaluru', distanceKm: 6.8, timeMin: 22, fareMin: 95, fareMax: 120 },
    { from: 'Majestic, Bengaluru', to: 'Malleshwaram, Bengaluru', distanceKm: 3.5, timeMin: 12, fareMin: 50, fareMax: 70 },
    { from: 'Electronic City, Bengaluru', to: 'Silk Board, Bengaluru', distanceKm: 8.5, timeMin: 28, fareMin: 130, fareMax: 160 }
  ];

  currentRoute = signal<RoutePreset>(this.popularRoutes[0]);

  fareService = inject(AutoFareService);
  router = inject(Router);

  ngOnInit(): void {}

  selectPreset(preset: RoutePreset): void {
    this.fromLocation = preset.from;
    this.toLocation = preset.to;
    this.currentRoute.set(preset);
  }

  openDirections(): void {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(this.fromLocation)}&destination=${encodeURIComponent(this.toLocation)}`;
    window.open(url, '_blank');
  }
}
