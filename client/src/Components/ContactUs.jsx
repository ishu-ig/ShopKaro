import React, { useState } from "react";
import { useDispatch } from "react-redux";
import formValidator from "../FormValidator/formValidator";
import { createContactUs } from "../Redux/ActionCreartors/ContactUsActionCreators";

const CONTACT_CARDS = [
  { icon: "fa-map-marker-alt", label: "Address",   value: "A-43 Sector-16, Noida",  href: "https://www.google.com/maps?q=A-43+Sector-16+Noida", color: '#C8400A' },
  { icon: "fa-phone-alt",      label: "Call Us",   value: "+012 3456 7890",          href: "tel:+0123456789",                                    color: '#2563eb' },
  { icon: "fa-envelope",       label: "Email Us",  value: "info@example.com",        href: "mailto:info@example.com",                            color: '#059669' },
  { icon: "fa-whatsapp fab",   label: "WhatsApp",  value: "+91-8218635347",          href: "https://wa.me/918218635347",                         color: '#25d366' },
];

const inputBase = (hasError) => ({
  width: '100%',
  padding: '12px 16px',
  border: `1.5px solid ${hasError ? 'rgba(244,63,94,0.5)' : 'rgba(200,64,10,0.15)'}`,
  borderRadius: 12,
  fontSize: '0.9rem',
  color: '#1C1009',
  background: hasError ? '#fff5f7' : 'white',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'DM Sans, sans-serif',
  boxSizing: 'border-box',
});

