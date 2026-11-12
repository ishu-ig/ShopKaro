
import {
    CREATE_RETURN_RED,
    DELETE_RETURN_RED,
    GET_RETURN_RED,
    UPDATE_RETURN_RED
} from "../Constants";

export default function ReturnReducer(state = [], action) {
    switch (action.type) {

        case CREATE_RETURN_RED:
            if (!action.payload) return state;
            return [action.payload, ...state];

        case GET_RETURN_RED:
            return Array.isArray(action.payload)
                ? action.payload
                : state;

        case UPDATE_RETURN_RED:
            if (!action.payload) return state;

            return state.map(item =>
                item._id === action.payload._id
                    ? { ...item, ...action.payload }
                    : item
            );

        case DELETE_RETURN_RED:
            if (!action.payload) return state;

            return state.filter(
                item => item._id !== action.payload._id
            );

        default:
            return state;
    }
}
