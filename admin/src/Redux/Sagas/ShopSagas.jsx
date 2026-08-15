import { put, takeEvery } from "redux-saga/effects";
import {
    CREATE_SHOP,
    CREATE_SHOP_RED,
    DELETE_SHOP,
    DELETE_SHOP_RED,
    GET_SHOP,
    GET_SHOP_RED,
    UPDATE_SHOP,
    UPDATE_SHOP_RED
} from "../Constants";
import {
    createMultipartRecord,
    deleteRecord,
    getRecord,
    updateMultipartRecord
} from "./Service/ApiCallingService";

function* createSaga(action) {
    let response = yield createMultipartRecord("shop", action.payload);
    if (response?.data) yield put({ type: CREATE_SHOP_RED, payload: response.data });
}

function* getSaga() {
    let response = yield getRecord("shop");
    yield put({ type: GET_SHOP_RED, payload: response?.data || [] });
}

function* updateSaga(action) {
    let response = yield updateMultipartRecord("shop", action.payload);
    yield put({ type: UPDATE_SHOP_RED, payload: response?.data || action.payload });
}

function* deleteSaga(action) {
    yield deleteRecord("shop", action.payload);
    yield put({ type: DELETE_SHOP_RED, payload: action.payload });
}

export default function* shopSagas() {
    yield takeEvery(CREATE_SHOP, createSaga);
    yield takeEvery(GET_SHOP, getSaga);
    yield takeEvery(UPDATE_SHOP, updateSaga);
    yield takeEvery(DELETE_SHOP, deleteSaga);
}