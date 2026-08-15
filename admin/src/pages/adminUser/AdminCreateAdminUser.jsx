import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function formValidator(e) {
  if (!e.target.value.trim()) return `${e.target.name} field is mandatory`;
  return "";
}

export default function AdminCreateAdminUser() {
  const [data, setData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Admin",
    password: "",
    cpassword: "",
    active: true,
  });

  const [error, setError] = useState({
    name: "Name field is mandatory",
    username: "Username field is mandatory",
    email: "Email address field is mandatory",
    phone: "Phone number field is mandatory",
    password: "Password field is mandatory",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getInputData(e) {
    const { name, value } = e.target;

    if (name !== "active" && name !== "role" && name !== "cpassword") {
      setError((old) => ({
        ...old,
        [name]: formValidator(e),
      }));
    }
    setData((old) => ({
      ...old,
      [name]: name === "active" ? value === "1" || value === true : value,
    }));
  }

  async function postData(e) {
    e.preventDefault();
    if (data.password !== data.cpassword) {
      setShow(true);
      setError((old) => ({
        ...old,
        password: "Password and Confirm Password do not match",
      }));
      return;
    }

    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
      return;
    }

    setLoading(true);
    try {
      const item = {
        name: data.name,
        username: data.username.toLowerCase().replace(/\s/g, ""),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        role: data.role,
        password: data.password,
        active: data.active,
      };

      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      let response = await fetch(`${serverUrl}/api/user`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify(item),
      });

      response = await response.json();
      if (response.result === "Done") {
        navigate("/admins");
      } else {
        setShow(true);
        setError((old) => ({
          ...old,
          username: response.reason?.username ?? "",
          email: response.reason?.email ?? "",
          phone: response.reason?.phone ?? "",
        }));
      }
    } catch (err) {
      setShow(true);
      setError((old) => ({ ...old, name: "Failed to create administrator." }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* Page heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-shield-plus" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">System Administration</p>
              <h1 className="h3 mb-1">Add Administrator</h1>
              <p className="text-muted mb-0">
                Grant new administrative access to manage the platform.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-light" to="/admins">
              <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back to Admins
            </Link>
          </div>
        </div>

        {show && Object.values(error).some((x) => x !== "") && (
          <div className="alert bg-danger-subtle text-danger border border-danger-subtle d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{Object.values(error).find((x) => x !== "")}</div>
          </div>
        )}

        <form onSubmit={postData}>
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-person-badge text-primary" aria-hidden="true"></i>
                  <span>Administrator Details</span>
                </h2>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="name">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="name"
                      type="text"
                      name="name"
                      value={data.name}
                      onChange={getInputData}
                      placeholder="e.g. Alex Johnson"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="username">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="username"
                      type="text"
                      name="username"
                      value={data.username}
                      onChange={getInputData}
                      placeholder="e.g. alex_admin"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="email">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="email"
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={getInputData}
                      placeholder="alex@shopkaro.com"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="phone">
                      Contact Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="phone"
                      type="tel"
                      name="phone"
                      value={data.phone}
                      onChange={getInputData}
                      placeholder="10-digit number"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="role">
                      Admin Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="role"
                      name="role"
                      value={data.role}
                      onChange={getInputData}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="password">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="password"
                      type="password"
                      name="password"
                      value={data.password}
                      onChange={getInputData}
                      placeholder="Min. 8 characters"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="cpassword">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      id="cpassword"
                      type="password"
                      name="cpassword"
                      value={data.cpassword}
                      onChange={getInputData}
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-toggle-on text-success" aria-hidden="true"></i>
                  <span>Access & Status</span>
                </h2>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="activeSwitch"
                    name="active"
                    checked={data.active}
                    onChange={(e) =>
                      setData((old) => ({ ...old, active: e.target.checked }))
                    }
                  />
                  <label className="form-check-label fw-semibold" htmlFor="activeSwitch">
                    Active Admin Account
                  </label>
                </div>
                <p className="text-muted small mb-0">
                  Active administrators can access the admin dashboard to manage stores, orders, products, and users.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Administrator...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i> Save Administrator
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
