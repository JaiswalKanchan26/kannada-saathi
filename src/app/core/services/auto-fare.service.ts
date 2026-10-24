import { Injectable } from '@angular/core';

export interface FareEstimate {
  distanceKm: number;
  durationMin: number;
  minFare: number;
  maxFare: number;
  isManual: boolean;
}

export interface Location {
  name: string;
  lat?: number;
  lng?: number;
}

/**
 * AutoFareService — calculates auto-rickshaw fare estimates.
 *
 * Fare model (Bengaluru BMTC / auto fare schedule, as of 2024):
 *   - Minimum fare: ₹30 for first 2 km
 *   - Per additional km: ₹15
 * The service uses OSRM (free, no API key) for route distance when online.
 * Falls back to manual-distance input.
 */
@Injectable({ providedIn: 'root' })
export class AutoFareService {
  // Fare constants (Bengaluru 2024 approximate rates)
  private readonly BASE_FARE = 30;       // ₹ for first 2 km
  private readonly BASE_DISTANCE = 2;    // km
  private readonly PER_KM_RATE = 15;     // ₹ per additional km
  private readonly NIGHT_SURCHARGE = 0.10; // 10% between 10 PM – 5 AM

  /** Geocode a place name using Nominatim (free, no key). */
  async geocode(query: string): Promise<Location | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' Bengaluru')}&format=json&limit=1&addressdetails=1`;
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!data.length) return null;
      return {
        name: data[0].display_name.split(',').slice(0, 2).join(','),
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } catch {
      return null;
    }
  }

  /** Get route distance using OSRM (free routing, no API key). */
  async getRouteDistance(from: Location, to: Location): Promise<{ distanceKm: number; durationMin: number } | null> {
    if (!from.lat || !from.lng || !to.lat || !to.lng) return null;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data.code !== 'Ok' || !data.routes?.length) return null;
      const route = data.routes[0];
      return {
        distanceKm: Math.round((route.distance / 1000) * 10) / 10,
        durationMin: Math.round(route.duration / 60),
      };
    } catch {
      return null;
    }
  }

  /**
   * Calculate fare estimate.
   * @param distanceKm  Route distance in km
   * @param isNight     Whether it's after 10 PM or before 5 AM
   */
  calculateFare(distanceKm: number, isNight = false): { min: number; max: number } {
    let base: number;
    if (distanceKm <= this.BASE_DISTANCE) {
      base = this.BASE_FARE;
    } else {
      base = this.BASE_FARE + (distanceKm - this.BASE_DISTANCE) * this.PER_KM_RATE;
    }
    if (isNight) {
      base = base * (1 + this.NIGHT_SURCHARGE);
    }
    // ±10% range to convey it is an estimate
    const min = Math.round(base * 0.9 / 5) * 5;
    const max = Math.round(base * 1.1 / 5) * 5;
    return { min, max };
  }

  /** Full estimate flow given two locations. */
  async estimateFare(from: Location, to: Location, manualDistanceKm?: number): Promise<FareEstimate> {
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 22 || hour < 5;

    if (manualDistanceKm != null && manualDistanceKm > 0) {
      const fare = this.calculateFare(manualDistanceKm, isNight);
      return {
        distanceKm: manualDistanceKm,
        durationMin: Math.round(manualDistanceKm * 3), // rough 3 min/km in Bengaluru
        minFare: fare.min,
        maxFare: fare.max,
        isManual: true,
      };
    }

    const route = await this.getRouteDistance(from, to);
    if (!route) {
      // Return null-safe fallback
      const fallbackKm = 5;
      const fare = this.calculateFare(fallbackKm, isNight);
      return {
        distanceKm: 0,
        durationMin: 0,
        minFare: fare.min,
        maxFare: fare.max,
        isManual: true,
      };
    }

    const fare = this.calculateFare(route.distanceKm, isNight);
    return {
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      minFare: fare.min,
      maxFare: fare.max,
      isManual: false,
    };
  }

  isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 5;
  }
}
