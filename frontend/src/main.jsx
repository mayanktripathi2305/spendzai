import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './Redux/store.js'
import {Provider}  from "react-redux"
import {BrowserRouter} from "react-router-dom"
import { ToastContainer } from 'react-toastify';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store ={store}>

        <App />
        <ToastContainer/>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
