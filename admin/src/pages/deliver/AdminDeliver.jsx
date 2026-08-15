import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdminDeliver() {
  const [deliveryData, setDeliveryData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Derived stats
  const totalCount = deliveryData.length;
  const activeCount = deliveryData.filter((d) => d?.active).length;
  const inactiveCount = totalCount - activeCount;
  const citiesCount = new Set(
    deliveryData
      .map((d) => d?.permanentLocation?.city)
      .filter(Boolean)
  ).size;

  const filteredData = (deliveryData || []).filter(
    (item) =>
      (item?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.permanentLocation?.city || "").toLowerCase().includes(search.toLowerCase())
  );

  async function getAPIData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      const token = localStorage.getItem("token");

      let response = await fetch(`${serverUrl}/api/deliveryBoy`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: token || "",
        },
      });

      const resJson = await response.json();

      if (response.status === 401 || response.status === 498) {
        setErrorMsg("Session expired or unauthorized. Please re-login to refresh your admin credentials.");
      } else if (resJson.result === "Done" && Array.isArray(resJson.data)) {
        setDeliveryData(resJson.data);
      } else if (Array.isArray(resJson.data)) {
        setDeliveryData(resJson.data);
      } else {
        if (resJson.reason) {
          setErrorMsg(resJson.reason);
        }
      }
    } catch (err) {
      console.error("Failed to load delivery boys:", err);
      setErrorMsg("Failed to connect to backend server. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this delivery partner?")) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        let response = await fetch(`${serverUrl}/api/deliveryBoy/${_id}`, {
          method: "DELETE",
          headers: {
            authorization: localStorage.getItem("token") || "",
          },
        });
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        } else {
          alert(response.reason || "Failed to delete record.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function toggleStatus(item) {
    if (
      window.confirm(
        `Are you sure you want to ${item.active ? "deactivate" : "activate"} this delivery partner?`
      )
    ) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        const formData = new FormData();
        formData.append("active", !item.active);

        let response = await fetch(`${serverUrl}/api/deliveryBoy/${item._id}`, {
          method: "PUT",
          headers: {
            authorization: localStorage.getItem("token") || "",
          },
          body: formData,
        });
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        } else {
          alert(response.reason || "Failed to toggle status.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    getAPIData();
  }, []);

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
      : "D";

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
              <p className="eyebrow mb-1">Logistics & Fleet</p>
              <h1 className="h3 mb-1">Delivery Boys</h1>
              <p className="text-muted mb-0">
                Manage registered delivery partners, status, and zone coverage.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-primary" to="/deliveryBoy/create">
              <i className="bi bi-plus-lg" aria-hidden="true"></i>
              <span>Add Delivery Partner</span>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="alert bg-warning-subtle text-warning-emphasis border border-warning-subtle py-2.5 px-3 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill text-warning"></i>
              <span>{errorMsg}</span>
            </div>
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-sm btn-primary">
                Login
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-outline-warning"
                onClick={getAPIData}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Metric cards ── */}
        <section className="row g-3 mb-4" aria-label="Delivery boy summary">
          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-primary">
              <div className="metric-top">
                <span className="metric-label">Total Fleet</span>
                <span className="metric-icon">
                  <i className="bi bi-people-fill"></i>
                </span>
              </div>
              <div className="metric-value">{totalCount}</div>
              <div className="metric-meta">
                <span className="badge bg-primary-subtle text-primary">Registered partners</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-success">
              <div className="metric-top">
                <span className="metric-label">Active & Ready</span>
                <span className="metric-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div className="metric-value">{activeCount}</div>
              <div className="metric-meta">
                <span className="badge bg-success-subtle text-success">Online for orders</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-warning">
              <div className="metric-top">
                <span className="metric-label">Inactive</span>
                <span className="metric-icon">
                  <i className="bi bi-pause-circle-fill"></i>
                </span>
              </div>
              <div className="metric-value">{inactiveCount}</div>
              <div className="metric-meta">
                <span className="badge bg-warning-subtle text-warning">Suspended / offline</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-danger">
              <div className="metric-top">
                <span className="metric-label">Cities Covered</span>
                <span className="metric-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
              </div>
              <div className="metric-value">{citiesCount}</div>
              <div className="metric-meta">
                <span className="badge bg-info-subtle text-info">Service areas</span>
              </div>
            </article>
          </div>
        </section>

        {/* ── Table panel ── */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="h5 mb-1 section-title">
                <i className="bi bi-table" aria-hidden="true"></i>
                <span>Delivery Partners List</span>
              </h2>
              <p className="text-muted small mb-0">
                Total {filteredData.length} of {totalCount} records found
              </p>
            </div>

            {/* Search */}
            <div className="ms-auto" style={{ minWidth: 260 }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Partner</th>
                  <th scope="col">Username</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Location / City</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading delivery partners...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item._id}>
                      <td className="text-muted small">{index + 1}</td>

                      {/* User: avatar + name + email */}
                      <td>
                        <div className="d-flex align-items-center gap-2.5">
                          {item.pic ? (
                            <img
                              src={item.pic}
                              alt={item.name}
                              className="avatar-img avatar-sm"
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary-subtle text-primary fw-bold d-inline-grid place-items-center"
                              style={{ width: 34, height: 34, fontSize: 13 }}
                            >
                              {getInitials(item.name)}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold text-body">{item.name}</div>
                            <div className="text-muted small">{item.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="username-badge">
                          @{item.username}
                        </span>
                      </td>

                      <td>
                        <span className="text-muted small">
                          {item.phone || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="small">
                          {item.permanentLocation?.city ? (
                            <>
                              <span className="fw-semibold text-body">
                                {item.permanentLocation.city}
                              </span>
                              {item.permanentLocation.state && (
                                <span className="text-muted">, {item.permanentLocation.state}</span>
                              )}
                              {item.permanentLocation.pin && (
                                <div className="text-muted font-size-xs">PIN: {item.permanentLocation.pin}</div>
                              )}
                            </>
                          ) : (
                            <span className="text-muted opacity-50">Not specified</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          className={`badge border-0 cursor-pointer ${
                            item.active
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                          title="Click to toggle status"
                        >
                          <i className={`bi ${item.active ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                          {item.active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex gap-1.5">
                          <Link
                            className="icon-button"
                            style={{ width: 32, height: 32, fontSize: "0.85rem" }}
                            to={`/deliveryBoy/update/${item._id}`}
                            title="Edit Partner"
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </Link>
                          <button
                            className="icon-button"
                            style={{ width: 32, height: 32, fontSize: "0.85rem" }}
                            onClick={() => deleteRecord(item._id)}
                            title="Delete Partner"
                            type="button"
                          >
                            <i className="bi bi-trash text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-bicycle fs-1 d-block mb-2 text-muted opacity-50"></i>
                      No delivery partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
