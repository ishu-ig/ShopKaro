import { CREATE_WISHLIST_RED, DELETE_WISHLIST_RED, GET_WISHLIST_RED, UPDATE_WISHLIST_RED } from "../Constants"
export default function WishlistReducer(state=[], action) {
    switch (action.type) {
        case CREATE_WISHLIST_RED:
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_WISHLIST_RED:
            return action.payload

        case UPDATE_WISHLIST_RED:
            return state

        case DELETE_WISHLIST_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
