import { put, takeEvery } from "redux-saga/effects";
import { CREATE_BANNER, CREATE_BANNER_RED, DELETE_BANNER, DELETE_BANNER_RED, GET_BANNER, GET_BANNER_RED, UPDATE_BANNER, UPDATE_BANNER_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("banner", action.payload)
    let response = yield createMultipartRecord("banner", action.payload)
    yield put({ type: CREATE_BANNER_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("banner")
    yield put({ type: GET_BANNER_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("banner", action.payload)
    // yield put({ type: UPDATE_BANNER_RED, payload: action.payload })
    let response = yield updateMultipartRecord("banner", action.payload)
    yield put({ type: UPDATE_BANNER_RED, payload: response.data })

}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("banner", action.payload)
    yield put({ type: DELETE_BANNER_RED, payload: action.payload })
}


export default function* bannerSagas() {
    yield takeEvery(CREATE_BANNER, createSaga)    //watcher saga
    yield takeEvery(GET_BANNER, getSaga)          //watcher saga
    yield takeEvery(UPDATE_BANNER, updateSaga)    //watcher saga
    yield takeEvery(DELETE_BANNER, deleteSaga)    //watcher saga
}