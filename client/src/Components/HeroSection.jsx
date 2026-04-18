import React from 'react'
import { Link } from 'react-router-dom'

export default function HeroSection({ title }) {
  return (
    <>
      <style>{`
        
      `}</style>

      <div className="hero-banner">
        <div className="container hero-inner">
          <div className="hero-eyebrow">ShopKaro</div>
          <h1 className="hero-title">{title}</h1>
          <nav className="hero-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <span className="hero-breadcrumb-sep">&#9670;</span>
            <span className="hero-breadcrumb-current">{title}</span>
          </nav>
        </div>
      </div>
    </>
  )
}