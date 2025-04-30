import { put, takeEvery } from "redux-saga/effects";
import { CREATE_MAINCATEGORY, CREATE_MAINCATEGORY_RED, DELETE_MAINCATEGORY, DELETE_MAINCATEGORY_RED, GET_MAINCATEGORY, GET_MAINCATEGORY_RED, UPDATE_MAINCATEGORY, UPDATE_MAINCATEGORY_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("maincategory", action.payload)
    let response = yield createMultipartRecord("maincategory", action.payload)
    yield put({ type: CREATE_MAINCATEGORY_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("maincategory")
    yield put({ type: GET_MAINCATEGORY_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("maincategory", action.payload)
    // yield put({ type: UPDATE_MAINCATEGORY_RED, payload: action.payload })
    let response = yield updateMultipartRecord("maincategory", action.payload)
    yield put({ type: UPDATE_MAINCATEGORY_RED, payload: response.data })
}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("maincategory", action.payload)
    yield put({ type: DELETE_MAINCATEGORY_RED, payload: action.payload })
}


export default function* maincategorySagas() {      
    yield takeEvery(CREATE_MAINCATEGORY, createSaga)    //watcher saga
    yield takeEvery(GET_MAINCATEGORY, getSaga)          //watcher saga
    yield takeEvery(UPDATE_MAINCATEGORY, updateSaga)    //watcher saga
    yield takeEvery(DELETE_MAINCATEGORY, deleteSaga)    //watcher saga
}