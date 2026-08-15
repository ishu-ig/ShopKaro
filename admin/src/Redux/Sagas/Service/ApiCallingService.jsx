const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : "";
}

function handleAuthStatus(response, endpoint) {
    if (response.status === 401 || response.status === 498) {
        console.warn(`[ShopKaro Auth] Request to ${endpoint} received ${response.status} (Unauthorized/Expired). Please re-login at /login.`);
    }
}

export async function createRecord(collection, payload) {
    try {
        let response = await fetch(`${serverUrl}/api/${collection}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthHeader()
            },
            body: JSON.stringify(payload)
        });
        handleAuthStatus(response, `/api/${collection}`);
        return await response.json();
    } catch (error) {
        console.log("createRecord error:", error);
        return { result: "Fail", data: null };
    }
}

export async function createMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${serverUrl}/api/${collection}`, {
            method: "POST",
            headers: {
                "authorization": getAuthHeader()
            },
            body: payload
        });
        handleAuthStatus(response, `/api/${collection}`);
        return await response.json();
    } catch (error) {
        console.log("createMultipartRecord error:", error);
        return { result: "Fail", data: null };
    }
}

export async function getRecord(collection) {
    try {
        let url = `${serverUrl}/api/${collection}`;
        if (collection === "cart" || collection === "wishlist") {
            const userid = localStorage.getItem("userid");
            if (userid) url = `${serverUrl}/api/${collection}/${userid}`;
        } else if (collection === "checkout" && localStorage.getItem("role") === "Buyer") {
            const userid = localStorage.getItem("userid");
            if (userid) url = `${serverUrl}/api/${collection}/user/${userid}`;
        }

        let response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthHeader()
            }
        });

        handleAuthStatus(response, url);

        if (!response.ok) {
            return { result: "Fail", data: [] };
        }

        const data = await response.json();
        return data || { result: "Fail", data: [] };
    } catch (error) {
        console.log("getRecord error:", error);
        return { result: "Fail", data: [] };
    }
}

export async function updateRecord(collection, payload) {
    try {
        let response = await fetch(`${serverUrl}/api/${collection}/${payload._id}`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthHeader()
            },
            body: JSON.stringify(payload)
        });
        handleAuthStatus(response, `/api/${collection}/${payload._id}`);
        return await response.json();
    } catch (error) {
        console.log("updateRecord error:", error);
        return { result: "Fail", data: null };
    }
}

export async function updateMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${serverUrl}/api/${collection}/${payload.get('_id')}`, {
            method: "PUT",
            headers: {
                "authorization": getAuthHeader()
            },
            body: payload
        });
        handleAuthStatus(response, `/api/${collection}/${payload.get('_id')}`);
        return await response.json();
    } catch (error) {
        console.log("updateMultipartRecord error:", error);
        return { result: "Fail", data: null };
    }
}

export async function deleteRecord(collection, payload) {
    try {
        let response = await fetch(`${serverUrl}/api/${collection}/${payload._id}`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
                "authorization": getAuthHeader()
            }
        });
        handleAuthStatus(response, `/api/${collection}/${payload._id}`);
        return await response.json();
    } catch (error) {
        console.log("deleteRecord error:", error);
        return { result: "Fail", data: null };
    }
}