const serverUrl = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : "";
}

export async function createRecord(collection, payload) {
    try {
        const token = getAuthHeader();
        const headers = { "content-type": "application/json" };
        if (token) headers["authorization"] = token;

        let response = await fetch(`${serverUrl}/api/${collection}`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log("createRecord error:", error)
        return { result: "Fail", data: null }
    }
}

export async function createMultipartRecord(collection, payload) {
    try {
        const token = getAuthHeader();
        const headers = {};
        if (token) headers["authorization"] = token;

        let response = await fetch(`${serverUrl}/api/${collection}`, {
            method: "POST",
            headers,
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log("createMultipartRecord error:", error)
        return { result: "Fail", data: null }
    }
}

export async function getRecord(collection) {
    try {
        let url = `${serverUrl}/api/${collection}`
        if (collection === "cart" || collection === "wishlist") {
            const userid = localStorage.getItem("userid")
            // If user is not logged in, there is no server cart/wishlist to fetch
            if (!userid || userid === "null" || userid === "undefined") {
                return { result: "Done", data: [] }
            }
            url = `${serverUrl}/api/${collection}/${userid}`
        } else if (collection === "checkout" && localStorage.getItem("role") === "Buyer") {
            const userid = localStorage.getItem("userid")
            if (!userid || userid === "null" || userid === "undefined") {
                return { result: "Done", data: [] }
            }
            url = `${serverUrl}/api/${collection}/user/${userid}`
        }

        const token = getAuthHeader();
        const headers = { "content-type": "application/json" };
        if (token) headers["authorization"] = token;

        let response = await fetch(url, {
            method: "GET",
            headers
        })

        if (!response.ok) {
            return { result: "Fail", data: [] }
        }

        const data = await response.json()
        return data || { result: "Fail", data: [] }
    } catch (error) {
        console.log("getRecord error:", error)
        return { result: "Fail", data: [] }
    }
}

export async function updateRecord(collection, payload) {
    try {
        const token = getAuthHeader();
        const headers = { "content-type": "application/json" };
        if (token) headers["authorization"] = token;

        let response = await fetch(`${serverUrl}/api/${collection}/${payload._id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log("updateRecord error:", error)
        return { result: "Fail", data: null }
    }
}

export async function updateMultipartRecord(collection, payload) {
    try {
        const token = getAuthHeader();
        const headers = {};
        if (token) headers["authorization"] = token;

        let response = await fetch(`${serverUrl}/api/${collection}/${payload.get('_id')}`, {
            method: "PUT",
            headers,
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log("updateMultipartRecord error:", error)
        return { result: "Fail", data: null }
    }
}

export async function deleteRecord(collection, payload) {
    try {
        const token = getAuthHeader();
        const headers = { "content-type": "application/json" };
        if (token) headers["authorization"] = token;

        let response = await fetch(`${serverUrl}/api/${collection}/${payload._id}`, {
            method: "DELETE",
            headers
        })
        return await response.json()
    } catch (error) {
        console.log("deleteRecord error:", error)
        return { result: "Fail", data: null }
    }
}
