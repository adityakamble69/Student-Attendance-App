// lib/hooks/useGeolocation.ts — Phase 5 (GPS attendance).
// Wraps the browser Geolocation API per rules.md ("no permission calls
// without a clear pre-permission explanation" — show that explanation
// in the component before calling requestLocation()).

export interface Coords {
  lat: number;
  lng: number;
}

export function requestLocation(): Promise<Coords> {
  // TODO Phase 5: surface a pre-permission explanation screen before
  // calling this, same rule as the old mobile hook.
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported — Phase 5'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message))
    );
  });
}
