import React, { useEffect, useState } from "react";

const ECOM_STATUS_MESSAGES = [
  "Preparing product catalogue...",
  "Syncing inventory & stock...",
  "Loading customer orders...",
  "Getting ShopKaro ready...",
];

export default function EcomPreloader({ minDuration = 900, onFinished }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Cycle e-commerce status messages
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ECOM_STATUS_MESSAGES.length);
    }, 450);

    // Smooth progress bar simulation
    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const jump = Math.floor(Math.random() * 20) + 10;
        return Math.min(prev + jump, 95);
      });
    }, 200);

    // Complete after minDuration
    const finishTimer = setTimeout(() => {
      setProgress(100);
      setFading(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 420); // wait for fade transition to finish
      return () => clearTimeout(removeTimer);
    }, minDuration);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
      clearTimeout(finishTimer);
    };
  }, [minDuration, onFinished]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .ecom-preloader-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(248, 250, 252, 0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      visibility 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-bs-theme="dark"] .ecom-preloader-backdrop,
        [data-theme="dark"] .ecom-preloader-backdrop {
          background: rgba(15, 23, 42, 0.96);
        }

        .ecom-preloader-backdrop.fade-out {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .ecom-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.25rem 2.5rem;
          max-width: 360px;
          width: 90%;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 20px 45px -10px rgba(79, 70, 229, 0.18),
                      0 10px 25px -5px rgba(15, 23, 42, 0.08);
          transform: translateY(0);
          animation: cardPop 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        [data-bs-theme="dark"] .ecom-card,
        [data-theme="dark"] .ecom-card {
          background: rgba(30, 41, 59, 0.85);
          border-color: rgba(51, 65, 85, 0.9);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 30px rgba(99, 102, 241, 0.18);
        }

        @keyframes cardPop {
          0% { opacity: 0; transform: scale(0.92) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Ambient Glow behind cart */
        .ecom-glow-ring {
          position: absolute;
          top: 30px;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(236, 72, 153, 0.18) 60%, transparent 75%);
          filter: blur(16px);
          animation: pulseGlow 2s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.25); opacity: 1; }
        }

        /* Cart Stage Animation */
        .cart-stage {
          position: relative;
          width: 100px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .cart-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: cartBob 1.6s ease-in-out infinite;
        }

        @keyframes cartBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .cart-main-icon {
          font-size: 3.2rem;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 6px 12px rgba(99, 102, 241, 0.3));
        }

        /* Items dropping into the shopping cart */
        .dropping-item {
          position: absolute;
          font-size: 0.95rem;
          color: #fff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .dropping-item-1 {
          top: -2px;
          left: 36px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          animation: itemDrop1 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .dropping-item-2 {
          top: 6px;
          left: 54px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          animation: itemDrop2 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite 0.25s;
        }

        .dropping-item-3 {
          top: -6px;
          left: 48px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 50%;
          animation: itemDrop3 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite 0.5s;
        }

        @keyframes itemDrop1 {
          0% { transform: translateY(-24px) scale(0.6) rotate(-20deg); opacity: 0; }
          40% { transform: translateY(0) scale(1) rotate(6deg); opacity: 1; }
          75%, 100% { transform: translateY(2px) scale(0.95) rotate(0deg); opacity: 1; }
        }

        @keyframes itemDrop2 {
          0% { transform: translateY(-22px) scale(0.6) rotate(15deg); opacity: 0; }
          45% { transform: translateY(0) scale(1) rotate(-8deg); opacity: 1; }
          80%, 100% { transform: translateY(2px) scale(0.95) rotate(0deg); opacity: 1; }
        }

        @keyframes itemDrop3 {
          0% { transform: translateY(-26px) scale(0.5); opacity: 0; }
          50% { transform: translateY(0) scale(1); opacity: 1; }
          85%, 100% { transform: translateY(1px) scale(0.9); opacity: 1; }
        }

        /* Road speed lines underneath cart */
        .cart-speed-track {
          position: absolute;
          bottom: 2px;
          width: 68px;
          height: 3px;
          background: rgba(226, 232, 240, 0.7);
          border-radius: 3px;
          overflow: hidden;
        }
        [data-bs-theme="dark"] .cart-speed-track,
        [data-theme="dark"] .cart-speed-track {
          background: rgba(51, 65, 85, 0.7);
        }

        .cart-speed-dash {
          width: 24px;
          height: 100%;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          border-radius: 3px;
          animation: speedTrack 0.75s linear infinite;
        }
        @keyframes speedTrack {
          0% { transform: translateX(-30px); }
          100% { transform: translateX(70px); }
        }

        /* Brand Title */
        .ecom-brand-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.15rem;
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 60%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        [data-bs-theme="dark"] .ecom-brand-title,
        [data-theme="dark"] .ecom-brand-title {
          background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 60%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ecom-badge {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(99, 102, 241, 0.12);
          color: #4f46e5;
          margin-bottom: 1.15rem;
        }
        [data-bs-theme="dark"] .ecom-badge,
        [data-theme="dark"] .ecom-badge {
          background: rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
        }

        /* Progress Bar */
        .ecom-progress-container {
          width: 100%;
          height: 5px;
          background: rgba(226, 232, 240, 0.85);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          margin-bottom: 0.85rem;
        }
        [data-bs-theme="dark"] .ecom-progress-container,
        [data-theme="dark"] .ecom-progress-container {
          background: rgba(51, 65, 85, 0.85);
        }

        .ecom-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
          border-radius: 999px;
          transition: width 0.22s ease-out;
          position: relative;
        }

        .ecom-progress-bar::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Status message */
        .ecom-status-text {
          font-size: 0.82rem;
          font-weight: 500;
          color: #64748b;
          min-height: 1.2rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s ease;
        }
        [data-bs-theme="dark"] .ecom-status-text,
        [data-theme="dark"] .ecom-status-text {
          color: #94a3b8;
        }

        .ecom-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4f46e5;
          animation: blinkDot 1s infinite alternate;
        }
        @keyframes blinkDot {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <aside
        className={`ecom-preloader-backdrop ${fading ? "fade-out" : ""}`}
        role="progressbar"
        aria-label="Loading ShopKaro Commerce Suite"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="ecom-card">
          <div className="ecom-glow-ring" />

          {/* E-Commerce Shopping Cart Animation */}
          <div className="cart-stage">
            <div className="cart-wrapper">
              <i className="bi bi-cart4 cart-main-icon" aria-hidden="true" />
              {/* Dropping products */}
              <div className="dropping-item dropping-item-1" title="Parcel">
                <i className="bi bi-box-seam" style={{ fontSize: "0.68rem" }} />
              </div>
              <div className="dropping-item dropping-item-2" title="Discount tag">
                <i className="bi bi-tag" style={{ fontSize: "0.65rem" }} />
              </div>
              <div className="dropping-item dropping-item-3" title="Order">
                <i className="bi bi-gem" style={{ fontSize: "0.55rem" }} />
              </div>
            </div>
            <div className="cart-speed-track">
              <div className="cart-speed-dash" />
            </div>
          </div>

          {/* Branding */}
          <div className="ecom-brand-title">
            <span>ShopKaro</span>
          </div>
          <span className="ecom-badge">Commerce Suite</span>

          {/* Progress Bar */}
          <div className="ecom-progress-container">
            <div className="ecom-progress-bar" style={{ width: `${progress}%` }} />
          </div>

          {/* Rotating Status */}
          <div className="ecom-status-text">
            <span className="ecom-dot" />
            <span>{ECOM_STATUS_MESSAGES[msgIndex]}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
