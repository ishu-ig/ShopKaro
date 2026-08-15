import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroSection from "../Components/HeroSection";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Notification toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(false);

  const userId = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: token,
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") {
          setUser(response.data);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    })();
  }, [userId, token, navigate]);

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm account deletion.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );
      response = await response.json();

      if (response.result === "Done") {
        localStorage.clear();
        alert("Your account has been permanently deleted.");
        navigate("/");
      } else {
        setDeleteError(response.reason || "Failed to delete account. Please try again.");
      }
    } catch (err) {
      setDeleteError("Server error while deleting account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <HeroSection title="Account Settings" />

      <div className="py-5" style={{ background: "#f8f6f0", minHeight: "80vh" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          {/* Header */}
          <div className="mb-4">
            <span
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a84c",
                display: "block",
                marginBottom: 4,
              }}
            >
              Control Center
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                color: "#0d1b2a",
                margin: 0,
              }}
            >
              Settings & <em>Preferences</em>
            </h2>
          </div>

          <div className="row g-4">
            {/* Left Column: Profile Card & Navigation */}
            <div className="col-12 col-md-4">
              <div
                className="p-4 text-center mb-4"
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="position-relative d-inline-block mb-3">
                  <img
                    src={user?.pic || "/img/noimage.jpg"}
                    alt="User"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #c9a84c",
                      boxShadow: "0 4px 14px rgba(201,168,76,0.25)",
                    }}
                  />
                  <Link
                    to="/UpdateProfile"
                    className="position-absolute bottom-0 end-0 bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 28, height: 28, textDecoration: "none", border: "2px solid #fff", fontSize: 12 }}
                    title="Edit Profile Picture"
                  >
                    <i className="fa fa-camera"></i>
                  </Link>
                </div>
                <h5 style={{ fontWeight: 700, color: "#0d1b2a", marginBottom: 2 }}>
                  {user?.name || localStorage.getItem("name") || "ShopKaro User"}
                </h5>
                <p style={{ fontSize: "0.82rem", color: "#777", marginBottom: 12 }}>
                  {user?.email || "Member since 2026"}
                </p>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: "rgba(201,168,76,0.14)",
                    color: "#0d1b2a",
                    border: "1px solid rgba(201,168,76,0.35)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  <i className="fa fa-gem me-1" style={{ color: "#c9a84c" }}></i>
                  {user?.role === "Admin" ? "Administrator" : "Verified Buyer"}
                </span>
              </div>

              {/* Quick Links Menu */}
              <div
                className="list-group"
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <Link
                  to="/profile"
                  className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-0 border-bottom"
                  style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}
                >
                  <span><i className="fa fa-user me-3" style={{ color: "#c9a84c", width: 16 }}></i> My Profile</span>
                  <i className="fa fa-chevron-right text-muted" style={{ fontSize: 11 }}></i>
                </Link>
                <Link
                  to="/UpdateProfile"
                  className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-0 border-bottom"
                  style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}
                >
                  <span><i className="fa fa-edit me-3" style={{ color: "#c9a84c", width: 16 }}></i> Edit Details</span>
                  <i className="fa fa-chevron-right text-muted" style={{ fontSize: 11 }}></i>
                </Link>
                <Link
                  to="/address"
                  className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-0 border-bottom"
                  style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}
                >
                  <span><i className="fa fa-map-marker-alt me-3" style={{ color: "#c9a84c", width: 16 }}></i> Saved Addresses</span>
                  <i className="fa fa-chevron-right text-muted" style={{ fontSize: 11 }}></i>
                </Link>
                <Link
                  to="/order"
                  className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-0 border-bottom"
                  style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}
                >
                  <span><i className="fa fa-box-open me-3" style={{ color: "#c9a84c", width: 16 }}></i> My Orders</span>
                  <i className="fa fa-chevron-right text-muted" style={{ fontSize: 11 }}></i>
                </Link>
                <Link
                  to="/forgetPassword-1"
                  className="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center justify-content-between border-0"
                  style={{ fontWeight: 600, fontSize: "0.88rem", color: "#333" }}
                >
                  <span><i className="fa fa-key me-3" style={{ color: "#c9a84c", width: 16 }}></i> Change Password</span>
                  <i className="fa fa-chevron-right text-muted" style={{ fontSize: 11 }}></i>
                </Link>
              </div>
            </div>

            {/* Right Column: Settings Panels */}
            <div className="col-12 col-md-8">
              {/* Account Security & Info */}
              <div
                className="p-4 mb-4"
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0d1b2a", marginBottom: 16 }}>
                  Account Security
                </h5>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>Registered Email</label>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.92rem" }}>
                      {user?.email || "Not provided"}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>Phone Number</label>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.92rem" }}>
                      {user?.phone || "+91 Not linked"}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>Account ID</label>
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#555" }}>
                      {user?._id || userId}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>Password</label>
                    <div>
                      <Link
                        to="/forgetPassword-1"
                        className="btn btn-sm rounded-pill px-3"
                        style={{
                          background: "rgba(201,168,76,0.12)",
                          color: "#0d1b2a",
                          border: "1px solid rgba(201,168,76,0.35)",
                          fontWeight: 700,
                          fontSize: "0.76rem",
                        }}
                      >
                        <i className="fa fa-lock me-1" style={{ color: "#c9a84c" }}></i> Update Password
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div
                className="p-4 mb-4"
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0d1b2a", marginBottom: 16 }}>
                  Notifications & Preferences
                </h5>

                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                  <div>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.9rem" }}>Order Status Updates</div>
                    <div style={{ fontSize: "0.78rem", color: "#777" }}>Receive SMS and email alerts about tracking and deliveries</div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={orderNotif}
                      onChange={(e) => setOrderNotif(e.target.checked)}
                      style={{ cursor: "pointer", width: 40, height: 20 }}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
                  <div>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.9rem" }}>Email Invoices & Receipts</div>
                    <div style={{ fontSize: "0.78rem", color: "#777" }}>Send PDF invoice copies for every completed order</div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      style={{ cursor: "pointer", width: 40, height: 20 }}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between py-2">
                  <div>
                    <div style={{ fontWeight: 600, color: "#0d1b2a", fontSize: "0.9rem" }}>Exclusive Member Promotions</div>
                    <div style={{ fontSize: "0.78rem", color: "#777" }}>Early access to sales, seasonal discounts, and curated drops</div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={promoNotif}
                      onChange={(e) => setPromoNotif(e.target.checked)}
                      style={{ cursor: "pointer", width: 40, height: 20 }}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div
                className="p-4"
                style={{
                  background: "#fff5f5",
                  borderRadius: 16,
                  border: "1.5px solid rgba(220,53,69,0.25)",
                  boxShadow: "0 2px 12px rgba(220,53,69,0.05)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="fa fa-exclamation-triangle text-danger"></i>
                  <h5 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#dc3545", margin: 0 }}>
                    Danger Zone
                  </h5>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 16 }}>
                  Permanently delete your ShopKaro account and all associated personal data, including order histories, saved addresses, and wishlist collections. This action cannot be undone.
                </p>

                <button
                  type="button"
                  onClick={() => setDeleteModal(true)}
                  className="btn btn-outline-danger rounded-pill px-4 py-2"
                  style={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <i className="fa fa-trash-alt me-1"></i> Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13, 27, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              maxWidth: 480,
              width: "100%",
              padding: "32px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "skFadeSlideUp 0.3s ease-out",
            }}
          >
            <div className="text-center mb-3">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(220,53,69,0.12)",
                  color: "#dc3545",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 12,
                }}
              >
                <i className="fa fa-trash-alt"></i>
              </div>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#0d1b2a", marginBottom: 6 }}>
                Delete Your Account?
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5 }}>
                This will permanently delete your account, orders, addresses, and wishlist. Please type <strong>DELETE</strong> below to confirm.
              </p>
            </div>

            {deleteError && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.82rem" }}>
                <i className="fa fa-exclamation-circle me-1"></i> {deleteError}
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                className="form-control text-center font-monospace"
                placeholder="Type DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  border: "2px solid #e0d8c8",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                }}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light rounded-pill flex-fill py-2"
                onClick={() => { setDeleteModal(false); setConfirmText(""); setDeleteError(""); }}
                style={{ fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="btn btn-danger rounded-pill flex-fill py-2"
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {deleting ? (
                  <span><i className="fa fa-spinner fa-spin me-1"></i> Deleting...</span>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
