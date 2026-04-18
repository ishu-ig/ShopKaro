import React, { useEffect, useRef, useState } from 'react'

const facts = [
  { value: 100,    suffix: '+', label: 'Top Brands',        icon: '🏅' },
  { value: 1000,   suffix: '+', label: 'Products',          icon: '📦' },
  { value: 7,      suffix: '',  label: 'Day Refund Policy', icon: '🔄' },
  { value: 100000, suffix: '+', label: 'Happy Customers',   icon: '😊' },
]

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function StatCard({ value, suffix = '', label, icon, delay, triggerCount }) {
  const count = useCountUp(value, 1800, triggerCount)

  return (
    <div
      className="stat-card"
      style={{
        animationDelay: `${delay}ms`,
        animation: triggerCount ? 'slideUp 0.6s ease forwards' : 'none',
        opacity: triggerCount ? undefined : 0,
      }}
    >
      <span className="stat-icon">{icon}</span>
      <div className="stat-number">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Fact() {
  const [triggered, setTriggered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .fact-strip {
          background: linear-gradient(135deg, #0d1b2a 0%, #162236 50%, #0d1b2a 100%);
          padding: 60px 0;
          position: relative;
          overflow: hidden;
        }
        .fact-strip::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(201,168,76,0.03) 40px,
            rgba(201,168,76,0.03) 41px
          );
        }
        .fact-strip::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
        }
        .facts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .facts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .facts-grid { grid-template-columns: 1fr; }
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          position: relative;
          opacity: 0;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent);
        }
        .stat-card:last-child::after { display: none; }
        .stat-icon {
          font-size: 28px;
          margin-bottom: 12px;
          filter: grayscale(0.2);
        }
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #c9a84c;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="fact-strip d-none d-lg-block" ref={ref}>
        <div className="facts-grid">
          {facts.map((f, i) => (
            <StatCard
              key={f.label}
              value={f.value}
              suffix={f.suffix}
              label={f.label}
              icon={f.icon}
              delay={i * 150}
              triggerCount={triggered}
            />
          ))}
        </div>
      </div>
    </>
  )
}