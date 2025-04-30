import { put, takeEvery } from "redux-saga/effects";
import { CREATE_NEWSLETTER, CREATE_NEWSLETTER_RED, DELETE_NEWSLETTER, DELETE_NEWSLETTER_RED, GET_NEWSLETTER, GET_NEWSLETTER_RED, UPDATE_NEWSLETTER, UPDATE_NEWSLETTER_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    let response = yield createRecord("newsletter", action.payload)
    // let response = yield createMultipartRecord("newsletter", action.payload)
    yield put({ type: CREATE_NEWSLETTER_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("newsletter")
    yield put({ type: GET_NEWSLETTER_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    yield updateRecord("newsletter", action.payload)
    // yield updateMultipartRecord("newsletter", action.payload)
    yield put({ type: UPDATE_NEWSLETTER_RED, payload: action.payload })
}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("newsletter", action.payload)
    yield put({ type: DELETE_NEWSLETTER_RED, payload: action.payload })
}


export default function* newsletterSagas() {      
    yield takeEvery(CREATE_NEWSLETTER, createSaga)    //watcher saga
    yield takeEvery(GET_NEWSLETTER, getSaga)          //watcher saga
    yield takeEvery(UPDATE_NEWSLETTER, updateSaga)    //watcher saga
    yield takeEvery(DELETE_NEWSLETTER, deleteSaga)    //watcher saga
}