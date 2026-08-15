import { CREATE_CONTACT_US_RED, DELETE_CONTACT_US_RED, GET_CONTACT_US_RED, UPDATE_CONTACT_US_RED } from "../Constants"
export default function ContactUsReducer(state = [], action) {
    switch (action.type) {
        case CREATE_CONTACT_US_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_CONTACT_US_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_CONTACT_US_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_CONTACT_US_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
