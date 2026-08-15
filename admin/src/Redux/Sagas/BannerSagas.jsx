import { put, takeEvery } from "redux-saga/effects";
import { CREATE_BANNER, CREATE_BANNER_RED, DELETE_BANNER, DELETE_BANNER_RED, GET_BANNER, GET_BANNER_RED, UPDATE_BANNER, UPDATE_BANNER_RED } from "../Constants"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"

function* createSaga(action) {
    let response = yield createMultipartRecord("banner", action.payload)
    if (response?.data) yield put({ type: CREATE_BANNER_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("banner")
    yield put({ type: GET_BANNER_RED, payload: response?.data || [] })
}

function* updateSaga(action) {
    let response = yield updateMultipartRecord("banner", action.payload)
    yield put({ type: UPDATE_BANNER_RED, payload: response?.data || action.payload })
}

function* deleteSaga(action) {
    yield deleteRecord("banner", action.payload)
    yield put({ type: DELETE_BANNER_RED, payload: action.payload })
}

export default function* bannerSagas() {      
    yield takeEvery(CREATE_BANNER, createSaga)
    yield takeEvery(GET_BANNER, getSaga)
    yield takeEvery(UPDATE_BANNER, updateSaga)
    yield takeEvery(DELETE_BANNER, deleteSaga)
}