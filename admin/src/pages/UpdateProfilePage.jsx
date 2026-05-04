import React, { useEffect, useState } from "react";
import imageValidator from "../FormValidators/imageValidator";
import formValidator from "../FormValidators/formValidator";
import { useNavigate } from "react-router-dom";

export default function UpdateProfilePage() {
    let [data, setData] = useState({
        name: "", phone: "", address: "", city: "", state: "", pin: "", pic: "",
    });
    let [errorMessage, setErrorMessage] = useState({ name: "", phone: "", pic: "" });
    let [show, setShow] = useState(false);
    let [preview, setPreview] = useState(null);
    let [loading, setLoading] = useState(false);
    let navigate = useNavigate();

    function getInputData(e) {
        let name = e.target.name;
        let value = e.target.files ? e.target.files[0] : e.target.value;

        if (name !== "active") {
            setErrorMessage((old) => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e),
            }));
        }

        if (name === "pic" && e.target.files?.[0]) {
            setPreview(URL.createObjectURL(e.target.files[0]));
        }

        setData((old) => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        let error = Object.values(errorMessage).find((x) => x !== "");
        if (error) {
            setShow(true);
        } else {
            setLoading(true);
            try {
                let formData = new FormData();
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
                    { method: "PUT", headers: { "authorization": localStorage.getItem("token") }, body: formData }
                );
                response = await response.json();
                if (response.result === "Done") navigate("/profile");
                else alert("Something Went Wrong");
            } catch {
                alert("Internal Server Error");
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(
                    `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
                    { method: "GET", headers: { "content-type": "application/json", authorization: localStorage.getItem("token") } }
                );
                response = await response.json();
                if (response.result === "Done") {
                    setData(response.data);
                    if (response.data.pic) setPreview(`${process.env.REACT_APP_BACKEND_SERVER}/${response.data.pic}`);
                }
            } catch { alert("Internal Server Error"); }
        })();
    }, []);

    return (
        <>
            <style>{`
                .up-page {
                    padding: 32px 24px 80px;
                    max-width: 820px;
                    margin: 0 auto;
                    width: 100%;
                    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .up-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 28px;
                }

                .up-header-icon {
                    width: 42px; height: 42px;
                    background: linear-gradient(135deg, var(--accent), #3a7de0);
                    border-radius: 11px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                    font-size: 16px;
                    box-shadow: 0 6px 16px rgba(79,142,247,0.35);
                    flex-shrink: 0;
                }

                .up-header-text h4 {
                    font-family: 'Syne', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    letter-spacing: -0.01em;
                }

                .up-header-text p {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 2px 0 0;
                }

                /* Avatar section */
                .up-avatar-section {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .up-avatar-wrap {
                    position: relative;
                    flex-shrink: 0;
                }

                .up-avatar-img {
                    width: 88px; height: 88px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid var(--border-accent);
                    box-shadow: 0 0 0 4px var(--accent-glow), 0 8px 20px rgba(0,0,0,0.3);
                    display: block;
                }

                .up-avatar-badge {
                    position: absolute;
                    bottom: 2px; right: 2px;
                    width: 22px; height: 22px;
                    background: var(--accent);
                    border: 2px solid var(--bg-surface);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 9px;
                    color: #fff;
                }

                .up-avatar-info h5 {
                    font-family: 'Syne', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 4px;
                }

                .up-avatar-info p {
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    margin: 0;
                    line-height: 1.5;
                }

                /* Form card */
                .up-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-top: 2px solid var(--accent);
                    border-radius: 16px;
                    padding: 28px;
                }

                .up-section-label {
                    font-size: 10.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .up-section-label::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border);
                }

                .up-field-label {
                    display: block;
                    font-size: 11.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: var(--text-secondary);
                    margin-bottom: 7px;
                }

                .up-input {
                    width: 100%;
                    background: var(--bg-card) !important;
                    border: 1px solid var(--border) !important;
                    color: var(--text-primary) !important;
                    border-radius: 10px !important;
                    font-size: 13.5px;
                    padding: 10px 14px !important;
                    transition: var(--transition);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    outline: none;
                }

                .up-input:focus {
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 3px var(--accent-glow) !important;
                    background: #131929 !important;
                }

                .up-input::placeholder { color: var(--text-muted) !important; }

                .up-input.is-error { border-color: rgba(247,95,95,0.5) !important; }
                .up-input.is-ok { border-color: rgba(56,239,145,0.4) !important; }

                .up-error-text {
                    font-size: 11.5px;
                    color: var(--accent-danger);
                    margin-top: 5px;
                    display: block;
                }

                .up-file-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--bg-card);
                    border: 1px dashed var(--border-accent);
                    border-radius: 10px;
                    padding: 12px 14px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-size: 13px;
                    transition: var(--transition);
                }

                .up-file-label:hover {
                    background: var(--bg-hover);
                    border-color: var(--accent);
                    color: var(--text-primary);
                }

                .up-file-label i { color: var(--accent); font-size: 14px; }

                input[type="file"].up-file-input { display: none; }

                .up-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 28px;
                    padding-top: 24px;
                    border-top: 1px solid var(--border);
                }

                .up-btn-primary {
                    flex: 1;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, var(--accent) 0%, #3a7de0 100%);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    transition: var(--transition);
                    box-shadow: 0 6px 20px rgba(79,142,247,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .up-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(79,142,247,0.5);
                }

                .up-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

                .up-btn-secondary {
                    padding: 12px 24px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .up-btn-secondary:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .up-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

                @media (max-width: 640px) {
                    .up-grid-2 { grid-template-columns: 1fr; }
                    .up-avatar-section { flex-direction: column; text-align: center; }
                }
            `}</style>

            <div className="up-page">
                {/* Header */}
                <div className="up-header">
                    <div className="up-header-icon"><i className="fas fa-user-pen"></i></div>
                    <div className="up-header-text">
                        <h4>Update Profile</h4>
                        <p>Keep your information up to date</p>
                    </div>
                </div>

                {/* Avatar preview section */}
                <div className="up-avatar-section">
                    <div className="up-avatar-wrap">
                        <img
                            src={preview || "/img/noimage.jpg"}
                            alt="Profile"
                            className="up-avatar-img"
                        />
                        <div className="up-avatar-badge"><i className="fas fa-camera"></i></div>
                    </div>
                    <div className="up-avatar-info">
                        <h5>{data.name || "Your Name"}</h5>
                        <p>Upload a clear photo. PNG or JPG, max 5MB.<br />Your avatar will appear across the admin panel.</p>
                    </div>
                </div>

                {/* Main form card */}
                <div className="up-card">
                    <form onSubmit={postData}>
                        {/* Personal Info */}
                        <div className="up-section-label">Personal Information</div>
                        <div className="up-grid-2" style={{ marginBottom: "18px" }}>
                            <div>
                                <label className="up-field-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={getInputData}
                                    className={`up-input ${show && errorMessage.name ? "is-error" : data.name ? "is-ok" : ""}`}
                                    placeholder="Enter your full name"
                                />
                                {show && errorMessage.name && <small className="up-error-text"><i className="fas fa-circle-exclamation me-1"></i>{errorMessage.name}</small>}
                            </div>
                            <div>
                                <label className="up-field-label">Phone Number</label>
                                <input
                                    type="number"
                                    name="phone"
                                    value={data.phone}
                                    onChange={getInputData}
                                    className={`up-input ${show && errorMessage.phone ? "is-error" : data.phone ? "is-ok" : ""}`}
                                    placeholder="Enter phone number"
                                />
                                {show && errorMessage.phone && <small className="up-error-text"><i className="fas fa-circle-exclamation me-1"></i>{errorMessage.phone}</small>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="up-section-label">Address Details</div>
                        <div style={{ marginBottom: "18px" }}>
                            <label className="up-field-label">Street Address</label>
                            <textarea
                                name="address"
                                value={data.address}
                                onChange={getInputData}
                                className="up-input"
                                placeholder="Enter your full address"
                                rows={3}
                                style={{ resize: "vertical" }}
                            />
                        </div>

                        <div className="up-grid-2" style={{ marginBottom: "18px" }}>
                            <div>
                                <label className="up-field-label">State</label>
                                <input type="text" name="state" value={data.state} onChange={getInputData}
                                    className="up-input" placeholder="Enter state" />
                            </div>
                            <div>
                                <label className="up-field-label">City</label>
                                <input type="text" name="city" value={data.city} onChange={getInputData}
                                    className="up-input" placeholder="Enter city" />
                            </div>
                        </div>

                        <div className="up-grid-2" style={{ marginBottom: "18px" }}>
                            <div>
                                <label className="up-field-label">Pin Code</label>
                                <input type="number" name="pin" value={data.pin} onChange={getInputData}
                                    className="up-input" placeholder="Enter pin code" />
                            </div>
                            <div>
                                <label className="up-field-label">Profile Picture</label>
                                <label className="up-file-label" htmlFor="up-pic-input">
                                    <i className="fas fa-cloud-arrow-up"></i>
                                    {data.pic && typeof data.pic === "object" ? data.pic.name : "Choose image file"}
                                </label>
                                <input type="file" id="up-pic-input" name="pic"
                                    onChange={getInputData} className="up-file-input" accept="image/*" />
                                {show && errorMessage.pic && <small className="up-error-text">{errorMessage.pic}</small>}
                            </div>
                        </div>

                        <div className="up-actions">
                            <button type="button" className="up-btn-secondary" onClick={() => navigate("/profile")}>
                                <i className="fas fa-arrow-left"></i> Cancel
                            </button>
                            <button type="submit" className="up-btn-primary" disabled={loading}>
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                                    : <><i className="fas fa-check"></i> Save Changes</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}