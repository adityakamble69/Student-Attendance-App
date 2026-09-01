// services/geoService.js
// Phase 5 — Anti-Proxy Smart Attendance: Server-Side GPS & Geofence Validation.

// Configurable default campus center (e.g. Institute Main Building)
// Can be customized via env vars or campus settings
const CAMPUS_DEFAULT_LAT = parseFloat(process.env.CAMPUS_LAT) || 28.6139;
const CAMPUS_DEFAULT_LNG = parseFloat(process.env.CAMPUS_LNG) || 77.209;
const CAMPUS_DEFAULT_RADIUS_METERS = parseInt(process.env.CAMPUS_RADIUS_METERS, 10) || 300; // 300 meters

/**
 * Calculates distance in meters between two lat/lng coordinates using the Haversine formula.
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Validates whether the student device coordinates fall within the campus geofence radius.
 */
function validateLocation(
  clientLat,
  clientLng,
  campusLat = CAMPUS_DEFAULT_LAT,
  campusLng = CAMPUS_DEFAULT_LNG,
  allowedRadius = CAMPUS_DEFAULT_RADIUS_METERS
) {
  const distance = calculateDistanceMeters(clientLat, clientLng, campusLat, campusLng);
  const isInside = distance <= allowedRadius;

  return {
    isInside,
    distanceMeters: distance,
    allowedRadiusMeters: allowedRadius,
    campusCoordinates: { lat: campusLat, lng: campusLng },
  };
}

module.exports = {
  calculateDistanceMeters,
  validateLocation,
  CAMPUS_DEFAULT_LAT,
  CAMPUS_DEFAULT_LNG,
  CAMPUS_DEFAULT_RADIUS_METERS,
};
