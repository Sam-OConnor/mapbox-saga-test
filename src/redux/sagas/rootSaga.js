import { all } from "redux-saga/effects";
import searchSaga from "./searchSaga";

function* rootSaga() {
  yield all([searchSaga()]);
}

export default rootSaga;
