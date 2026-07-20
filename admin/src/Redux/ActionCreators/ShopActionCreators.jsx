import { CREATE_SHOP, DELETE_SHOP, GET_SHOP, UPDATE_SHOP } from "../Constants";

export function createShop(data) {
    return {
        type: CREATE_SHOP,
        payload: data
    }
}

export function getShop() {
    return {
        type: GET_SHOP
    }
}

export function updateShop(data) {
    return {
        type: UPDATE_SHOP,
        payload: data
    }
}

export function deleteShop(data) {
    return {
        type: DELETE_SHOP,
        payload: data
    }
}