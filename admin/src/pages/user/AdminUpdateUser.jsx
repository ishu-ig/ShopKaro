import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function formValidator(e) {
  if (!e.target.value.trim()) return `${e.target.name} field is mandatory`;
  return "";
}

export default function AdminUpdateUser() {
  const { _id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    _id: "",
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Buyer",
    active: true,
  });

  const [error, setError] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  async function getAPIData() {
    setFetching(true);
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      let response = await fetch(
        `${serverUrl}/api/user/${_id}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            authorization: localStorage.getItem("token") || "",
          },
        }
      );
      response = await response.json();
      if (response.data) {
        setData({ ...response.data, role: response.data.role || "Buyer" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    getAPIData();
  }, [_id]);

  function getInputData(e) {
    const { name, value } = e.target;

    if (name !== "active" && name !== "role") {
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

  async function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
      return;
    }

    setLoading(true);
    try {
      const item = {
        _id: data._id,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        role: "Buyer",
        active: data.active,
      };

      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      let response = await fetch(
        `${serverUrl}/api/user/${_id}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            authorization: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(item),
        }
      );
      response = await response.json();
      if (response.result === "Done") {
        navigate("/user");
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
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-5 text-center">
          <span className="spinner-border spinner-border-lg text-primary" role="status" aria-hidden="true"></span>
          <p className="mt-3 text-muted">Loading customer details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* Page heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">User Management</p>
              <h1 className="h3 mb-1">Update Customer</h1>
              <p className="text-muted mb-0">
                Modify customer profile and account status.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-light" to="/user">
              <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back to Customers
            </Link>
          </div>
        </div>

        {show && Object.values(error).some((x) => x !== "") && (
          <div className="alert bg-danger-subtle text-danger border border-danger-subtle d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{Object.values(error).find((x) => x !== "")}</div>
          </div>
        )}

        <form onSubmit={postSubmit}>
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="panel mb-4">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-person-badge text-primary" aria-hidden="true"></i>
                  <span>Customer Details</span>
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
                      maxLength={10}
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
                  <span>Account Status</span>
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
                    Active Customer Account
                  </label>
                </div>
                <p className="text-muted small mb-0">
                  Toggle whether this customer can log in to ShopKaro.
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
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i> Update Customer
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
