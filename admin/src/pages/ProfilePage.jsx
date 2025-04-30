import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage({ title }) {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": localStorage.getItem("token")
                    }
                });
                response = await response.json();
                if (response.data) setData(response.data);
                else navigate("/login");
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate("/login");
            }
        })();
    }, [navigate]);

    if (!data) return <p className="text-center mt-5">Loading...</p>;

    return (
        <div className="container mt-4">
            <h5 className="bg-primary text-light text-center p-3 rounded">{data.role} Profile</h5>
            <div className="row align-items-center">
                {title !== "Checkout" && (
                    <div className="col-md-5 text-center">
                        <img
                            src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
                            className="img-fluid rounded shadow-sm"
                            style={{ maxHeight: "400px", objectFit: "cover" }}
                            alt="Profile"
                        />
                    </div>
                )}
                <div className={title !== "Checkout" ? "col-md-7" : "col-md-12"}>
                    <div className="card shadow-sm p-3">
                        <table className="table table-striped">
                            <tbody>
                                <tr><th>Name</th><td>{data.name}</td></tr>
                                <tr><th>Username</th><td>{data.username}</td></tr>
                                <tr><th>Email Address</th><td>{data.email}</td></tr>
                                <tr><th>Phone</th><td>{data.phone}</td></tr>
                                <tr><th>Address</th><td>{data.address}</td></tr>
                                <tr><th>State</th><td>{data.state}</td></tr>
                                <tr><th>City</th><td>{data.city}</td></tr>
                                <tr><th>Pin</th><td>{data.pin}</td></tr>
                            </tbody>
                        </table>
                        <Link to="/update-profile" className="btn btn-primary w-100 mt-2 text-light ">Update Profile</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
