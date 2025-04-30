import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CHECKOUT, CREATE_CHECKOUT_RED, DELETE_CHECKOUT, DELETE_CHECKOUT_RED, GET_CHECKOUT, GET_CHECKOUT_RED, UPDATE_CHECKOUT, UPDATE_CHECKOUT_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    let response = yield createRecord("checkout", action.payload)
    // let response = yield createMultipartRecord("checkout", action.payload)
    yield put({ type: CREATE_CHECKOUT_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("checkout")
    yield put({ type: GET_CHECKOUT_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    yield updateRecord("checkout", action.payload)
    // yield updateMultipartRecord("checkout", action.payload)
    yield put({ type: UPDATE_CHECKOUT_RED, payload: action.payload })
}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("checkout", action.payload)
    yield put({ type: DELETE_CHECKOUT_RED, payload: action.payload })
}


export default function* checkoutSagas() {      
    yield takeEvery(CREATE_CHECKOUT, createSaga)    //watcher saga
    yield takeEvery(GET_CHECKOUT, getSaga)          //watcher saga
    yield takeEvery(UPDATE_CHECKOUT, updateSaga)    //watcher saga
    yield takeEvery(DELETE_CHECKOUT, deleteSaga)    //watcher saga
}