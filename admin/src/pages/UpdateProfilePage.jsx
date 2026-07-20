import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Maps the role stored in localStorage to the actual API collection it
// lives in. There are exactly three roles in this system:
//   "Admin"       -> /api/user
//   "Super Admin" -> /api/user
//   "DeliveryBoy" -> /api/user
//   "shop"        -> /api/shop (its own collection)
// Keep this in sync with the equivalent helper in ProfilePage.jsx,
// Navbar.jsx, and Sidebar.jsx.
function apiPathForRole(role) {
  switch (role) {
    case "Admin":
      return "user";
    case "DeliveryBoy":
      return "deliveryBoy";
    case "shop":
      return "shop";
    default:
      console.warn(`UpdateProfilePage: unrecognized role "${role}", defaulting to "user"`);
      return "user";
  }
}

export default function UpdateProfilePage() {
  const navigate = useNavigate();

  // ── Role (single source of truth) ──────────────────────────────────────
  // rawRole keeps the exact stored casing ("Admin" / "Super Admin" /
  // "DeliveryBoy" / "shop") — this is what must be passed into
  // apiPathForRole(). role is the lowercased form used everywhere else in
  // this component for UI branching (role === "shop" etc).
  const rawRole = localStorage.getItem("role") || "";
  const role = rawRole.toLowerCase();
  const api = apiPathForRole(rawRole);

  // ── Data state ────────────────────────────────────────────────────────────
  // NOTE: fields trimmed to match ShopSchema — no seatAvailable/
  // reservationPrice/discount/finalPrice/isreservation/openTime/closeTime,
  // since none of those exist on the schema anymore.
  const [data, setData] = useState(
    role === "shop"
      ? {
          name: "",
          ownerName: "",
          email: "",
          phone: "",
          pic: "",

          address: "",
          city: "",
          state: "",
          pin: "",
          lat: "",
          lng: "",
        }
      : {
          name: "",
          username: "",
          email: "",
          phone: "",
          pic: "",

          address: "",
          city: "",
          state: "",
          pin: "",
        },
  );

  // ── UI state ──────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picFile, setPicFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fileRef = useRef();

  // ── Derived ───────────────────────────────────────────────────────────────
  const initials =
    (data.name || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  // ── Load profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${api}/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              authorization: localStorage.getItem("token"),
            },
          },
        );
        response = await response.json();
        if (response.result === "Done") {
          if (role === "shop") {
            setData({
              name: response.data.name || "",
              ownerName: response.data.ownerName || "",
              email: response.data.email || "",
              phone: response.data.phone || "",
              pic: response.data.pic || "",

              address: response.data.permanentLocation?.address || "",
              city: response.data.permanentLocation?.city || "",
              state: response.data.permanentLocation?.state || "",
              pin: response.data.permanentLocation?.pin || "",
              lat: response.data.permanentLocation?.lat ?? "",
              lng: response.data.permanentLocation?.lng ?? "",
            });
          } else {
            setData({
              name: response.data.name || "",
              username: response.data.username || "",
              email: response.data.email || "",
              phone: response.data.phone || "",
              pic: response.data.pic || "",

              address: response.data.permanentLocation?.address || "",
              city: response.data.permanentLocation?.city || "",
              state: response.data.permanentLocation?.state || "",
              pin: response.data.permanentLocation?.pin || "",
              lat: response.data.permanentLocation?.lat ?? "",
              lng: response.data.permanentLocation?.lng ?? "",
            });
          }
          if (response.data.pic) setPreviewUrl(response.data.pic);
        }
      } catch {
        setError("Internal Server Error. Could not load profile.");
      }
    })();
  }, [api, role]);

  // ── Generic field handler ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setData((old) => ({ ...old, [name]: value }));
  }

  // ── Reverse geocode via Geoapify ───────────────────────────────────────────
  const GEOAPIFY_API_KEY = "e04b543b846f4fb187b19c00fe5a29af";
  async function getLocation() {
    setError("");
    setSuccess("");

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`,
          );
          const result = await response.json();

          if (result.features?.length > 0) {
            const place = result.features[0].properties;
            setData((prev) => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              address: place.address_line1 || "",
              city: place.city || place.town || place.village || "",
              state: place.state || "",
              pin: place.postcode || "",
            }));
          } else {
            setError("Could not determine an address from your location.");
          }
        } catch {
          setError("Failed to fetch address from location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Location permission denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // ── Avatar pick ───────────────────────────────────────────────────────────
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function postData(e) {
    e.preventDefault();
    setValidated(true);
    setError("");
    setSuccess("");

    if (!e.target.checkValidity()) return;

    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      // Shop fields
      if (role === "shop") {
        formData.append("ownerName", data.ownerName);

        formData.append(
          "permanentLocation",
          JSON.stringify({
            lat: data.lat,
            lng: data.lng,
            address: data.address,
            city: data.city,
            state: data.state,
            pin: data.pin,
          }),
        );
      }
      // Buyer / Delivery Boy
      else {
        formData.append("username", data.username);

        formData.append(
          "permanentLocation",
          JSON.stringify({
            lat: data.lat,
            lng: data.lng,
            address: data.address,
            city: data.city,
            state: data.state,
            pin: data.pin,
          }),
        );
      }

      if (picFile) {
        formData.append("pic", picFile);
      }

      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${api}/${localStorage.getItem("userid")}`,
        {
          method: "PUT",
          headers: {
            authorization: localStorage.getItem("token"),
          },
          body: formData,
        },
      );

      response = await response.json();

      if (response.result === "Done") {
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("phone", response.data.phone);

        if (role !== "shop") {
          localStorage.setItem("username", response.data.username);
        }

        if (response.data.pic) {
          localStorage.setItem("pic", response.data.pic);
        }

        setSuccess("Profile updated successfully.");

        setTimeout(() => {
          navigate(`/${rawRole}/${localStorage.getItem("userid")}`);
        }, 1200);
      } else {
        setError(
          response.reason?.name ||
            response.reason?.ownerName ||
            response.reason?.username ||
            response.reason?.email ||
            response.reason?.phone ||
            "Update failed. Please try again.",
        );
      }
    } catch (error) {
      console.log(error);
      setError("Internal Server Error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Scoped styles for clearer section grouping. Safe to move into a
          stylesheet — kept inline here so the component is drop-in. */}
      <style>{`
        .form-section {
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 14px;
          padding: 1.25rem 1.5rem 1.5rem;
          margin-bottom: 1.5rem;
          background: var(--bs-body-bg, #fff);
          position: relative;
        }
        .form-section:last-of-type { margin-bottom: 0; }
        .form-section-header {
          display: flex;
          align-items: center;
          gap: .65rem;
          margin: -0.25rem 0 1.1rem;
          padding-bottom: .75rem;
          border-bottom: 1px solid var(--bs-border-color, #eee);
        }
        .form-section-header .icon-badge {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 1rem;
        }
        .form-section-header h3 {
          margin: 0;
          font-size: .95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: var(--bs-body-color, #212529);
        }
        .form-section-header p {
          margin: 0;
          font-size: .8rem;
        }
        .form-section--personal .icon-badge { background: var(--bs-primary, #0d6efd); }
        .form-section--address .icon-badge { background: #198754; }
        .form-section--address {
          background: rgba(25, 135, 84, 0.04);
          border-color: rgba(25, 135, 84, 0.2);
        }
      `}</style>

      {/* Page heading */}
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-gear" aria-hidden="true"></i>
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-1">Update Profile</h1>
            <p className="text-muted mb-0">
              Edit your personal details and save changes.
            </p>
          </div>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate(`/${rawRole}/${localStorage.getItem("userid")}/profile`)}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Profile
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* ── Avatar sidebar ── */}
        <div className="col-12 col-xl-4">
          <div className="panel h-100 text-center profile-card">
            <div className="profile-cover">
              <img
                src="/images/png/dasher-ui-bootstrap-5.jpg"
                alt="cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {previewUrl ? (
              <img
                className="avatar-img avatar-xl profile-photo"
                src={previewUrl}
                alt={data.name}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="avatar-img avatar-xl profile-photo d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{
                  background: "var(--bs-primary)",
                  color: "#fff",
                  userSelect: "none",
                }}
              >
                {initials}
              </div>
            )}

            <h2 className="h5 mt-3 mb-1">{data.name || "Your Name"}</h2>
            <p className="text-muted mb-3">{rawRole || "User"}</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => fileRef.current.click()}
            >
              <i className="bi bi-camera me-1"></i> Change Photo
            </button>

            {picFile && (
              <p className="text-muted small mt-2 mb-0">
                <i className="bi bi-check-circle-fill text-success me-1"></i>
                {picFile.name}
              </p>
            )}

            <div className="info-list mt-4 text-start">
              <div>
                <span>
                  <i className="bi bi-envelope me-1"></i>Email
                </span>
                <strong className="text-truncate" style={{ maxWidth: 180 }}>
                  {data.email || "—"}
                </strong>
              </div>
              {role !== "shop" && (
                <div>
                  <span>
                    <i className="bi bi-at me-1"></i>Username
                  </span>
                  <strong>{data.username || "—"}</strong>
                </div>
              )}
              <div>
                <span>
                  <i className="bi bi-telephone me-1"></i>Phone
                </span>
                <strong>{data.phone || "—"}</strong>
              </div>
              {data.city && (
                <div>
                  <span>
                    <i className="bi bi-geo-alt me-1"></i>City
                  </span>
                  <strong>{data.city}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Edit form ── */}
        <div className="col-12 col-xl-8">
          <form
            className={`panel needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={postData}
          >
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-gear" aria-hidden="true"></i>
                  <span>Profile Settings</span>
                </h2>
                <p className="text-muted mb-0">
                  Update your account profile and contact details.
                </p>
              </div>
            </div>

            {success && (
              <div
                className="alert alert-success py-2 d-flex align-items-center gap-2 mt-3"
                role="alert"
              >
                <i className="bi bi-check-circle-fill"></i> {success}
              </div>
            )}
            {error && (
              <div
                className="alert alert-danger py-2 d-flex align-items-center gap-2 mt-3"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            {/* ── Section: Personal Info ── */}
            <div className="form-section form-section--personal mt-3">
              <div className="form-section-header">
                <span className="icon-badge">
                  <i className="bi bi-person" aria-hidden="true"></i>
                </span>
                <div>
                  <h3>Personal Info</h3>
                  <p className="text-muted">Name, contact details, and how people reach you.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="upName">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upName"
                      name="name"
                      type="text"
                      value={data.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                    <div className="invalid-feedback">Full name is required.</div>
                  </div>
                </div>

                {role !== "shop" ? (
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="upUsername">
                      Username
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">@</span>
                      <input
                        className="form-control bg-body-secondary"
                        id="upUsername"
                        name="username"
                        type="text"
                        value={data.username}
                        readOnly
                      />
                    </div>
                    <div className="form-text text-muted">
                      <i className="bi bi-lock me-1"></i>Username cannot be
                      changed.
                    </div>
                  </div>
                ) : (
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="upOwnerName">
                      Owner Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        className="form-control"
                        id="upOwnerName"
                        name="ownerName"
                        type="text"
                        value={data.ownerName}
                        onChange={handleChange}
                        placeholder="Owner's full name"
                        required
                      />
                      <div className="invalid-feedback">
                        Owner name is required.
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-md-6">
                  <label className="form-label" htmlFor="upEmail">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upEmail"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                    <div className="invalid-feedback">
                      Enter a valid email address.
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="upPhone">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upPhone"
                      name="phone"
                      type="tel"
                      value={data.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section: Address Details ── */}
            <div className="form-section form-section--address">
              <div className="form-section-header">
                <span className="icon-badge">
                  <i className="bi bi-geo-alt" aria-hidden="true"></i>
                </span>
                <div>
                  <h3>Address Details</h3>
                  <p className="text-muted">Where you're located, or auto-fill from GPS.</p>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={getLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Locating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-crosshair me-1"></i> Use Current
                      Location
                    </>
                  )}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="upAddress">
                    Street Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-house"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upAddress"
                      name="address"
                      type="text"
                      value={data.address}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upCity">
                    City
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-building"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upCity"
                      name="city"
                      type="text"
                      value={data.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upState">
                    State
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-map"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upState"
                      name="state"
                      type="text"
                      value={data.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="upPin">
                    PIN Code
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-pin-map"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upPin"
                      name="pin"
                      type="text"
                      value={data.pin}
                      onChange={handleChange}
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/${rawRole}/${localStorage.getItem("userid")}/profile`)}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}