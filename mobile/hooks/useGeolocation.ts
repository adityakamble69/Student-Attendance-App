// hooks/useGeolocation.ts — Phase 5 (GPS attendance).
// Wraps device geolocation + permission request per rules.md
// ("no permission calls without a clear pre-permission explanation").
import { useState } from 'react';

export function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestLocation() {
    // TODO Phase 5: integrate react-native-geolocation-service,
    // show pre-permission explanation screen before calling this.
    setError('Not implemented yet — Phase 5');
  }

  return { coords, error, requestLocation };
}
