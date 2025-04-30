export async function createRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}
export async function createMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`, {
            method: "POST",
            headers: {
                "authorization": localStorage.getItem("token")
            },
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}
export async function getRecord(collection) {
    try {
        let url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}`
        if (collection === "cart" || collection === "wishlist")
            url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${localStorage.getItem("userid")}`
        else if (collection === "checkout" && localStorage.getItem("role") === "Buyer")
            url = `${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/user/${localStorage.getItem("userid")}`

        let response = await fetch(url, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            }
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function updateRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${payload._id}`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}
export async function updateMultipartRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${payload.get('_id')}`, {
            method: "PUT",
            headers: {
                "authorization": localStorage.getItem("token")
            },
            body: payload
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}

export async function deleteRecord(collection, payload) {
    try {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/${collection}/${payload._id}`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            }
        })
        return await response.json()
    } catch (error) {
        console.log(error)
    }
}