import { CREATE_CHECKOUT_RED, DELETE_CHECKOUT_RED, GET_CHECKOUT_RED, UPDATE_CHECKOUT_RED } from "../Constants"
export default function CheckoutReducer(state=[], action) {
    switch (action.type) {
        case CREATE_CHECKOUT_RED:
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_CHECKOUT_RED:
            return action.payload

        case UPDATE_CHECKOUT_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_CHECKOUT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
