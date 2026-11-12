import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CHECKOUT, CREATE_CHECKOUT_RED, DELETE_CHECKOUT, DELETE_CHECKOUT_RED, GET_CHECKOUT, GET_CHECKOUT_RED, UPDATE_CHECKOUT, UPDATE_CHECKOUT_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"

function* createSaga(action) {
    let response = yield createRecord("checkout", action.payload)
    if (response?.data) yield put({ type: CREATE_CHECKOUT_RED, payload: response.data })
}

function* getSaga(action) {
    let response = yield getRecord("checkout")
    yield put({ type: GET_CHECKOUT_RED, payload: response?.data || [] })
}

function* updateSaga(action) {
    let response = yield updateRecord("checkout", action.payload)
    yield put({ type: UPDATE_CHECKOUT_RED, payload: response?.data || action.payload })
}

function* deleteSaga(action) {
    yield deleteRecord("checkout", action.payload)
    yield put({ type: DELETE_CHECKOUT_RED, payload: action.payload })
}

export default function* checkoutSagas() {      
    yield takeEvery(CREATE_CHECKOUT, createSaga)
    yield takeEvery(GET_CHECKOUT, getSaga)
    yield takeEvery(UPDATE_CHECKOUT, updateSaga)
    yield takeEvery(DELETE_CHECKOUT, deleteSaga)
}