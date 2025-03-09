import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";
import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./redux/reducers/searchState";
import rootSaga from "./redux/sagas/rootSaga";

const saga = createSagaMiddleware();
const store = configureStore({
  reducer: { search: searchReducer },
  //@ts-ignore
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(saga),
});
saga.run(rootSaga);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
