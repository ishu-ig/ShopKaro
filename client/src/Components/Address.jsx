import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HeroSection from "./HeroSection";


// react-leaflet's default marker icon points at image paths that most
// bundlers don't resolve correctly. Pointing at the CDN copies is the
// standard workaround so the pin actually renders.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const GEOAPIFY_API_KEY = "e04b543b846f4fb187b19c00fe5a29af";
const API_BASE = process.env.REACT_APP_BACKEND_SERVER;
const DEFAULT_CENTER = [20.5937, 78.9629]; // India, used until a saved address or search sets a real point

const LABEL_ICONS = {
  Home: "bi-house-door-fill",
  Work: "bi-briefcase-fill",
  Other: "bi-geo-alt-fill",
};

// Where the current pin came from — drives which icon/message shows in the
// confirmation banner so the courier/customer can tell how precise it is.
const SOURCE_META = {
  gps: { icon: "bi-crosshair", label: "Using your current location" },
  search: { icon: "bi-search", label: "From your search" },
  map: { icon: "bi-geo-alt-fill", label: "Pinned on the map" },
};

const emptyForm = {
  label: "Home",
  address: "",
  city: "",
  state: "",
  pin: "",
  lat: null,
  lng: null,
  isDefault: false,
};

function getUserId() {
  return localStorage.getItem("userid");
}

function getToken() {
  return localStorage.getItem("token");
}

// ── Map click/drag handler ──────────────────────────────────────────────────
function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng, "map");
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onChange(lat, lng, "map");
        },
      }}
    />
  );
}

