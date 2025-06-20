// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from "./Slice/userSlice"

export const store = configureStore({
  reducer: {
    user: counterReducer,
  },
});