export default function ContactUs() {
  const [data, setData] = useState({ name:"", email:"", phone:"", subject:"", message:"" });
  const [errorMessage, setErrorMessage] = useState({
    name:"Name is required", email:"Email is required", phone:"Phone is required",
    subject:"Subject is required", message:"Message is required",
  });
  const [show, setShow]       = useState(false);
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();

  const getInputData = (e) => {
    const { name, value } = e.target;
    setErrorMessage(old => ({ ...old, [name]: formValidator(e) }));
    setData(old => ({ ...old, [name]: value }));
  };

  const postData = (e) => {
    e.preventDefault();
    const error = Object.values(errorMessage).find(x => x !== "");
    if (error) { setShow(true); return; }
    dispatch(createContactUs({ ...data, active: true, date: new Date() }));
    setSuccess("Thanks for reaching out! Our team will contact you soon. 🎉");
    setData({ name:"", email:"", phone:"", subject:"", message:"" });
    setShow(false);
  };

  const FIELDS = [
    { type:"text",   name:"name",    placeholder:"Your Full Name"    },
    { type:"email",  name:"email",   placeholder:"Your Email Address" },
    { type:"number", name:"phone",   placeholder:"Your Phone Number"  },
    { type:"text",   name:"subject", placeholder:"Subject"           },
  ];

  return (
    <div style={{ padding:'72px 0 100px', background:'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight:'100vh' }}>
      <div className="container">

        {/* Section heading */}
        <div className="text-center mb-5">
          <p style={{ fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.15em', color:'#C8400A', textTransform:'uppercase', marginBottom:8 }}>Reach Out</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:900, color:'#1C1009', marginBottom:12 }}>
            Contact Us
          </h2>
          <p style={{ color:'#7A6E65', maxWidth:480, margin:'0 auto', fontSize:'0.95rem' }}>
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:16 }}>
            <span style={{ width:36, height:3, background:'#C8400A', borderRadius:2, display:'block' }} />
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#F4A044', display:'block' }} />
            <span style={{ width:56, height:3, background:'#F4A044', borderRadius:2, display:'block', opacity:0.5 }} />
          </div>
        </div>

        {/* Contact cards */}
        <div className="row g-3 mb-5">
          {CONTACT_CARDS.map(({ icon, label, value, href, color }) => (
            <div key={label} className="col-md-6 col-lg-3">
              <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration:'none', display:'block' }}>
                <div style={{ background:'white', borderRadius:16, padding:'20px 20px', border:'1px solid rgba(200,64,10,0.08)', boxShadow:'0 2px 12px rgba(28,16,9,0.06)', transition:'all 0.3s', display:'flex', alignItems:'center', gap:14 }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(28,16,9,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(28,16,9,0.06)'; }}
                >
                  <div style={{ width:46, height:46, borderRadius:12, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`fa ${icon}`} style={{ color, fontSize:'1.1rem' }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#7A6E65', marginBottom:3 }}>{label}</div>
                    <div style={{ fontWeight:600, fontSize:'0.88rem', color:'#1C1009' }}>{value}</div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Map + Form */}
        <div className="row g-4 align-items-stretch">

          {/* Map */}
          <div className="col-lg-6">
            <div style={{ borderRadius:20, overflow:'hidden', height:'100%', minHeight:420, boxShadow:'0 4px 24px rgba(28,16,9,0.1)', border:'1px solid rgba(200,64,10,0.08)' }}>
              <iframe
                width="100%" height="100%" title="map"
                src="https://maps.google.com/maps?q=A-43%20Sector-16%20Noida&t=&z=13&ie=UTF8&iwloc=&output=embed"
                style={{ minHeight:420, border:0, display:'block' }}
                allowFullScreen="" loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="col-lg-6">
            <div style={{ background:'white', borderRadius:20, padding:'32px 28px', boxShadow:'0 4px 24px rgba(28,16,9,0.08)', border:'1px solid rgba(200,64,10,0.08)', height:'100%', boxSizing:'border-box' }}>

              {/* Form header */}
              <div style={{ marginBottom:24 }}>
                <h4 style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.25rem', color:'#1C1009', marginBottom:4 }}>Send a Message</h4>
                <p style={{ color:'#7A6E65', fontSize:'0.85rem', margin:0 }}>We typically reply within 24 hours.</p>
              </div>

              {success && (
                <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:'0.88rem', color:'#059669', fontWeight:600 }}>
                  {success}
                </div>
              )}

              {show && Object.values(errorMessage).some(x => x) && (
                <div style={{ background:'rgba(244,63,94,0.06)', border:'1px solid rgba(244,63,94,0.18)', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:'0.85rem', color:'#e11d48', display:'flex', alignItems:'center', gap:8 }}>
                  <i className="fa fa-exclamation-circle"></i> Please fix the errors below.
                </div>
              )}

              <form onSubmit={postData}>
                <div className="row g-3">
                  {FIELDS.map(({ type, name, placeholder }) => (
                    <div key={name} className={name === 'subject' ? 'col-12' : 'col-md-6 col-12'}>
                      <input
                        type={type} name={name} value={data[name]}
                        onChange={getInputData}
                        placeholder={placeholder}
                        style={inputBase(show && errorMessage[name])}
                        onFocus={e => { e.target.style.borderColor='#C8400A'; e.target.style.boxShadow='0 0 0 3px rgba(200,64,10,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = show && errorMessage[name] ? 'rgba(244,63,94,0.5)' : 'rgba(200,64,10,0.15)'; e.target.style.boxShadow='none'; }}
                      />
                      {show && errorMessage[name] && (
                        <p style={{ fontSize:'0.72rem', color:'#f43f5e', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                          <i className="fa fa-times-circle"></i>{errorMessage[name]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="col-12">
                    <textarea
                      name="message" rows={4} value={data.message}
                      onChange={getInputData}
                      placeholder="Your message…"
                      style={{ ...inputBase(show && errorMessage.message), resize:'vertical', lineHeight:1.65 }}
                      onFocus={e => { e.target.style.borderColor='#C8400A'; e.target.style.boxShadow='0 0 0 3px rgba(200,64,10,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = show && errorMessage.message ? 'rgba(244,63,94,0.5)' : 'rgba(200,64,10,0.15)'; e.target.style.boxShadow='none'; }}
                    />
                    {show && errorMessage.message && (
                      <p style={{ fontSize:'0.72rem', color:'#f43f5e', margin:'5px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                        <i className="fa fa-times-circle"></i>{errorMessage.message}
                      </p>
                    )}
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      style={{ width:'100%', padding:'13px 0', background:'linear-gradient(135deg,#C8400A,#E86834)', color:'white', border:'none', borderRadius:50, fontWeight:700, fontSize:'0.92rem', cursor:'pointer', transition:'all 0.25s', boxShadow:'0 8px 20px rgba(200,64,10,0.25)', letterSpacing:'0.03em', fontFamily:'DM Sans,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform=''; }}
                    >
                      <i className="fa fa-paper-plane" style={{ fontSize:'0.82rem' }}></i>
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}