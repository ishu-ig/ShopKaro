import {
    CREATE_ADDRESS,
    GET_ADDRESS,
    UPDATE_ADDRESS,
    DELETE_ADDRESS
} from "../Constants";
export function createAddress(data) {
    return {
        type: CREATE_ADDRESS,
        payload: data
    };
}
export function getAddress(userId) {
    return {
        type: GET_ADDRESS,
        payload: userId
    };
}
export function updateAddress(data) {
    return {
        type: UPDATE_ADDRESS,
        payload: data
    };
}
export function deleteAddress(data) {
    return {
        type: DELETE_ADDRESS,
        payload: data
    };
}