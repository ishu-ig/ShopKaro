import { put, takeEvery } from "redux-saga/effects";
import { CREATE_BRAND, CREATE_BRAND_RED, DELETE_BRAND, DELETE_BRAND_RED, GET_BRAND, GET_BRAND_RED, UPDATE_BRAND, UPDATE_BRAND_RED } from "../Constants"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"

function* createSaga(action) {
    let response = yield createMultipartRecord("brand", action.payload)
    if (response?.data) yield put({ type: CREATE_BRAND_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("brand")
    yield put({ type: GET_BRAND_RED, payload: response?.data || [] })
}

function* updateSaga(action) {
    let response = yield updateMultipartRecord("brand", action.payload)
    yield put({ type: UPDATE_BRAND_RED, payload: response?.data || action.payload })
}

function* deleteSaga(action) {
    yield deleteRecord("brand", action.payload)
    yield put({ type: DELETE_BRAND_RED, payload: action.payload })
}

export default function* brandSagas() {      
    yield takeEvery(CREATE_BRAND, createSaga)
    yield takeEvery(GET_BRAND, getSaga)
    yield takeEvery(UPDATE_BRAND, updateSaga)
    yield takeEvery(DELETE_BRAND, deleteSaga)
}