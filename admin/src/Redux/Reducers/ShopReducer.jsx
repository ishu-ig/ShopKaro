import {
    CREATE_SHOP_RED,
    DELETE_SHOP_RED,
    GET_SHOP_RED,
    UPDATE_SHOP_RED
} from "../Constants";

export default function ShopReducer(state = [], action) {
    switch (action.type) {

        case CREATE_SHOP_RED:
            return [...state, action.payload];

        case GET_SHOP_RED:
            return action.payload;

        case UPDATE_SHOP_RED:
            return state.map(item =>
                item._id === action.payload._id
                    ? action.payload
                    : item
            );

        case DELETE_SHOP_RED:
            return state.filter(item => item._id !== action.payload._id);

        default:
            return state;
    }
}