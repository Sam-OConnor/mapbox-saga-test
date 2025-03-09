import { createSlice } from "@reduxjs/toolkit";

export const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchResults: [],
    isLoading: false,
  },
  reducers: {
    getSearchResultsFetch: (state) => {
      state.isLoading = true;
    },
    getSearchResultsSuccess: (state, action) => {
      state.searchResults = action.payload;
      state.isLoading = false;
    },
    getSearchResultsFailure: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  getSearchResultsFetch,
  getSearchResultsSuccess,
  getSearchREsultsFailure,
} = searchSlice.actions;

export default searchSlice.reducer;
