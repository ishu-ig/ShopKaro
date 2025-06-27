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
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].orderStatus = action.payload.orderStatus
            state[index].paymentMode = action.payload.paymentMode
            state[index].paymentStatus = action.payload.paymentStatus
            state[index].rppid = action.payload.rppid
            return state

        case DELETE_CHECKOUT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
