export function distanceKm(a, b) {
  const radius = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * radius * Math.asin(Math.sqrt(h));
}

export function isValidCoordinate(location) {
  return (
    Number.isFinite(location?.lat) &&
    Number.isFinite(location?.lng) &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
}

export function toCoordinate(lat, lng) {
  const location = { lat: Number(lat), lng: Number(lng) };
  return isValidCoordinate(location) ? location : null;
}
