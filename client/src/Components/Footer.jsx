import React, { useState } from "react";
import { Link } from "react-router-dom";

const QUICK_LINKS_1 = [
  { to: "/",           label: "Home"        },
  { to: "/about",      label: "About Us"    },
  { to: "/feature",    label: "Features"    },
  { to: "/product",    label: "Products"    },
  { to: "/testimonial",label: "Testimonial" },
];

const QUICK_LINKS_2 = [
  { to: "/contactUs",  label: "Contact Us"         },
  { to: "#",           label: "Privacy Policy"      },
  { to: "#",           label: "Terms & Conditions"  },
  { to: "#",           label: "Refund Policy"       },
  { to: "#",           label: "Delivery Policy"     },
];

const SOCIALS = [
  { icon: "fab fa-facebook-f",  href: "#" },
  { icon: "fab fa-twitter",     href: "#" },
  { icon: "fab fa-instagram",   href: "#" },
  { icon: "fab fa-linkedin-in", href: "#" },
];

export default function Footer() {
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function postData(e) {
    e.preventDefault();
    if (!email.trim()) { setMessage("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/newsletter`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      response = await response.json();
      if (response.result === "Done") {
        setMessage("🎉 Thanks for subscribing!");
        setEmail("");
      } else {
        setMessage(response.reason?.email || "Something went wrong.");
      }
    } catch {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer style={{ background: 'linear-gradient(180deg, #070d14 0%, #0d1b2a 100%)', color: 'rgba(255,255,255,0.65)', fontFamily: "'Plus Jakarta Sans', sans-serif", borderTop: '1px solid rgba(201,168,76,0.15)' }}>

      {/* Main footer body */}
      <div className="container" style={{ padding: '64px 20px 40px 20px' }}>
        <div className="row g-5">

          {/* Brand col */}
          <div className="col-lg-3 col-md-6">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, background: '#c9a84c', transform: 'rotate(45deg)', marginRight: 10, boxShadow: '0 0 10px rgba(201,168,76,0.8)' }}></span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1.85rem', color: 'white', margin: 0, letterSpacing: '0.02em' }}>
                  Shop<span style={{ color: '#c9a84c', fontStyle: 'italic' }}>Karo</span>
                </h2>
              </div>
            </Link>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.75, marginBottom: 24, color: 'rgba(255,255,255,0.55)' }}>
              Your premier destination for verified luxury brands, top trends, and premium shopping experiences with seamless delivery.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map(({ icon, href }) => (
                <a key={icon} href={href} style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  fontSize: '0.85rem',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#c9a84c'; e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#070d14'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <i className={icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Contact col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontWeight: 700, fontSize: '1.05rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              Get In Touch
            </h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'fa-map-marker-alt', text: 'New Delhi, India',             href: '#' },
                { icon: 'fa-phone-alt',      text: '+91-9873848046',              href: 'tel:+919873848046' },
                { icon: 'fa-whatsapp fab',   text: '+91 82186 35344',             href: 'https://wa.me/8218635344' },
                { icon: 'fa-envelope',       text: 'vishankchauhan@gmail.com',    href: 'mailto:vishankchauhan@gmail.com' },
              ].map(({ icon, text, href }) => (
                <a key={text} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.86rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e8c873'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa ${icon}`} style={{ color: '#c9a84c', fontSize: '0.82rem' }}></i>
                  </span>
                  {text}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontWeight: 700, fontSize: '1.05rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              Explore ShopKaro
            </h6>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[...QUICK_LINKS_1, ...QUICK_LINKS_2].map(({ to, label }) => (
                <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e8c873'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <i className="fa fa-angle-right" style={{ fontSize: '0.75rem', color: '#c9a84c' }}></i>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: "'Playfair Display', serif", color: 'white', fontWeight: 700, fontSize: '1.05rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              VIP Newsletter
            </h6>
            <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.55)', marginBottom: 18, lineHeight: 1.7 }}>
              {message
                ? <span style={{ color: message.startsWith('🎉') ? '#27a85a' : '#e04444', fontWeight: 600 }}>{message}</span>
                : 'Subscribe to receive private sale invites, exclusive discounts, and new arrivals.'}
            </p>
            <form onSubmit={postData}>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '1px solid rgba(201,168,76,0.2)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white', fontSize: '0.88rem', outline: 'none',
                    transition: 'border-color 0.25s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#c9a84c'}
                  onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 0',
                  background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #c9a84c, #e8c873)',
                  color: '#070d14', border: 'none', borderRadius: 10,
                  fontWeight: 800, fontSize: '0.86rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s ease', letterSpacing: '0.06em', textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,168,76,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,168,76,0.3)')}
              >
                {loading ? 'Subscribing…' : 'Join VIP Club →'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 0', background: 'rgba(0,0,0,0.25)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>
            © {new Date().getFullYear()} <span style={{ color: '#c9a84c', fontWeight: 700 }}>ShopKaro</span>. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
            <span>🔒 100% Secure Checkout</span>
            <span>•</span>
            <span>⚡ Express Delivery</span>
            <span>•</span>
            <span>🔄 7-Day Returns</span>
          </div>
        </div>
      </div>

    </footer>
  );
}