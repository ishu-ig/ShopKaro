import { CREATE_BRAND_RED, DELETE_BRAND_RED, GET_BRAND_RED, UPDATE_BRAND_RED } from "../Constants"
export default function BrandReducer(state = [], action) {
    switch (action.type) {
        case CREATE_BRAND_RED:
            if (!action.payload) return state;
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_BRAND_RED:
            return Array.isArray(action.payload) ? action.payload : state

        case UPDATE_BRAND_RED:
            if (!action.payload) return state;
            let index = state.findIndex(x => x._id === action.payload._id)
            if (index === -1) return state;
            let copyState = [...state]
            copyState[index] = { ...copyState[index], ...action.payload }
            return copyState

        case DELETE_BRAND_RED:
            if (!action.payload) return state;
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}
