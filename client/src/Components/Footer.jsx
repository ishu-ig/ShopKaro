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
    <footer style={{ background: '#0d1117', color: 'rgba(255,255,255,0.55)', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Main footer body */}
      <div className="container" style={{ padding: '64px 20px 50px 20px' }}>
        <div className="row g-5">

          {/* Brand col */}
          <div className="col-lg-3 col-md-6">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: '1.75rem', color: 'white', marginBottom: 16 }}>
                Eazy<span style={{ color: '#C8400A' }}>Dine</span>
              </h2>
            </Link>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.75, marginBottom: 24, color: 'rgba(255,255,255,0.45)' }}>
              Bringing you the finest dining experiences with up to 50% off on top restaurants and premium food products.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map(({ icon, href }) => (
                <a key={icon} href={href} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  transition: 'all 0.25s',
                  fontSize: '0.78rem',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.borderColor = '#C8400A'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                >
                  <i className={icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Contact col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Contact Us
            </h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'fa-map-marker-alt', text: '123 Street, New York, USA',       href: '#' },
                { icon: 'fa-phone-alt',      text: '+123 456 7890',                   href: 'tel:+1234567890' },
                { icon: 'fa-whatsapp fab',   text: '+91 82186 35344',                 href: 'https://wa.me/8218635344' },
                { icon: 'fa-envelope',       text: 'info@example.com',                href: 'mailto:info@example.com' },
              ].map(({ icon, text, href }) => (
                <a key={text} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '0.86rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(200,64,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa ${icon}`} style={{ color: '#C8400A', fontSize: '0.78rem' }}></i>
                  </span>
                  {text}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Quick Links
            </h6>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {[...QUICK_LINKS_1, ...QUICK_LINKS_2].map(({ to, label }) => (
                <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C8400A'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                >
                  <i className="fa fa-angle-right" style={{ fontSize: '0.7rem', color: '#C8400A' }}></i>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter col */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              Newsletter
            </h6>
            <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.7 }}>
              {message
                ? <span style={{ color: message.startsWith('🎉') ? '#10b981' : '#f43f5e', fontWeight: 600 }}>{message}</span>
                : 'Subscribe for the latest deals, new dishes, and restaurant updates.'}
            </p>
            <form onSubmit={postData}>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 16px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white', fontSize: '0.86rem', outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#C8400A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '11px 0',
                  background: loading ? 'rgba(200,64,10,0.5)' : 'linear-gradient(135deg,#C8400A,#E86834)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.86rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s', letterSpacing: '0.04em',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {loading ? 'Subscribing…' : 'Subscribe →'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '18px 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} <span style={{ color: '#C8400A', fontWeight: 600 }}>EazyDine</span>. All rights reserved.
          </span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.25)' }}>
            Made with <span style={{ color: '#f43f5e' }}>♥</span> for food lovers
          </span>
        </div>
      </div>

    </footer>
  );
}