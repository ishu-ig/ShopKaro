import React from 'react';
import HeroSection from '../Components/HeroSection';
import Cart from '../Components/Cart';

export default function CartPage() {
  return (
    <>
      <HeroSection title="Cart" />
      <div style={{ background: 'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight: '100vh', padding: '40px 0 100px' }}>
        <div className="container">
          <Cart title="Cart" />
        </div>
      </div>
    </>
  );
}