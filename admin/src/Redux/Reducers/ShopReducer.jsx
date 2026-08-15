import {
    CREATE_SHOP_RED,
    DELETE_SHOP_RED,
    GET_SHOP_RED,
    UPDATE_SHOP_RED
} from "../Constants";

export default function ShopReducer(state = [], action) {
    switch (action.type) {
        case CREATE_SHOP_RED:
            if (!action.payload) return state;
            return [...state, action.payload];

        case GET_SHOP_RED:
            return Array.isArray(action.payload) ? action.payload : state;

        case UPDATE_SHOP_RED:
            if (!action.payload) return state;
            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload }
                    : item
            );

        case DELETE_SHOP_RED:
            if (!action.payload) return state;
            return state.filter(item => item._id !== action.payload._id);

        default:
            return state;
    }
}