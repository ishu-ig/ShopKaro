import { put, takeEvery } from "redux-saga/effects";
import {
    CREATE_ADDRESS,
    CREATE_ADDRESS_RED,
    GET_ADDRESS,
    GET_ADDRESS_RED,
    UPDATE_ADDRESS,
    UPDATE_ADDRESS_RED,
    DELETE_ADDRESS,
    DELETE_ADDRESS_RED
} from "../Constants";
import {
    createRecord,
    getRecord,
    updateRecord,
    deleteRecord
} from "./Service/ApiCallingService";
function* createSaga(action) {
    const response = yield createRecord("address", action.payload);
    if (response?.result === "Done") {
        yield put({
            type: CREATE_ADDRESS_RED,
            payload: response.data
        });
    }
}
function* getSaga(action) {
    // action.payload is the userId — was previously missing, which meant
    // this hit GET /api/address (every user's addresses, admin-only route)
    // instead of GET /api/address/user/:userId (just this user's).
    const response = yield getRecord(`address/user/${action.payload}`);
    if (response?.result === "Done") {
        yield put({
            type: GET_ADDRESS_RED,
            payload: response.data
        });
    }
}
function* updateSaga(action) {
    const response = yield updateRecord("address", action.payload);
    if (response?.result === "Done") {
        yield put({
            type: UPDATE_ADDRESS_RED,
            payload: response.data
        });
    }
}
function* deleteSaga(action) {
    const response = yield deleteRecord("address", action.payload);
    if (response?.result === "Done") {
        yield put({
            type: DELETE_ADDRESS_RED,
            payload: action.payload
        });
    }
}
export default function* addressSagas() {
    yield takeEvery(CREATE_ADDRESS, createSaga);
    yield takeEvery(GET_ADDRESS, getSaga);
    yield takeEvery(UPDATE_ADDRESS, updateSaga);
    yield takeEvery(DELETE_ADDRESS, deleteSaga);
}