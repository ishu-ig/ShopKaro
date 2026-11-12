import { put, takeEvery } from "redux-saga/effects";
import { CREATE_RETURN, CREATE_RETURN_RED, DELETE_RETURN, DELETE_RETURN_RED, GET_RETURN, GET_RETURN_RED, UPDATE_RETURN, UPDATE_RETURN_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"

function* createSaga(action) {
    let response = yield createRecord("return", action.payload)
    if (response?.data) yield put({ type: CREATE_RETURN_RED, payload: response.data })
}

function* getSaga() {
    let response = yield getRecord("return")
    yield put({ type: GET_RETURN_RED, payload: response?.data || [] })
}

function* updateSaga(action) {
    yield updateRecord("return", action.payload)
    yield put({ type: UPDATE_RETURN_RED, payload: action.payload })
}

function* deleteSaga(action) {
    yield deleteRecord("return", action.payload)
    yield put({ type: DELETE_RETURN_RED, payload: action.payload })
}

export default function* returnSagas() {
    yield takeEvery(CREATE_RETURN, createSaga)
    yield takeEvery(GET_RETURN, getSaga)
    yield takeEvery(UPDATE_RETURN, updateSaga)
    yield takeEvery(DELETE_RETURN, deleteSaga)
}