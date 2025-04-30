import { CREATE_PRODUCT_RED, DELETE_PRODUCT_RED, GET_PRODUCT_RED, UPDATE_PRODUCT_RED } from "../Constants"
export default function ProductReducer(state = [], action) {
    switch (action.type) {
        case CREATE_PRODUCT_RED:
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_PRODUCT_RED:
            return action.payload

        case UPDATE_PRODUCT_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].maincategory = action.payload.maincategory
            state[index].subcategory = action.payload.subcategory
            state[index].brand = action.payload.brand
            state[index].color = action.payload.color
            state[index].size = action.payload.size
            state[index].stock = action.payload.stock
            state[index].stockQuantity = action.payload.stockQuantity
            state[index].description = action.payload.description
            state[index].basePrice = action.payload.basePrice
            state[index].discount = action.payload.discount
            state[index].finalPrice = action.payload.finalPrice
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_PRODUCT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
