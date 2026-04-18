import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Field = ({ label, value }) => (
  <div className="profile-field">
    <span className="profile-field-label">{label}</span>
    <span className="profile-field-value">{value || <span className="profile-empty">Not set</span>}</span>
  </div>
)

export default function Profile({ title }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isCheckout = title === "Checkout"

  useEffect(() => {
    ;(async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: localStorage.getItem("token"),
            },
          }
        )
        response = await response.json()
        if (response.result === "Done") setData(response.data)
        else navigate("/login")
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const fields = [
    { label: "Full Name",   value: data.name     },
    { label: "Username",    value: data.username  },
    { label: "Email",       value: data.email     },
    { label: "Phone",       value: data.phone     },
    { label: "Address",     value: data.address   },
    { label: "Pin Code",    value: data.pin       },
    { label: "City",        value: data.city      },
    { label: "State",       value: data.state     },
  ]

  return (
    <>
      <style>{`
        .profile-wrapper {
          padding: 40px 0 100px;
          background: #f7f4ef;
          min-height: 100vh;
        }
        .profile-header-bar {
          background: #0d1b2a;
          border-radius: 14px;
          padding: 20px 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }
        .profile-header-icon {
          width: 40px; height: 40px;
          background: rgba(201,168,76,0.15);
          border: 1.5px solid rgba(201,168,76,0.4);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #c9a84c;
          font-size: 16px;
        }
        .profile-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #fff;
          margin: 0;
        }
        .profile-header-sub {
          font-size: 12px;
          color: rgba(201,168,76,0.6);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .profile-avatar-card {
          background: #0d1b2a;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .profile-avatar-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.2));
        }
        .profile-avatar-img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
        }
        .profile-avatar-overlay {
          padding: 20px 24px;
        }
        .profile-avatar-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #fff;
          margin: 0 0 4px;
        }
        .profile-avatar-user {
          font-size: 13px;
          color: rgba(201,168,76,0.7);
        }
        .profile-info-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 30px rgba(13,27,42,0.07);
          overflow: hidden;
        }
        .profile-info-header {
          background: linear-gradient(135deg, #0d1b2a, #162236);
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .profile-info-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          color: #fff;
          margin: 0;
        }
        .profile-complete-badge {
          font-size: 11px;
          font-weight: 600;
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 50px;
          padding: 4px 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .profile-fields {
          padding: 8px 0;
        }
        .profile-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 28px;
          border-bottom: 1px solid #f0ece4;
          gap: 16px;
          transition: background 0.2s;
        }
        .profile-field:last-child { border-bottom: none; }
        .profile-field:hover { background: #faf8f4; }
        .profile-field-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #888;
          flex-shrink: 0;
          min-width: 90px;
        }
        .profile-field-value {
          font-size: 14px;
          color: #0d1b2a;
          font-weight: 500;
          text-align: right;
        }
        .profile-empty {
          color: #ccc;
          font-style: italic;
          font-weight: 400;
        }
        .profile-info-footer {
          padding: 20px 28px;
          border-top: 1px solid #f0ece4;
        }
        .btn-profile-update {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: #0d1b2a;
          color: #c9a84c;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.28s ease;
        }
        .btn-profile-update:hover {
          background: #c9a84c;
          color: #000;
          box-shadow: 0 8px 24px rgba(201,168,76,0.3);
          transform: translateY(-1px);
        }
        .profile-skeleton {
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
          height: 14px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className={`profile-wrapper ${isCheckout ? '' : ''}`}>
        <div className={isCheckout ? "container-fluid px-4" : "container"}>

          {/* Header */}
          <div className="profile-header-bar">
            <div className="profile-header-icon">
              <i className={`fa ${isCheckout ? 'fa-map-marker-alt' : 'fa-user'}`} />
            </div>
            <div>
              <h5 className="profile-header-title">
                {isCheckout ? "Billing Address" : `${title} Profile`}
              </h5>
              <div className="profile-header-sub">
                {isCheckout ? "Confirm your delivery details" : "Manage your account information"}
              </div>
            </div>
          </div>

          <div className="row g-4 justify-content-center">

            {/* Avatar column (hidden in checkout) */}
            {!isCheckout && (
              <div className="col-lg-4 col-md-5">
                <div className="profile-avatar-card">
                  {loading ? (
                    <div style={{ width: '100%', aspectRatio: '3/4', background: '#162236' }} />
                  ) : (
                    <img
                      src={
                        data.pic
                          ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
                          : "/img/noimage.jpg"
                      }
                      className="profile-avatar-img"
                      alt="Profile"
                    />
                  )}
                  <div className="profile-avatar-overlay">
                    <div className="profile-avatar-name">{data.name || 'ShopKaro User'}</div>
                    <div className="profile-avatar-user">@{data.username || '—'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Info card */}
            <div className={isCheckout ? "col-12 col-md-8" : "col-lg-8 col-md-7"}>
              <div className="profile-info-card">
                <div className="profile-info-header">
                  <h6 className="profile-info-header-title">
                    {isCheckout ? 'Delivery Information' : 'Account Details'}
                  </h6>
                  <span className="profile-complete-badge">
                    <i className="fa fa-check me-1" style={{ fontSize: 9 }} />
                    Verified
                  </span>
                </div>

                <div className="profile-fields">
                  {loading
                    ? Array(8).fill(null).map((_, i) => (
                      <div key={i} className="profile-field">
                        <div className="profile-skeleton" style={{ width: 70 }} />
                        <div className="profile-skeleton" style={{ width: 140 }} />
                      </div>
                    ))
                    : fields.map(f => <Field key={f.label} {...f} />)
                  }
                </div>

                {!isCheckout && (
                  <div className="profile-info-footer">
                    <Link to="/updateProfile" className="btn-profile-update">
                      <i className="fa fa-pen" style={{ fontSize: 12 }} />
                      Update Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}