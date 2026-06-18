import React from "react";

export default function Footer() {
  return (
    <footer className="admin-footer">
      <div className="container-fluid px-3 px-lg-4">
        <span>
          Copyright 2026 adminHMD.{" "}
          <br />
          Developed by{" "}
          <a target="_blank" rel="noreferrer" className="fw-bold text-success" href="https://github.com/HasanMahmudDev">
            Md. Hasan Mahmud
          </a>{" "}
          · Distributed by{" "}
          <a target="_blank" rel="noreferrer" className="fw-bold text-success" href="https://themewagon.com">
            ThemeWagon
          </a>
        </span>
        <span>Professional dashboard template.</span>
      </div>
    </footer>
  );
}