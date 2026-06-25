import L from "leaflet";
import { Crosshair, MapPin } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Button } from "./Button";

const defaultCenter = { lat: 28.6139, lng: 77.209 };

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41]
});

function PinEvents({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

export function LocationPicker({ value, onChange, className = "", actionLabel = "Use my location" }) {
  const selected = value?.lat && value?.lng ? { lat: Number(value.lat), lng: Number(value.lng) } : defaultCenter;

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-pink-100 bg-white ${className}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-pink-100 p-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm font-bold text-neutral-700">
          <MapPin size={16} />
          Click on the map to place the pin
        </p>
        <Button type="button" variant="secondary" onClick={useCurrentLocation}>
          <Crosshair size={18} />
          {actionLabel}
        </Button>
      </div>
      <div className="location-picker-map">
        <MapContainer center={[selected.lat, selected.lng]} zoom={13} scrollWheelZoom key={`${selected.lat}-${selected.lng}`}>
          <TileLayer attribution="OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <PinEvents onChange={onChange} />
          <Marker position={[selected.lat, selected.lng]} icon={markerIcon} />
        </MapContainer>
      </div>
      <div className="grid gap-2 bg-pink-50 p-3 text-xs font-semibold text-neutral-600 sm:grid-cols-2">
        <span>Latitude: {selected.lat.toFixed(5)}</span>
        <span>Longitude: {selected.lng.toFixed(5)}</span>
      </div>
    </div>
  );
}
