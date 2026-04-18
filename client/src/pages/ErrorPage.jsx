import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>

        {/* Big 404 */}
        <div style={{ position: 'relative', marginBottom: 8, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(7rem,22vw,10rem)', color: 'rgba(200,64,10,0.08)', display: 'block', letterSpacing: '-0.04em', userSelect: 'none' }}>
            404
          </span>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(200,64,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa fa-utensils" style={{ fontSize: '2rem', color: '#C8400A', opacity: 0.6 }}></i>
            </div>
          </div>
        </div>

        {/* Decorative line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
          <span style={{ width: 36, height: 3, background: '#C8400A', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F4A044', display: 'block' }} />
          <span style={{ width: 56, height: 3, background: '#F4A044', borderRadius: 2, display: 'block', opacity: 0.5 }} />
        </div>

        <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: '#1C1009', marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: '#7A6E65', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/"
            style={{ padding: '13px 32px', background: 'linear-gradient(135deg,#C8400A,#E86834)', color: 'white', textDecoration: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(200,64,10,0.25)', transition: 'opacity 0.2s,transform 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
          >
            <i className="fa fa-home" style={{ fontSize: '0.82rem' }}></i> Go Home
          </Link>
          <Link to="/product"
            style={{ padding: '13px 32px', background: 'transparent', border: '1.5px solid rgba(200,64,10,0.3)', color: '#C8400A', textDecoration: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C8400A'; }}
          >
            <i className="fa fa-utensils" style={{ fontSize: '0.82rem' }}></i> Browse Menu
          </Link>
        </div>

      </div>
    </div>
  );
}