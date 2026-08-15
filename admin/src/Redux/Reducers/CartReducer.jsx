import { CREATE_CART_RED, DELETE_CART_RED, GET_CART_RED, UPDATE_CART_RED } from "../Constants"
export default function CartReducer(state = [], action) {
    switch (action.type) {
        case CREATE_CART_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_CART_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_CART_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_CART_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
