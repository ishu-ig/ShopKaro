import React from "react";

export default function AccountSetting() {
  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div
          className="card border-0 shadow-sm text-center mx-auto"
          style={{ maxWidth: "700px", borderRadius: "18px" }}
        >
          <div className="card-body py-5 px-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-4"
              style={{ width: "90px", height: "90px" }}
            >
              <i
                className="bi bi-gear-wide-connected text-warning"
                style={{ fontSize: "2.8rem" }}
              ></i>
            </div>

            <h2 className="fw-bold mb-3">Account Settings</h2>

            <p className="text-muted fs-5 mb-4">
              We're working hard to bring you a powerful account management
              experience.
            </p>

            <div
              className="alert alert-warning d-inline-flex align-items-center gap-2 px-4 py-3"
              role="alert"
            >
              <i className="bi bi-tools"></i>
              <strong>This service will be available soon.</strong>
            </div>

            <p className="text-secondary mt-4 mb-0">
              Thank you for your patience. Stay tuned for upcoming updates!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}