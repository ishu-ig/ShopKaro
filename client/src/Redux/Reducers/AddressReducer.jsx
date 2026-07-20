import {
    CREATE_ADDRESS_RED,
    GET_ADDRESS_RED,
    UPDATE_ADDRESS_RED,
    DELETE_ADDRESS_RED
} from "../Constants";

export default function AddressReducer(state = [], action) {
    switch (action.type) {

        case CREATE_ADDRESS_RED:
            return [action.payload, ...state];

        case GET_ADDRESS_RED:
            return action.payload;

        case UPDATE_ADDRESS_RED:
            return state.map((item) =>
                item._id === action.payload._id
                    ? action.payload
                    : item
            );

        case DELETE_ADDRESS_RED:
            return state.filter(
                (item) => item._id !== action.payload._id
            );

        default:
            return state;
    }
}