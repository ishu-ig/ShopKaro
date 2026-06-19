import { CREATE_BANNER_RED, DELETE_BANNER_RED, GET_BANNER_RED, UPDATE_BANNER_RED } from "../Constants"
export default function BannerReducer(state=[], action) {
    switch (action.type) {
        case CREATE_BANNER_RED:
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_BANNER_RED:
            return action.payload

        case UPDATE_BANNER_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].title = action.payload.title
            state[index].pic = action.payload.pic
            state[index].link = action.payload.link
            state[index].total = action.payload.total
            return state

        case DELETE_BANNER_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
