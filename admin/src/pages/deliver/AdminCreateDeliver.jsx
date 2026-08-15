import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminCreateDeliver() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    active: true,
  });

  const [pic, setPic] = useState(null);
  const [preview, setPreview] = useState(null);

  const [error, setError] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function getInputData(e) {
    const { name, value, type, checked } = e.target;
    setData((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error[name]) {
      setError((old) => ({ ...old, [name]: "" }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPic(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function validate() {
    const newErrors = {};
    if (!data.name.trim()) newErrors.name = "Full Name is mandatory";
    if (!data.username.trim()) newErrors.username = "Username is mandatory";
    if (!data.email.trim()) newErrors.email = "Email Address is mandatory";
    if (!data.phone.trim()) {
      newErrors.phone = "Contact Number is mandatory";
    } else if (!/^\d{10}$/.test(data.phone.trim())) {
      newErrors.phone = "Phone number must be a valid 10-digit number";
    }

    if (!data.password) {
      newErrors.password = "Password is mandatory";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (data.password !== data.cpassword) {
      newErrors.cpassword = "Passwords do not match";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("username", data.username.toLowerCase().replace(/\s/g, ""));
      formData.append("email", data.email.toLowerCase().trim());
      formData.append("phone", data.phone.trim());
      formData.append("password", data.password);
      formData.append("active", data.active);

      // Permanent location
      const permanentLocation = {
        address: data.address,
        city: data.city,
        state: data.state,
        pin: data.pin,
      };
      formData.append("permanentLocation", JSON.stringify(permanentLocation));

      if (pic) {
        formData.append("pic", pic);
      }

      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      let response = await fetch(
        `${serverUrl}/api/deliveryBoy`,
        {
          method: "POST",
          headers: {
            authorization: localStorage.getItem("token") || "",
          },
          body: formData,
        }
      );

      response = await response.json();

      if (response.result === "Done") {
        navigate("/deliveryBoy");
      } else {
        if (typeof response.reason === "object") {
          setError((old) => ({ ...old, ...response.reason }));
        } else {
          setServerError(response.reason || "Failed to create delivery partner.");
        }
      }
    } catch (err) {
      setServerError("Network/Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* ── Page heading ── */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-bicycle" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Fleet Management</p>
              <h1 className="h3 mb-1">Add Delivery Partner</h1>
              <p className="text-muted mb-0">
                Register a new delivery personnel and assign service zone details.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-light" to="/deliveryBoy">
              <i className="bi bi-arrow-left me-1"></i> Back to Fleet
            </Link>
          </div>
        </div>

        {serverError && (
          <div className="alert bg-danger-subtle text-danger border border-danger-subtle py-2.5 px-3 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Left Column: Account & Personal Info */}
            <div className="col-12 col-lg-8">
              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-person-badge text-primary"></i>
                  <span>Account & Contact Information</span>
                </h2>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="name">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${error.name ? "is-invalid" : ""}`}
                      id="name"
                      name="name"
                      value={data.name}
                      onChange={getInputData}
                      placeholder="e.g. John Doe"
                      required
                    />
                    {error.name && <div className="invalid-feedback">{error.name}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="username">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${error.username ? "is-invalid" : ""}`}
                      id="username"
                      name="username"
                      value={data.username}
                      onChange={getInputData}
                      placeholder="e.g. johndoe_delivery"
                      required
                    />
                    {error.username && <div className="invalid-feedback">{error.username}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="email">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${error.email ? "is-invalid" : ""}`}
                      id="email"
                      name="email"
                      value={data.email}
                      onChange={getInputData}
                      placeholder="john@example.com"
                      required
                    />
                    {error.email && <div className="invalid-feedback">{error.email}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="phone">
                      Contact Phone (10 digits) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${error.phone ? "is-invalid" : ""}`}
                      id="phone"
                      name="phone"
                      value={data.phone}
                      onChange={getInputData}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                    {error.phone && <div className="invalid-feedback">{error.phone}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="password">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${error.password ? "is-invalid" : ""}`}
                      id="password"
                      name="password"
                      value={data.password}
                      onChange={getInputData}
                      placeholder="Min. 8 characters"
                      required
                    />
                    {error.password && <div className="invalid-feedback">{error.password}</div>}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="cpassword">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${error.cpassword ? "is-invalid" : ""}`}
                      id="cpassword"
                      name="cpassword"
                      value={data.cpassword}
                      onChange={getInputData}
                      placeholder="Repeat password"
                      required
                    />
                    {error.cpassword && <div className="invalid-feedback">{error.cpassword}</div>}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="panel">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-geo-alt text-info"></i>
                  <span>Base Location & Address</span>
                </h2>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="address">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={data.address}
                      onChange={getInputData}
                      placeholder="House/Street/Area details"
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="city">
                      City
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={data.city}
                      onChange={getInputData}
                      placeholder="e.g. New Delhi"
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="state">
                      State
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      value={data.state}
                      onChange={getInputData}
                      placeholder="e.g. Delhi"
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label" htmlFor="pin">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pin"
                      name="pin"
                      value={data.pin}
                      onChange={getInputData}
                      placeholder="e.g. 110001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Photo & Status Settings */}
            <div className="col-12 col-lg-4">
              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-image text-warning"></i>
                  <span>Profile Photo</span>
                </h2>

                <div className="text-center mb-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="avatar-img avatar-xl mx-auto border shadow-sm"
                    />
                  ) : (
                    <div
                      className="avatar-xl mx-auto rounded-circle bg-light border d-flex align-items-center justify-content-center text-muted"
                      style={{ width: 84, height: 84 }}
                    >
                      <i className="bi bi-camera fs-3"></i>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="pic">
                    Upload Partner Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="pic"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="form-text small text-muted">
                    Accepted formats: JPG, PNG, WEBP (Max 5MB)
                  </div>
                </div>
              </div>

              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-toggle-on text-success"></i>
                  <span>Status Settings</span>
                </h2>

                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="active"
                    name="active"
                    checked={data.active}
                    onChange={getInputData}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="active">
                    Active for Order Assignments
                  </label>
                </div>
                <p className="text-muted small mb-0">
                  When enabled, this partner will be available to receive and dispatch deliveries.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving Partner...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i> Create Delivery Partner
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
