import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdminUserList() {
  const [adminList, setAdminList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const currentUserId = localStorage.getItem("userid");

  // Filter only Admin and Super Admin users
  const adminData = (adminList || []).filter(
    (u) => u?.role === "Admin" || u?.role === "Super Admin"
  );

  // Derived stats
  const totalAdmins = adminData.length;
  const activeCount = adminData.filter((u) => u?.active).length;
  const inactiveCount = totalAdmins - activeCount;
  const superAdminCount = adminData.filter((u) => u?.role === "Super Admin").length;

  const filteredData = adminData.filter(
    (item) =>
      (item?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (item?.city || "").toLowerCase().includes(search.toLowerCase())
  );

  async function getAPIData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      const token = localStorage.getItem("token");

      let response = await fetch(`${serverUrl}/api/user`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          authorization: token || "",
        },
      });
      const resJson = await response.json();
      if (resJson.data && Array.isArray(resJson.data)) {
        setAdminList(resJson.data);
      } else if (Array.isArray(resJson)) {
        setAdminList(resJson);
      } else {
        if (resJson.reason) setErrorMsg(resJson.reason);
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(_id) {
    if (_id === currentUserId) {
      alert("You cannot delete your own active admin account.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this Administrator?")) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        let response = await fetch(`${serverUrl}/api/user/${_id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            authorization: localStorage.getItem("token") || "",
          },
        });
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        } else {
          alert(response.reason || "Failed to delete admin.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function toggleStatus(item) {
    if (item._id === currentUserId) {
      alert("You cannot deactivate your own active admin account.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to ${item.active ? "deactivate" : "activate"} ${item.name}?`
      )
    ) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        let response = await fetch(`${serverUrl}/api/user/${item._id}`, {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            authorization: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({ ...item, active: !item.active }),
        });
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        } else {
          alert(response.reason || "Failed to update status.");
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
      : "A";

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* ── Page heading ── */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-shield-lock" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">System Administration</p>
              <h1 className="h3 mb-1">Administrators</h1>
              <p className="text-muted mb-0">
                Manage admin accounts, access privileges, and system permissions.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-primary" to="/admins/create">
              <i className="bi bi-plus-lg" aria-hidden="true"></i>
              <span>Add Administrator</span>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="alert bg-warning-subtle text-warning-emphasis border border-warning-subtle py-2.5 px-3 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill text-warning"></i>
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-warning"
              onClick={getAPIData}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Metric cards ── */}
        <section className="row g-3 mb-4" aria-label="Admin summary">
          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-primary">
              <div className="metric-top">
                <span className="metric-label">Total Admins</span>
                <span className="metric-icon">
                  <i className="bi bi-shield-shaded"></i>
                </span>
              </div>
              <div className="metric-value">{totalAdmins}</div>
              <div className="metric-meta">
                <span className="badge bg-primary-subtle text-primary">System staff</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-success">
              <div className="metric-top">
                <span className="metric-label">Active Staff</span>
                <span className="metric-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div className="metric-value">{activeCount}</div>
              <div className="metric-meta">
                <span className="badge bg-success-subtle text-success">Enabled logins</span>
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
                <span className="badge bg-warning-subtle text-warning">Suspended staff</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-danger">
              <div className="metric-top">
                <span className="metric-label">Super Admins</span>
                <span className="metric-icon">
                  <i className="bi bi-star-fill"></i>
                </span>
              </div>
              <div className="metric-value">{superAdminCount}</div>
              <div className="metric-meta">
                <span className="badge bg-danger-subtle text-danger">Full access</span>
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
                <span>Administrators Directory</span>
              </h2>
              <p className="text-muted small mb-0">
                Total {filteredData.length} of {totalAdmins} admin accounts found
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
                  placeholder="Search admin users..."
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
                  <th scope="col">Admin User</th>
                  <th scope="col">Username</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Loading administrators...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => {
                    const isSelf = item._id === currentUserId;
                    return (
                      <tr key={item._id} className={isSelf ? "bg-primary-subtle bg-opacity-10" : ""}>
                        <td className="text-muted small">{index + 1}</td>

                        {/* Avatar + name + email */}
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
                              <div className="fw-semibold text-body d-flex align-items-center gap-1.5">
                                <span>{item.name}</span>
                                {isSelf && (
                                  <span className="badge bg-primary text-white font-size-xs px-1.5 py-0.5">
                                    You
                                  </span>
                                )}
                              </div>
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
                          <span className="text-muted small">{item.phone || "—"}</span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              item.role === "Super Admin"
                                ? "bg-danger-subtle text-danger"
                                : "bg-primary-subtle text-primary"
                            }`}
                          >
                            <i className="bi bi-shield-check me-1"></i>
                            {item.role || "Admin"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => toggleStatus(item)}
                            disabled={isSelf}
                            className={`badge border-0 cursor-pointer ${
                              item.active
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            } ${isSelf ? "opacity-75" : ""}`}
                            title={isSelf ? "You cannot deactivate yourself" : "Click to toggle status"}
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
                              to={`/admins/update/${item._id}`}
                              title="Edit Admin"
                            >
                              <i className="bi bi-pencil-square text-primary"></i>
                            </Link>
                            {!isSelf && (
                              <button
                                className="icon-button"
                                style={{ width: 32, height: 32, fontSize: "0.85rem" }}
                                onClick={() => deleteRecord(item._id)}
                                title="Delete Admin"
                                type="button"
                              >
                                <i className="bi bi-trash text-danger"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-shield-x fs-1 d-block mb-2 text-muted opacity-50"></i>
                      No administrator accounts found.
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
