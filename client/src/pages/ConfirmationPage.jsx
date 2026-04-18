import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ConfirmationPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ background: 'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 48px rgba(28,16,9,0.12)',
        border: '1px solid rgba(200,64,10,0.08)',
        padding: 'clamp(32px,6vw,56px) clamp(24px,6vw,52px)',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>

        {/* Success icon ring */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '3px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <i className="fa fa-check" style={{ color: '#10b981', fontSize: '2rem' }}></i>
        </div>

        {/* Decorative line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          <span style={{ width: 36, height: 3, background: '#C8400A', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F4A044', display: 'block' }} />
          <span style={{ width: 56, height: 3, background: '#F4A044', borderRadius: 2, display: 'block', opacity: 0.5 }} />
        </div>

        <h1 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.2rem)', color: '#1C1009', marginBottom: 8 }}>
          Thank You!
        </h1>
        <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 600, fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: '#7A6E65', marginBottom: 14 }}>
          Your order has been placed successfully
        </h3>
        <p style={{ color: '#7A6E65', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 32 }}>
          We'll notify you once your order is confirmed. You can track your shipment in the <strong style={{ color: '#1C1009' }}>Orders</strong> section.
        </p>

        {/* Order confirmation chip */}
        <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 20px', marginBottom: 28, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#059669', fontWeight: 600 }}>
          <i className="fa fa-box" style={{ fontSize: '0.9rem' }}></i>
          Order is being prepared
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/order"
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#C8400A,#E86834)', color: 'white', textDecoration: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 18px rgba(200,64,10,0.25)', transition: 'opacity 0.2s,transform 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
          >
            <i className="fa fa-box" style={{ fontSize: '0.8rem' }}></i> My Orders
          </Link>
          <Link to="/shop"
            style={{ padding: '12px 28px', background: 'transparent', border: '1.5px solid rgba(200,64,10,0.3)', color: '#C8400A', textDecoration: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C8400A'; }}
          >
            <i className="fa fa-shopping-bag" style={{ fontSize: '0.8rem' }}></i> Shop More
          </Link>
        </div>

      </div>
    </div>
  );
}