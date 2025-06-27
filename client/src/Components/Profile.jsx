import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile({ title }) {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "authorization": localStorage.getItem("token"),
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") setData(response.data);
        else navigate("/login");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    })();
  }, []);

  return (
    <>
      {/* 🔹 Profile Header */}
      <h5
        className={`bg-primary text-light text-center p-3 rounded shadow-sm mt-4 ${title !== "Checkout" ? "container" : "container-fluid"
          }`}
      >
        {title === "Checkout" ? "Billing Address" : `${title} Profile`}
      </h5>

      <div className={`${title !== "Checkout" ? "container" : "container-fluid"} my-4`}>
        <div className="row g-4 justify-content-center">

          {/* 🔹 Profile Image (Hidden in Checkout Mode) */}
          {title !== "Checkout" && (
            <div className="col-12 col-md-5 text-center">
              <img
                src={
                  data.pic
                    ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
                    : "/img/noimage.jpg"
                }
                className="img-fluid rounded shadow"
                alt="Profile"
                style={{
                  maxHeight: "400px",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
            </div>
          )}

          {/* 🔹 User Info Card */}
          <div className={title === "Checkout" ? "col-12 col-md-8" : "col-12 col-md-6"}>
            <div className="card shadow-lg p-3">
              <table className="table table-bordered table-striped mb-3">
                <tbody>
                  <tr>
                    <th>Name:</th>
                    <td>{data.name || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Username:</th>
                    <td>{data.username || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Email:</th>
                    <td>{data.email || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Phone:</th>
                    <td>{data.phone || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{data.address || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Pin Code:</th>
                    <td>{data.pin || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>City:</th>
                    <td>{data.city || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>State:</th>
                    <td>{data.state || "N/A"}</td>
                  </tr>
                </tbody>
              </table>

              {/* 🔹 Update Button (Hide in Checkout if needed) */}
              {title !== "Checkout" && (
                <Link to="/updateProfile" className="btn btn-primary w-100">
                  Update Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
