import { put, takeEvery } from "redux-saga/effects";
import { CREATE_PRODUCT, CREATE_PRODUCT_RED, DELETE_PRODUCT, DELETE_PRODUCT_RED, GET_PRODUCT, GET_PRODUCT_RED, UPDATE_PRODUCT, UPDATE_PRODUCT_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("product", action.payload)
    let response = yield createMultipartRecord("product", action.payload)
    yield put({ type: CREATE_PRODUCT_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("product")
    yield put({ type: GET_PRODUCT_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("product", action.payload)
    // yield put({ type: UPDATE_PRODUCT_RED, payload: action.payload })
    let response = yield updateMultipartRecord("product", action.payload)
    yield put({ type: UPDATE_PRODUCT_RED, payload: response.data })

}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("product", action.payload)
    yield put({ type: DELETE_PRODUCT_RED, payload: action.payload })
}


export default function* productSagas() {
    yield takeEvery(CREATE_PRODUCT, createSaga)    //watcher saga
    yield takeEvery(GET_PRODUCT, getSaga)          //watcher saga
    yield takeEvery(UPDATE_PRODUCT, updateSaga)    //watcher saga
    yield takeEvery(DELETE_PRODUCT, deleteSaga)    //watcher saga
}