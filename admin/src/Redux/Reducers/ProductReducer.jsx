import { CREATE_PRODUCT_RED, DELETE_PRODUCT_RED, GET_PRODUCT_RED, UPDATE_PRODUCT_RED } from "../Constants"
export default function ProductReducer(state = [], action) {
    switch (action.type) {
        case CREATE_PRODUCT_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_PRODUCT_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_PRODUCT_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_PRODUCT_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
