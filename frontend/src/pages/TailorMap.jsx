import L from "leaflet";
import { LocateFixed, MapPin, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { api } from "../services/api";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41]
});

function SearchCenterPicker({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

export function TailorMap({ setPage, setSelectedTailor }) {
  const [tailors, setTailors] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    service: "",
    availability: "available",
    minRating: "",
    maxPrice: "",
    radiusKm: 20
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const center = useMemo(() => (location ? [location.lat, location.lng] : [28.6139, 77.209]), [location]);

  async function load(nextLocation = location) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.service) params.set("service", filters.service);
      if (filters.availability) params.set("availability", filters.availability);
      if (nextLocation) {
        params.set("lat", nextLocation.lat);
        params.set("lng", nextLocation.lng);
        params.set("radiusKm", filters.radiusKm || 20);
      }
      const data = await api.tailors(params.toString() ? `?${params.toString()}` : "");
      let results = data.tailors || [];
      if (filters.minRating) {
        results = results.filter((tailor) => Number(tailor.rating || 0) >= Number(filters.minRating));
      }
      if (filters.maxPrice) {
        const max = Number(filters.maxPrice);
        results = results.filter((tailor) => {
          const numbers = String(tailor.priceRange || "")
            .match(/\d+/g)
            ?.map(Number);
          return !numbers?.length || Math.min(...numbers) <= max;
        });
      }
      setTailors(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialLocation() {
      try {
        const data = await api.customerProfile();
        const savedLocation = data.customer?.location;
        if (savedLocation?.lat && savedLocation?.lng) {
          setLocation(savedLocation);
          load(savedLocation);
          return;
        }
      } catch {
        // Public browsing still works without a saved customer profile.
      }
      load(null);
    }

    loadInitialLocation();
  }, []);

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function updateSearchLocation(nextLocation) {
    setLocation(nextLocation);
    load(nextLocation);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        updateSearchLocation(next);
      },
      () => {
        setLoading(false);
        setError("Location permission denied. You can still search by service.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function view(tailor) {
    setSelectedTailor(tailor);
    setPage("tailorProfile");
  }

  function saveTailor(tailor) {
    const saved = JSON.parse(localStorage.getItem("silrahi_saved_tailors") || "[]");
    const next = [tailor, ...saved.filter((item) => item.id !== tailor.id)].slice(0, 12);
    localStorage.setItem("silrahi_saved_tailors", JSON.stringify(next));
   }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 grid gap-4 rounded-lg border border-pink-100 bg-white p-4 shadow-sm lg:grid-cols-[1.1fr_0.9fr_0.7fr_0.7fr_0.6fr_auto_auto]">
        <Field label="Search">
          <input className={inputClass} placeholder="name, shop, area..." value={filters.search} onChange={(e) => update("search", e.target.value)} />
        </Field>
        <Field label="Service">
          <input className={inputClass} placeholder="blouse, kurti, alteration..." value={filters.service} onChange={(e) => update("service", e.target.value)} />
        </Field>
        <Field label="Availability">
          <select className={inputClass} value={filters.availability} onChange={(e) => update("availability", e.target.value)}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="all">All active</option>
          </select>
        </Field>
        <Field label="Min rating">
          <select className={inputClass} value={filters.minRating} onChange={(e) => update("minRating", e.target.value)}>
            <option value="">Any</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </Field>
        <Field label="Max price">
          <input type="number" min="0" className={inputClass} placeholder="1000" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} />
        </Field>
        <Field label="Radius km">
          <input type="number" min="1" className={inputClass} value={filters.radiusKm} onChange={(e) => update("radiusKm", e.target.value)} />
        </Field>
        <Button onClick={() => load()} className="self-end" disabled={loading}>
          <Search size={18} />
          {loading ? "Searching" : "Search"}
        </Button>
        <Button type="button" variant="secondary" onClick={useMyLocation} className="self-end" disabled={loading}>
          <LocateFixed size={18} />
          Near me
        </Button>
      </div>
      <div className="mb-4 flex flex-col justify-between gap-2 rounded-lg border border-pink-100 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 shadow-sm sm:flex-row sm:items-center">
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          {location
            ? `Searching within ${filters.radiusKm || 20} km of pinned location (${Number(location.lat).toFixed(4)}, ${Number(location.lng).toFixed(4)})`
            : "Click the map or use Near me to search nearby tailors."}
        </span>
        {location && (
          <Button type="button" variant="secondary" onClick={() => load(location)} disabled={loading}>
            Search from pin
          </Button>
        )}
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="map-panel overflow-hidden rounded-lg border border-pink-100 bg-white p-2 shadow-sm">
          <MapContainer center={center} zoom={location ? 13 : 12} scrollWheelZoom className="h-full" key={`${center[0]}-${center[1]}`}>
            <TileLayer attribution="OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchCenterPicker onChange={updateSearchLocation} />
            {location && (
              <Marker position={[location.lat, location.lng]} icon={markerIcon}>
                <Popup>Search center</Popup>
              </Marker>
            )}
            {tailors.filter((t) => t.location?.lat && t.location?.lng).map((tailor) => (
              <Marker key={tailor.id} position={[tailor.location.lat, tailor.location.lng]} icon={markerIcon}>
                <Popup>
                  <strong>{tailor.name}</strong>
                  <p>{tailor.shopName || "Home tailor"} - {(tailor.skills || []).slice(0, 2).join(", ") || "Stitching"}</p>
                  <p>Rating: {tailor.rating || 0} - {tailor.priceRange || "Price on request"}</p>
                  <button type="button" onClick={() => view(tailor)}>View Profile</button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <aside className="space-y-3">
          {!loading && tailors.length === 0 && (
            <div className="rounded-lg border border-dashed border-pink-200 bg-white p-6 text-center shadow-sm">
              <p className="font-bold text-neutral-950">No tailors found</p>
              <p className="mt-1 text-sm text-neutral-600">Try a wider radius or another service.</p>
            </div>
          )}
          {tailors.map((tailor) => (
            <article key={tailor.id} className="rounded-lg border border-pink-100 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <img src={tailor.profilePhotoUrl || "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=160&q=80"} className="h-16 w-16 rounded-lg object-cover" alt={tailor.name} />
                <div>
                  <h3 className="font-bold">{tailor.name}</h3>
                  <p className="text-sm font-semibold text-neutral-700">{tailor.shopName || "Home tailor"} - {tailor.shopType || "Home-based"}</p>
                  <p className="text-sm text-neutral-600">{(tailor.skills || []).join(", ") || "Skills not added"}</p>
                  <p className="flex items-center gap-1 text-sm font-semibold text-rosewood"><Star size={14} /> {tailor.rating || 0} - {tailor.priceRange || "Price on request"}</p>
                  {tailor.distanceKm && <p className="text-xs font-semibold text-neutral-500">{tailor.distanceKm} km away</p>}
                </div>
              </div>
              {(tailor.serviceFees || []).length > 0 && (
                <div className="mt-3 grid gap-1 rounded-lg bg-pink-50 p-3 text-sm">
                  {(tailor.serviceFees || []).slice(0, 3).map((item, index) => (
                    <div key={`${item.service}-${index}`} className="flex justify-between gap-3">
                      <span>{item.service}</span>
                      <span className="font-bold text-rosewood">{item.fee}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button onClick={() => view(tailor)} variant="soft" className="w-full">View / Book</Button>
                <Button type="button" onClick={() => saveTailor(tailor)} variant="secondary" className="w-full">Save</Button>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}
