import { call, put, takeLatest } from "redux-saga/effects";
import { getSearchResultsSuccess } from "../reducers/searchState";
import { searchPorts } from "../../simulatedAPI/portsAPI";

function* workGetCatsFetch(action) {
  const results = yield call(() => searchPorts(action.payload));
  yield put(getSearchResultsSuccess(results));
}

function* searchSaga(props) {
  yield takeLatest("search/getSearchResultsFetch", workGetCatsFetch);
}

export default searchSaga;
