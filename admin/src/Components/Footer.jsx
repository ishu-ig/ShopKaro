import React from "react";

export default function Footer() {
  return (
    <footer className="admin-footer">
      <div className="container-fluid px-3 px-lg-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-body">ShopKaro Admin</span>
          <span className="text-muted">•</span>
          <span className="text-muted">© {new Date().getFullYear()} All rights reserved</span>
        </div>
        <div className="d-flex align-items-center gap-3 footer-links text-muted small">
          <span>Version 2.4.0</span>
          <span>•</span>
          <span className="badge bg-success-subtle text-success border-0">All Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}