// src/features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 4,
  pdfData:null,
  userDetails:null,
  loading:false,
  file:null,
  isDataUpdated:false
};

const counterSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPdfData: (state, action) => {
      state.pdfData = action.payload;
    },
    clearPdfData: (state, action) => {
      state.pdfData = null;
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    clearUserDetails: (state, action) => {
      state.userDetails = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFile: (state, action) => {
      state.file = action.payload;
    },
    clearFile: (state, action) => {
      state.file = null;
    },
    setIsDataUpdated: (state, action) => {
      state.isDataUpdated = action.payload;
    },
    
  },
});

export const {  setPdfData,clearPdfData ,setUserDetails,clearUserDetails,setLoading,setFile,clearFile,setIsDataUpdated} = counterSlice.actions;

export default counterSlice.reducer;
