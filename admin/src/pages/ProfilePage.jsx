import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [data, setData] = useState({});

  useEffect(() => {
    (async () => {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "authorization": localStorage.getItem("token"),
          },
        }
      );
      response = await response.json();
      if (response.data) setData(response.data);
      else navigate("/login");
    })();
  }, [navigate]);

  // ✅ added company
  const { name = "", username = "", email = "", phone = "", pic = "", role = "", company = "" } = data;

  const initials = name
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const joinedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  const roleBadgeColor = {
    "Super Admin": "text-bg-danger",
    Admin:         "text-bg-primary",
    Recruiter:     "text-bg-warning",
    JobSeeker:     "text-bg-success",
  }[role] || "text-bg-secondary";

  const isRecruiter = role === "Recruiter";

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">

      <div className="page-heading mb-4">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-person-badge" aria-hidden="true"></i>
          </span>
          <div>
            <p className="eyebrow mb-1">Account</p>
            <h1 className="h3 mb-1">My Profile</h1>
            <p className="text-muted mb-0">View your account details and role information.</p>
          </div>
        </div>
        <div className="page-heading-actions">
          <button className="btn btn-primary" onClick={() => navigate("/update-profile")}>
            <i className="bi bi-pencil-square" aria-hidden="true"></i> Edit Profile
          </button>
        </div>
      </div>

      <div className="row g-3">

        {/* ── Left card ── */}
        <div className="col-12 col-xl-4">
          <div className="panel h-100 text-center profile-card">

            <div className="profile-cover">
              <img
                src="/images/png/dasher-ui-bootstrap-5.jpg"
                alt="cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {pic ? (
              <img className="avatar-img avatar-xl profile-photo" src={
                        data?.pic
                            ? `${data.pic}`
                            : "https://i.pravatar.cc/100"
                    } alt={name} />
            ) : (
              <div
                className="avatar-img avatar-xl profile-photo d-flex align-items-center justify-content-center fw-bold fs-4"
                style={{ background: "var(--bs-primary)", color: "#fff", userSelect: "none" }}
              >
                {initials}
              </div>
            )}

            <h2 className="h5 mt-3 mb-1">{name || "—"}</h2>
            <p className="text-muted mb-3">
              {role === "JobSeeker" ? "Job Seeker" : role || "—"}
            </p>

            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {role && <span className={`badge ${roleBadgeColor}`}>{role}</span>}
              <span className="badge text-bg-success">
                <i className="bi bi-patch-check-fill me-1"></i>Active
              </span>
            </div>

            <div className="info-list mt-4 text-start">
              {email && (
                <div>
                  <span><i className="bi bi-envelope me-1"></i>Email</span>
                  <strong className="text-truncate" style={{ maxWidth: "180px" }}>{email}</strong>
                </div>
              )}
              {username && (
                <div>
                  <span><i className="bi bi-at me-1"></i>Username</span>
                  <strong>{username}</strong>
                </div>
              )}
              {phone && (
                <div>
                  <span><i className="bi bi-telephone me-1"></i>Phone</span>
                  <strong>{phone}</strong>
                </div>
              )}
              {/* ✅ Show company only for Recruiter */}
              {isRecruiter && company && (
                <div>
                  <span><i className="bi bi-building me-1"></i>Company</span>
                  <strong>{company}</strong>
                </div>
              )}
              {/* <div>
                <span><i className="bi bi-calendar3 me-1"></i>Joined</span>
                <strong>{joinedDate}</strong>
              </div> */}
            </div>

          </div>
        </div>

        {/* ── Right: account summary ── */}
        <div className="col-12 col-xl-8 d-flex flex-column gap-3">

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-person-lines-fill" aria-hidden="true"></i>
                  <span>Account Overview</span>
                </h2>
                <p className="text-muted mb-0">A summary of your profile and access level.</p>
              </div>
            </div>

            <div className="row g-3 mt-1">
              <InfoRow icon="bi-person"       label="Full Name" value={name     || "—"} />
              <InfoRow icon="bi-at"           label="Username"  value={username || "—"} />
              <InfoRow icon="bi-envelope"     label="Email"     value={email    || "—"} />
              <InfoRow icon="bi-telephone"    label="Phone"     value={phone    || "—"} />
              {/* ✅ Company row — Recruiter only */}
              {isRecruiter && (
                <InfoRow icon="bi-building" label="Company" value={company || "—"} />
              )}
              <InfoRow icon="bi-shield-check" label="Role"   value={role    || "—"} />
              <InfoRow icon="bi-toggle-on"    label="Status" value="Active" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-lightning" aria-hidden="true"></i>
                  <span>Quick Actions</span>
                </h2>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <button className="btn btn-outline-primary" onClick={() => navigate("/update-profile")}>
                <i className="bi bi-pencil me-1"></i>Update Profile
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/forgot-password")}>
                <i className="bi bi-key me-1"></i>Change Password
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => { localStorage.clear(); navigate("/login"); }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="col-12 col-sm-6">
      <div className="d-flex align-items-start gap-2">
        <span
          className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
          style={{
            width: 32, height: 32,
            background: "var(--bs-primary-bg-subtle, rgba(var(--bs-primary-rgb),.1))",
            color: "var(--bs-primary)",
          }}
        >
          <i className={`bi ${icon}`} aria-hidden="true"></i>
        </span>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}