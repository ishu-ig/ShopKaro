import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UpdateProfilePage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "";

  // ── Data state ────────────────────────────────────────────────────────────
  const [data, setData] = useState({
    name:     "",
    username: "",
    email:    "",
    phone:    "",
    address:  "",
    city:     "",
    state:    "",
    pin:      "",
    pic:      "",
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picFile,    setPicFile]    = useState(null);
  const [isSaving,   setIsSaving]   = useState(false);
  const [validated,  setValidated]  = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const fileRef = useRef();

  // ── Derived ───────────────────────────────────────────────────────────────
  const initials =
    (data.name || "")
      .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  // ── Load profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "content-type":  "application/json",
              authorization:    localStorage.getItem("token"),
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") {
          setData({
            name:     response.data.name     || "",
            username: response.data.username || "",
            email:    response.data.email    || "",
            phone:    response.data.phone    || "",
            address:  response.data.address  || "",
            city:     response.data.city     || "",
            state:    response.data.state    || "",
            pin:      response.data.pin      || "",
            pic:      response.data.pic      || "",
            company:  response.data.company  || "",  // ✅
          });
          if (response.data.pic) setPreviewUrl(response.data.pic);
        }
      } catch {
        setError("Internal Server Error. Could not load profile.");
      }
    })();
  }, []);

  // ── Generic field handler ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setData((old) => ({ ...old, [name]: value }));
  }

  // ── Avatar pick ───────────────────────────────────────────────────────────
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setData((old) => ({ ...old, pic: file }));
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
      formData.append("name",    data.name);
      formData.append("email",   data.email);
      formData.append("phone",   data.phone);
      formData.append("address", data.address);
      formData.append("city",    data.city);
      formData.append("state",   data.state);
      formData.append("pin",     data.pin);
      if (role === "Recruiter") formData.append("company", data.company); // ✅
      if (picFile) formData.append("pic", picFile);

      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
        {
          method: "PUT",
          headers: { authorization: localStorage.getItem("token") },
          body: formData,
        }
      );
      response = await response.json();

      if (response.result === "Done") {
        localStorage.setItem("name",  data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("phone", data.phone);
        if (role === "Recruiter") localStorage.setItem("company", data.company); // ✅
        if (response.data?.pic) localStorage.setItem("pic", response.data.pic);
        setSuccess("Profile updated successfully.");
        setTimeout(() => navigate("/profile"), 1200);
      } else {
        setError(
          response.reason?.email   ||
          response.reason?.company ||
          response.message         ||
          "Update failed. Please try again."
        );
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">

      {/* Page heading */}
      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-gear" aria-hidden="true"></i>
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-1">Update Profile</h1>
            <p className="text-muted mb-0">Edit your personal details and save changes.</p>
          </div>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => navigate("/profile")}
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
            <p className="text-muted mb-3">{role || "User"}</p>

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
                <span><i className="bi bi-envelope me-1"></i>Email</span>
                <strong className="text-truncate" style={{ maxWidth: 180 }}>
                  {data.email || "—"}
                </strong>
              </div>
              <div>
                <span><i className="bi bi-at me-1"></i>Username</span>
                <strong>{data.username || "—"}</strong>
              </div>
              <div>
                <span><i className="bi bi-telephone me-1"></i>Phone</span>
                <strong>{data.phone || "—"}</strong>
              </div>
              {role === "Recruiter" && data.company && (
                <div>
                  <span><i className="bi bi-building me-1"></i>Company</span>
                  <strong>{data.company}</strong>
                </div>
              )}
              {data.city && (
                <div>
                  <span><i className="bi bi-geo-alt me-1"></i>City</span>
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
              <div className="alert alert-success py-2 d-flex align-items-center gap-2 mt-3" role="alert">
                <i className="bi bi-check-circle-fill"></i> {success}
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mt-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            {/* ── Section: Personal Info ── */}
            <h3 className="h6 text-muted mt-3 mb-2 text-uppercase" style={{ letterSpacing: ".05em" }}>
              <i className="bi bi-person me-1"></i> Personal Info
            </h3>
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

              <div className="col-md-6">
                <label className="form-label" htmlFor="upUsername">Username</label>
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
                  <i className="bi bi-lock me-1"></i>Username cannot be changed.
                </div>
              </div>

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
                  <div className="invalid-feedback">Enter a valid email address.</div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="upPhone">Phone Number</label>
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

              {/* ── Company — Recruiter only ── */}
              {role === "Recruiter" && (
                <div className="col-md-6">
                  <label className="form-label" htmlFor="upCompany">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-building"></i>
                    </span>
                    <input
                      className="form-control"
                      id="upCompany"
                      name="company"
                      type="text"
                      value={data.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      required
                    />
                    <div className="invalid-feedback">Company name is required.</div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Section: Address Details ── */}
            <h3 className="h6 text-muted mt-4 mb-2 text-uppercase" style={{ letterSpacing: ".05em" }}>
              <i className="bi bi-geo-alt me-1"></i> Address Details
            </h3>
            <div className="row g-3">

              <div className="col-12">
                <label className="form-label" htmlFor="upAddress">Street Address</label>
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
                <label className="form-label" htmlFor="upCity">City</label>
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
                <label className="form-label" htmlFor="upState">State</label>
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
                <label className="form-label" htmlFor="upPin">PIN Code</label>
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

            <hr className="my-4" />

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/profile")}
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