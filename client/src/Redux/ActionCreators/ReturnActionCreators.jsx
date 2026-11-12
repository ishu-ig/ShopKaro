import { CREATE_RETURN, DELETE_RETURN, GET_RETURN, UPDATE_RETURN } from "../Constants"

export function createReturn(data) {
    return {
        type: CREATE_RETURN,
        payload: data
    }
}

export function getReturn() {
    return {
        type: GET_RETURN
    }
}

export function updateReturn(data) {
    return {
        type: UPDATE_RETURN,
        payload: data
    }
}

export function deleteReturn(data) {
    return {
        type: DELETE_RETURN,
        payload: data
    }
}