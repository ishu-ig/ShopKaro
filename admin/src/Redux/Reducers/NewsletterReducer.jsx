import { CREATE_NEWSLETTER_RED, DELETE_NEWSLETTER_RED, GET_NEWSLETTER_RED, UPDATE_NEWSLETTER_RED } from "../Constants"
export default function NewsletterReducer(state = [], action) {
    switch (action.type) {
        case CREATE_NEWSLETTER_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_NEWSLETTER_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_NEWSLETTER_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_NEWSLETTER_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
