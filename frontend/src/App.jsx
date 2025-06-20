import FormPage from './Components/FormPage'
import LeftSidebar from './Components/LeftSidebar'
import { Routes,Route, useLocation } from 'react-router-dom'
import PDFKotakSaving from './Pages/PDFKotakSaving'
// import Dashboard from "./Pages/Dashboard"
import ICICIBankPdfDetails from './Pages/ICICIBankPdfDetails'
import LoginPage from './Components/LoginPage'
import Fileupload from './Page/Fileupload'
import Signup from './Components/Signup'
import Dashboard from './Page/Dashboard'
import Navigation from './Components/Navigation'


function App() {

  const location = useLocation();


  return (
    <div className='w-full min-h-screen '>
      <Navigation/>
      <div className="flex ">

        {/* Sidebar */}
        <div>
          {
            (location?.pathname !== "/auth" && location?.pathname !== "/signup") && <LeftSidebar />
          }
          
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ">
          <Routes>
            
            <Route path="/" element={<Fileupload />} />

            <Route path="/auth" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pdf-data" element={<PDFKotakSaving />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}


export default App
