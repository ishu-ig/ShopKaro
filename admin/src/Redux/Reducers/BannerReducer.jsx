import { CREATE_BANNER_RED, DELETE_BANNER_RED, GET_BANNER_RED, UPDATE_BANNER_RED } from "../Constants"
export default function BannerReducer(state = [], action) {
    switch (action.type) {
        case CREATE_BANNER_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_BANNER_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_BANNER_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_BANNER_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
