import React, { useEffect, useState, useRef } from 'react';
import HeroSection from '../Components/HeroSection';
import { useNavigate } from 'react-router-dom';
import formValidator from '../FormValidator/formValidator';
import imageValidator from '../FormValidator/imageValidator';

const inputStyle = (hasError, show) => ({
  width: '100%',
  padding: '11px 16px',
  border: `1.5px solid ${show && hasError ? '#f43f5e' : 'rgba(200,64,10,0.2)'}`,
  borderRadius: 12,
  fontSize: '0.9rem',
  color: '#1C1009',
  background: show && hasError ? '#fff5f7' : 'white',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'DM Sans, sans-serif',
});

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#7A6E65',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
};

const errorStyle = {
  fontSize: '0.75rem',
  color: '#f43f5e',
  marginTop: 5,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

export default function UpdateProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState({
    name: "", phone: "", address: "",
    city: "", state: "", pin: "", pic: ""
  });
  const [errorMessage, setErrorMessage] = useState({
    name: "", phone: "", pic: "",
  });
  const [show, setShow] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;

    if (name !== "active") {
      setErrorMessage(old => ({
        ...old,
        [name]: e.target.files ? imageValidator(e) : formValidator(e)
      }));
    }

    if (e.target.files && e.target.files[0]) {
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }

    setData(old => ({ ...old, [name]: value }));
  }

  async function postData(e) {
    e.preventDefault();
    const error = Object.values(errorMessage).find(x => x !== "");
    if (error) {
      setShow(true);
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_id", data._id);
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("address", data.address);
      formData.append("pin", data.pin);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("pic", data.pic);

      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
        {
          method: "PUT",
          headers: { "authorization": localStorage.getItem("token") },
          body: formData
        }
      );
      response = await response.json();
      if (response.result === "Done") navigate("/profile");
      else alert("Something went wrong");
    } catch {
      alert("Internal Server Error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              "authorization": localStorage.getItem("token")
            }
          }
        );
        response = await response.json();
        if (response.result === "Done") {
          setData(response.data);
          if (response.data?.pic) {
            setPreviewUrl(response.data.pic);
          }
        }
      } catch {
        alert("Internal Server Error");
      }
    })();
  }, []);

  const hasErrors = show && Object.values(errorMessage).some(x => x !== "");

  return (
    <>
      <HeroSection title="Update Your Profile" />

      <div style={{
        padding: '60px 0 80px',
        background: 'linear-gradient(135deg, #FDF6EE 0%, #FFF8F3 100%)',
        minHeight: '70vh',
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-7 col-lg-8 col-md-10 col-12">

              {/* Card */}
              <div style={{
                background: 'white',
                borderRadius: 24,
                boxShadow: '0 8px 40px rgba(28,16,9,0.1)',
                border: '1px solid rgba(200,64,10,0.08)',
                overflow: 'hidden',
              }}>

                {/* Card Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A1A2E 0%, #2d1b4e 100%)',
                  padding: '32px 36px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                }}>
                  {/* Avatar preview */}
                  <div
                    style={{
                      width: 80, height: 80,
                      borderRadius: '50%',
                      border: '3px solid rgba(200,64,10,0.5)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      background: 'rgba(255,255,255,0.1)',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to change photo"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa fa-user" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '2rem' }}></i>
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <i className="fa fa-camera" style={{ color: 'white', fontSize: '1.1rem' }}></i>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(200,64,10,0.8)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Account Settings
                    </p>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: '1.5rem', color: 'white', margin: 0 }}>
                      Update Profile
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', marginTop: 4, marginBottom: 0 }}>
                      {data.name || 'Your Name'} · Edit your details below
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={postData} style={{ padding: '32px 36px' }}>

                  {/* Error banner */}
                  {hasErrors && (
                    <div style={{
                      background: '#fff5f7', border: '1px solid rgba(244,63,94,0.2)',
                      borderRadius: 12, padding: '12px 16px', marginBottom: 24,
                      display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#be123c',
                    }}>
                      <i className="fa fa-exclamation-circle"></i>
                      Please fix the errors below before submitting.
                    </div>
                  )}

                  {/* Name + Phone */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={data.name}
                        placeholder="e.g. Ishaan Gupta"
                        onChange={getInputData}
                        style={inputStyle(errorMessage.name, show)}
                        onFocus={e => e.target.style.borderColor = '#C8400A'}
                        onBlur={e => e.target.style.borderColor = show && errorMessage.name ? '#f43f5e' : 'rgba(200,64,10,0.2)'}
                      />
                      {show && errorMessage.name && (
                        <p style={errorStyle}><i className="fa fa-times-circle"></i>{errorMessage.name}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Phone *</label>
                      <input
                        type="number"
                        name="phone"
                        value={data.phone}
                        placeholder="e.g. 9876543210"
                        onChange={getInputData}
                        style={inputStyle(errorMessage.phone, show)}
                        onFocus={e => e.target.style.borderColor = '#C8400A'}
                        onBlur={e => e.target.style.borderColor = show && errorMessage.phone ? '#f43f5e' : 'rgba(200,64,10,0.2)'}
                      />
                      {show && errorMessage.phone && (
                        <p style={errorStyle}><i className="fa fa-times-circle"></i>{errorMessage.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <label style={labelStyle}>Address</label>
                    <textarea
                      name="address"
                      value={data.address}
                      placeholder="Street / Locality / Area"
                      onChange={getInputData}
                      rows={3}
                      style={{ ...inputStyle(false, show), resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = '#C8400A'}
                      onBlur={e => e.target.style.borderColor = 'rgba(200,64,10,0.2)'}
                    />
                  </div>

                  {/* City + State */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={labelStyle}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={data.city}
                        placeholder="e.g. Meerut"
                        onChange={getInputData}
                        style={inputStyle(false, show)}
                        onFocus={e => e.target.style.borderColor = '#C8400A'}
                        onBlur={e => e.target.style.borderColor = 'rgba(200,64,10,0.2)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>State</label>
                      <input
                        type="text"
                        name="state"
                        value={data.state}
                        placeholder="e.g. Uttar Pradesh"
                        onChange={getInputData}
                        style={inputStyle(false, show)}
                        onFocus={e => e.target.style.borderColor = '#C8400A'}
                        onBlur={e => e.target.style.borderColor = 'rgba(200,64,10,0.2)'}
                      />
                    </div>
                  </div>

                  {/* Pin + Photo */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label style={labelStyle}>Pin Code</label>
                      <input
                        type="number"
                        name="pin"
                        value={data.pin}
                        placeholder="e.g. 250001"
                        onChange={getInputData}
                        style={inputStyle(false, show)}
                        onFocus={e => e.target.style.borderColor = '#C8400A'}
                        onBlur={e => e.target.style.borderColor = 'rgba(200,64,10,0.2)'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={labelStyle}>Profile Photo</label>
                      <div
                        style={{
                          border: `1.5px dashed ${show && errorMessage.pic ? '#f43f5e' : 'rgba(200,64,10,0.3)'}`,
                          borderRadius: 12,
                          padding: '10px 14px',
                          cursor: 'pointer',
                          background: 'rgba(200,64,10,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'border-color 0.2s',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="fa fa-cloud-upload-alt" style={{ color: '#C8400A', fontSize: '1.1rem' }}></i>
                        <span style={{ fontSize: '0.83rem', color: '#7A6E65' }}>
                          {data.pic && typeof data.pic === 'object' ? data.pic.name : 'Click to upload photo'}
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        name="pic"
                        onChange={getInputData}
                        style={{ display: 'none' }}
                        accept="image/*"
                      />
                      {show && errorMessage.pic && (
                        <p style={errorStyle}><i className="fa fa-times-circle"></i>{errorMessage.pic}</p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(200,64,10,0.08)', marginBottom: 24 }} />

                  {/* Actions */}
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      style={{
                        flex: 1,
                        padding: '13px 0',
                        background: 'transparent',
                        border: '1.5px solid rgba(200,64,10,0.2)',
                        borderRadius: 50,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#7A6E65',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8400A'; e.currentTarget.style.color = '#C8400A'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,64,10,0.2)'; e.currentTarget.style.color = '#7A6E65'; }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 2,
                        padding: '13px 0',
                        background: submitting ? '#aaa' : 'linear-gradient(135deg, #C8400A, #E86834)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 50,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s, transform 0.2s',
                        boxShadow: submitting ? 'none' : '0 8px 20px rgba(200,64,10,0.25)',
                        fontFamily: 'DM Sans, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                      onMouseEnter={e => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = '')}
                    >
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm" role="status"></span>Saving...</>
                      ) : (
                        <><i className="fa fa-check-circle"></i>Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}