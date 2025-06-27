import { CREATE_WISHLIST, DELETE_WISHLIST, GET_WISHLIST, UPDATE_WISHLIST } from "../Constants"

export function createWishlist(data) {
    return {
        type: CREATE_WISHLIST,
        payload: data
    }
}

export function getWishlist() {
    return {
        type: GET_WISHLIST
    }
}

export function updateWishlist(data) {
    return {
        type: UPDATE_WISHLIST,
        payload: data
    }
}

export function deleteWishlist(data) {
    return {
        type: DELETE_WISHLIST,
        payload: data
    }
}