export default function Address() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locationSource, setLocationSource] = useState(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchTimer = useRef(null);

  const [deletingId, setDeletingId] = useState(null);
  const [locating, setLocating] = useState(false);

  // ── Load saved addresses ───────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setError("You need to be logged in to view saved addresses.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/address/user/${userId}`, {
        headers: { authorization: getToken() },
      });
      const json = await res.json();

      if (res.ok && json.result === "Done") {
        setAddresses(json.data || []);
      } else {
        setError(json.reason || "Could not load your addresses.");
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3500);
    return () => clearTimeout(t);
  }, [success, error]);

  // ── Form open/close ─────────────────────────────────────────────────────
  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setQuery("");
    setSuggestions([]);
    setLocationSource(null);
    setFormOpen(true);
  }

  function openEditForm(addr) {
    setEditingId(addr._id);
    setForm({
      label: addr.label || "Home",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pin: addr.pin || "",
      lat: addr.lat,
      lng: addr.lng,
      isDefault: !!addr.isDefault,
    });
    setQuery(addr.address || "");
    setSuggestions([]);
    setLocationSource(addr.lat != null ? "map" : null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSuggestions([]);
    setLocationSource(null);
  }

  // ── Address search (Geoapify autocomplete) ─────────────────────────────
  function handleQueryChange(e) {
    const value = e.target.value;
    setQuery(value);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            value
          )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
        );
        const json = await res.json();
        setSuggestions(json.features || []);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }

  function selectSuggestion(feature) {
    const p = feature.properties;
    setForm((f) => ({
      ...f,
      address: p.formatted || p.address_line1 || "",
      city: p.city || p.county || "",
      state: p.state || "",
      pin: p.postcode || "",
      lat: p.lat,
      lng: p.lon,
    }));
    setQuery(p.formatted || "");
    setSuggestions([]);
    setLocationSource("search");
  }

  // ── Reverse geocode when the pin is placed/dragged on the map, or when ──
  // the "use my current location" button fires GPS coordinates.
  async function handleMapChange(lat, lng, source = "map") {
    setForm((f) => ({ ...f, lat, lng }));
    setLocationSource(source);

    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
      );
      const json = await res.json();
      const p = json.features?.[0]?.properties;
      if (p) {
        setForm((f) => ({
          ...f,
          address: p.formatted || f.address,
          city: p.city || p.county || f.city,
          state: p.state || f.state,
          pin: p.postcode || f.pin,
        }));
        setQuery(p.formatted || "");
      }
    } catch {
      // Reverse geocoding is a convenience, not required — the pin position
      // is already saved even if this lookup fails.
    }
  }

  // ── "Use my current location" button ───────────────────────────────────
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }

    setError("");
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleMapChange(latitude, longitude, "gps");
        setLocating(false);
      },
      (geoError) => {
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location access was denied. Enable it in your browser settings, or pick a spot on the map instead.");
        } else {
          setError("Couldn't get your current location. Try picking a spot on the map instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // ── Save (create or update) ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.lat == null || form.lng == null) {
      setError("Pick a location on the map or search for an address first.");
      return;
    }

    setSaving(true);
    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${API_BASE}/api/address/${editingId}`
        : `${API_BASE}/api/address`;

      const body = isEditing
        ? { ...form }
        : { ...form, user: getUserId() };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: getToken(),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (res.ok && json.result === "Done") {
        setSuccess(isEditing ? "Address updated." : "Address added.");
        closeForm();
        fetchAddresses();
      } else {
        setError(
          typeof json.reason === "string"
            ? json.reason
            : Object.values(json.reason || {})[0] || "Could not save this address."
        );
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Set default ──────────────────────────────────────────────────────────
  async function handleSetDefault(addr) {
    if (addr.isDefault) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/address/${addr._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: getToken(),
        },
        body: JSON.stringify({ isDefault: true }),
      });
      const json = await res.json();

      if (res.ok && json.result === "Done") {
        setSuccess("Default address updated.");
        fetchAddresses();
      } else {
        setError(json.reason || "Could not set this address as default.");
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(addr) {
    if (!window.confirm(`Delete the "${addr.label}" address?`)) return;

    setDeletingId(addr._id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/address/${addr._id}`, {
        method: "DELETE",
        headers: { authorization: getToken() },
      });
      const json = await res.json();

      if (res.ok && json.result === "Done") {
        setSuccess("Address deleted.");
        setAddresses((prev) => prev.filter((a) => a._id !== addr._id));
      } else {
        setError(json.reason || "Could not delete this address.");
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const mapPosition =
    form.lat != null && form.lng != null ? [form.lat, form.lng] : null;
  const sourceMeta = locationSource ? SOURCE_META[locationSource] : null;

  return (<>
    <HeroSection title="Addresses" />
    <div className="addr-wrap">
      <div className="addr-container">
        <div className="addr-header">
          <div className="addr-header-left">
            <span className="addr-page-icon">
              <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
            </span>
            <div>
              <h1 className="addr-page-title">
                Saved <em>addresses</em>
              </h1>
              <p className="addr-page-sub">Manage where your orders get delivered</p>
            </div>
          </div>
          <button className="sk-btn sk-btn-gold" onClick={openAddForm}>
            <i className="bi bi-plus-lg"></i> Add address
          </button>
        </div>

        {error && (
          <div className="addr-alert addr-alert-error">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}
        {success && (
          <div className="addr-alert addr-alert-success">
            <i className="bi bi-check-circle-fill"></i> {success}
          </div>
        )}

        {loading ? (
          <div className="addr-empty">
            <span className="addr-empty-icon">
              <i className="bi bi-hourglass-split"></i>
            </span>
            <p className="addr-empty-desc">Loading your addresses…</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="addr-empty">
            <span className="addr-empty-icon">
              <i className="bi bi-signpost-2"></i>
            </span>
            <h2 className="addr-empty-title">No addresses yet</h2>
            <p className="addr-empty-desc">
              Add a delivery address so checkout only takes one tap.
            </p>
            <button className="sk-btn sk-btn-gold" onClick={openAddForm}>
              <i className="bi bi-plus-lg"></i> Add your first address
            </button>
          </div>
        ) : (
          <div className="addr-grid">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`addr-card${addr.isDefault ? " is-default" : ""}`}
              >
                {addr.isDefault && (
                  <span className="addr-default-pill">
                    <i className="bi bi-star-fill"></i> Default
                  </span>
                )}
                <div className="addr-card-top">
                  <span className="addr-label-icon">
                    <i className={`bi ${LABEL_ICONS[addr.label] || "bi-geo-alt-fill"}`}></i>
                  </span>
                  <span className="addr-label-text">{addr.label}</span>
                </div>

                <p className="addr-text">
                  {addr.address}
                  {addr.city ? `, ${addr.city}` : ""}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.pin ? ` – ${addr.pin}` : ""}
                </p>

                <div className="addr-card-actions">
                  {!addr.isDefault && (
                    <button
                      className="addr-action-link"
                      onClick={() => handleSetDefault(addr)}
                    >
                      Set as default
                    </button>
                  )}
                  <button className="addr-action-link" onClick={() => openEditForm(addr)}>
                    Edit
                  </button>
                  <button
                    className="addr-action-link danger"
                    onClick={() => handleDelete(addr)}
                    disabled={deletingId === addr._id}
                  >
                    {deletingId === addr._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {formOpen && (
          <div className="addr-overlay" onClick={closeForm}>
            <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="addr-modal-header">
                <h2>{editingId ? "Edit address" : "Add address"}</h2>
                <button className="addr-close" onClick={closeForm} aria-label="Close">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="addr-form">
                <div className="addr-field">
                  <label htmlFor="search" className="addr-field-label">
                    Search for an address
                  </label>
                  <div className="addr-search-wrap">
                    <i className="bi bi-search"></i>
                    <input
                      id="search"
                      type="text"
                      placeholder="Start typing an address…"
                      value={query}
                      onChange={handleQueryChange}
                      autoComplete="off"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="addr-suggestions">
                      {suggestions.map((s) => (
                        <li key={s.properties.place_id} onClick={() => selectSuggestion(s)}>
                          <i className="bi bi-geo-alt"></i>
                          <span>{s.properties.formatted}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="addr-or-divider">
                  <span></span>
                  or
                  <span></span>
                </div>

                <div className="addr-map-card">
                  <div className="map-wrap">
                    <MapContainer
                      center={mapPosition || DEFAULT_CENTER}
                      zoom={mapPosition ? 15 : 5}
                      scrollWheelZoom
                      key={mapPosition ? `${mapPosition[0]}-${mapPosition[1]}` : "empty"}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker position={mapPosition} onChange={handleMapChange} />
                    </MapContainer>

                    <button
                      type="button"
                      className="addr-locate-fab"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      title="Use my current location"
                      aria-label="Use my current location"
                    >
                      {locating ? (
                        <span className="addr-fab-spinner"></span>
                      ) : (
                        <i className="bi bi-crosshair"></i>
                      )}
                    </button>
                  </div>

                  <div className="addr-map-footer">
                    {mapPosition ? (
                      <div className="addr-location-status">
                        <i className={`bi ${sourceMeta?.icon || "bi-geo-alt-fill"}`}></i>
                        <div>
                          <div className="addr-location-status-label">
                            {sourceMeta?.label || "Location set"}
                          </div>
                          <div className="addr-location-status-value">
                            {form.address || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="map-hint">
                        <i className="bi bi-hand-index-thumb"></i> Tap the map, drag the
                        pin, or use the locate button to set the exact spot.
                      </p>
                    )}
                  </div>
                </div>

                <div className="addr-form-row">
                  <div className="addr-field">
                    <label htmlFor="label" className="addr-field-label">Label</label>
                    <select
                      id="label"
                      value={form.label}
                      onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="addr-field">
                    <label htmlFor="pin" className="addr-field-label">PIN code</label>
                    <input
                      id="pin"
                      type="text"
                      value={form.pin}
                      onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="addr-field">
                  <label htmlFor="address" className="addr-field-label">Address</label>
                  <textarea
                    id="address"
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="addr-form-row">
                  <div className="addr-field">
                    <label htmlFor="city" className="addr-field-label">City</label>
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="addr-field">
                    <label htmlFor="state" className="addr-field-label">State</label>
                    <input
                      id="state"
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <label className="addr-checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isDefault: e.target.checked }))
                    }
                  />
                  Set as default address
                </label>

                <div className="addr-modal-footer">
                  <button type="button" className="addr-action-link" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="sk-btn sk-btn-gold" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "Save changes" : "Add address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}