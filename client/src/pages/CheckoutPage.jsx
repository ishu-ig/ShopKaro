import React from 'react';
import HeroSection from '../Components/HeroSection';
import Profile from '../Components/Profile';
import Cart from '../Components/Cart';

export default function CheckoutPage() {
  return (
    <>
      <HeroSection title="Checkout" />
      <div style={{ background: 'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight: '100vh', padding: '40px 0 100px' }}>
        <div className="container">

          {/* Page label */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', color: '#C8400A', textTransform: 'uppercase', marginBottom: 3 }}>Step 2 of 2</p>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#1C1009', margin: 0 }}>Checkout</h2>
          </div>

          {/* Two columns — stack on mobile (col-12), side-by-side on ≥md */}
          <div className="row g-4 align-items-start">
            <div className="col-12 col-md-6">
              <Profile title="Checkout" />
            </div>
            <div className="col-12 col-md-6">
              <Cart title="Checkout" />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}