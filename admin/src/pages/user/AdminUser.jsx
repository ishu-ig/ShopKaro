import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdminUser() {
  const [userStateData, setUserStateData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter ONLY customer accounts (excluding Admin, Super Admin, DeliveryBoy)
  const customerData = (userStateData || []).filter(
    (u) =>
      u.role === "Buyer" ||
      (!["Admin", "Super Admin", "DeliveryBoy"].includes(u.role))
  );

  // Derived stats
  const totalCustomers = customerData.length;
  const activeCount = customerData.filter((u) => u.active).length;
  const inactiveCount = totalCustomers - activeCount;
  const addressesCount = customerData.filter(
    (u) => u.addresses?.length > 0 || u.defaultAddress
  ).length;

  const filteredData = customerData.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.username?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.phone?.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this customer account?")) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        let response = await fetch(
          `${serverUrl}/api/user/${_id}`,
          {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
              authorization: localStorage.getItem("token") || "",
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        } else {
          alert(response.reason || "Failed to delete customer.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function updateRecord(_id) {
    let item = customerData.find((x) => x._id === _id);
    if (!item) return;

    if (
      window.confirm(
        `Are you sure you want to ${item.active ? "deactivate" : "activate"} this customer?`
      )
    ) {
      try {
        const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
        let response = await fetch(
          `${serverUrl}/api/user/${_id}`,
          {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              authorization: localStorage.getItem("token") || "",
            },
            body: JSON.stringify({ ...item, active: !item.active }),
          }
        );
        response = await response.json();
        if (response.result === "Done") {
          getAPIData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function getAPIData() {
    setLoading(true);
    try {
      const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";
      let response = await fetch(
        `${serverUrl}/api/user`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            authorization: localStorage.getItem("token") || "",
          },
        }
      );
      response = await response.json();
      if (response.data && Array.isArray(response.data)) {
        setUserStateData(response.data);
      } else if (Array.isArray(response.data)) {
        setUserStateData(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      : "C";

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* ── Page heading ── */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">User Management</p>
              <h1 className="h3 mb-1">Customers</h1>
              <p className="text-muted mb-0">
                Review and manage registered customer (buyer) accounts.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-primary" to="/user/create">
              <i className="bi bi-plus-lg" aria-hidden="true"></i>
              <span>Add Customer</span>
            </Link>
          </div>
        </div>

        {/* ── Summary metric cards ── */}
        <section className="row g-3 mb-4" aria-label="Customer summary">
          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-primary">
              <div className="metric-top">
                <span className="metric-label">Total Customers</span>
                <span className="metric-icon">
                  <i className="bi bi-people-fill"></i>
                </span>
              </div>
              <div className="metric-value">{totalCustomers}</div>
              <div className="metric-meta">
                <span className="badge bg-primary-subtle text-primary">Registered buyers</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-success">
              <div className="metric-top">
                <span className="metric-label">Active Accounts</span>
                <span className="metric-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </span>
              </div>
              <div className="metric-value">{activeCount}</div>
              <div className="metric-meta">
                <span className="badge bg-success-subtle text-success">Enabled buyers</span>
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
                <span className="badge bg-warning-subtle text-warning">Suspended accounts</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <article className="metric-card metric-danger">
              <div className="metric-top">
                <span className="metric-label">Addresses Saved</span>
                <span className="metric-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
              </div>
              <div className="metric-value">{addressesCount}</div>
              <div className="metric-meta">
                <span className="badge bg-info-subtle text-info">With delivery address</span>
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
                <span>Customer Directory</span>
              </h2>
              <p className="text-muted small mb-0">
                Total {filteredData.length} of {totalCustomers} customers found
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
                  placeholder="Search customers..."
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
                  <th scope="col">Customer</th>
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
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item._id}>
                      <td className="text-muted small">{index + 1}</td>

                      {/* Customer avatar + name + email */}
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
                        <span className="text-muted small">{item.phone || "—"}</span>
                      </td>

                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          Buyer
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => updateRecord(item._id)}
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
                            to={`/user/update/${item._id}`}
                            title="Edit Customer"
                          >
                            <i className="bi bi-pencil-square text-primary"></i>
                          </Link>
                          <button
                            className="icon-button"
                            style={{ width: 32, height: 32, fontSize: "0.85rem" }}
                            onClick={() => deleteRecord(item._id)}
                            title="Delete Customer"
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
                      <i className="bi bi-people fs-1 d-block mb-2 text-muted opacity-50"></i>
                      No customer accounts found.
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
