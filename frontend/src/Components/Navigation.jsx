import React, { useEffect, useState } from 'react';
import { BookOpen, UserPlus, Menu } from 'lucide-react';
import { useNavigate,useLocation } from 'react-router-dom';
import FeedBackForm from '../Page/FeedBackForm';
import { LogOut } from "lucide-react"; 
import { Home  } from "lucide-react"; 
import {  Database  } from "lucide-react"; 
import {  LayoutDashboard   } from "lucide-react"; 
import supabase from '../Utils/Supabase';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUserDetails } from '../Redux/Slice/userSlice';
import Spinner from './Spinner';


const Navigation = () => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userDetails = useSelector((state)=>state.user.userDetails);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const loading = useSelector((state)=>state.user.loading)

  const [isFeedBackFormOpen, setIsFeedBackFormOpen] = useState(false)
  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };
  const handleFeedback = () => {
    setIsMobileMenuOpen(false);
    setIsFeedBackFormOpen(true)
  };

  const logoutHandler = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth"); // or your login page
    setIsMobileMenuOpen(false);
  }

  const checkSession = async () => {
    try {
      if (userDetails) return;

      dispatch(setLoading(true));
      const { data, error } = await supabase.auth.getUser();
      dispatch(setLoading(false));

      if (error) {
        if (error.message === "Auth session missing!") {
          // toast.warn("You are not logged in yet")
        } else {
          toast.error("Error fetching user: " + error.message);
        }
        navigate("/auth")
      }

      dispatch(setUserDetails(data?.user));
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Unexpected error: " + err.message);
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    checkSession();
  }, []);



  return (
    <nav className="relative bg-gradient-to-r from-[#ffffff] to-[#f6f6f6] px-4 sm:px-8 md:px-16 lg:px-36 py-4  border-b border-[#e9e9e9]">
      {loading && <Spinner/>}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl sm:text-2xl lg:text-[1.6vw] font-bold text-gray-900">SpendzAI</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">

          {/* Sign Up */}
           {
                location?.pathname === "/auth" &&
                <div  onClick={()=>navigate("/signup")}  className="flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100 transition">
                    <UserPlus size={18} />
                    <span className="font-medium text-sm">Sign Up</span>
                </div>
            }

            {/* Login  */}
           {
              location?.pathname === "/signup" &&
              <div  onClick={()=>navigate("/auth")}  className="flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100 transition">
                  <UserPlus size={18} />
                  <span className="font-medium text-sm">Login</span>
              </div>
            }

            {/* Feed Back Form   */}
           {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div  onClick={()=>setIsFeedBackFormOpen(true)}  className="flex items-center space-x-2 bg-blue-500 text-white cursor-pointer border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-600 transition">
                  <UserPlus size={18} />
                  <span className="font-medium text-sm">Feedback</span>
              </div>
            }

            {/* Logout Form   */}
           {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div     
                onClick={logoutHandler}  
                className="flex items-center space-x-2 bg-red-500 text-white cursor-pointer border border-red-500 px-4 py-1 rounded-md hover:bg-red-600 transition">
                  <LogOut size={18} />
              </div>
            }
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          // <div className="flex flex-col gap-3 mt-4 md:hidden">
          <motion.div       
              key="mobile-menu"
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-white shadow-md z-50 flex flex-col gap-3 px-4 py-4 md:hidden">

            {/* Sign Up */}
            {
              location?.pathname === "/auth" &&
              <div onClick={()=>handleNavigate("/signup")} className="flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                  <UserPlus size={18} />
                  <span className="font-medium text-sm">Sign Up</span>
              </div>
              }

            {/* Login Up */}
            {
              location?.pathname === "/signup" &&
              <div onClick={()=>handleNavigate("/auth")} className="flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                  <UserPlus size={18} />
                  <span className="font-medium text-sm">Login</span>
              </div>
            }


            {/* Home Page */}
            {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div onClick={()=>handleNavigate("/")} className={`flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition ${location?.pathname === "/"&&"bg-blue-500 text-white"}`}>
                  <Home   size={18} />
                  <span className="font-medium text-sm">Home</span>
              </div>
            }

            {/* Data part */}
            {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div onClick={()=>handleNavigate("/pdf-data")} className={`flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition ${location?.pathname === "/pdf-data"&&"bg-blue-500 text-white"}`}>
                  <Database  size={18} />
                  <span className="font-medium text-sm">Data</span>
              </div>
            }

            {/* Dashboard*/}
            {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div onClick={()=>handleNavigate("/dashboard")} className={`flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition ${location?.pathname === "/dashboard"&&"bg-blue-500 text-white"}`}>
                  <LayoutDashboard  size={18} />
                  <span className="font-medium text-sm">Dashboard</span>
              </div>
            }

            
            {/* Feed Back Up */}
            {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div onClick={handleFeedback} className="flex items-center space-x-2 text-gray-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                  <UserPlus size={18} />
                  <span className="font-medium text-sm">Feedback</span>
              </div>
            }

            
            {/* Logout  Up */}
            {
              (location?.pathname !== "/signup" && location?.pathname !== "/auth") &&
              <div onClick={logoutHandler} className="flex items-center space-x-2 text-red-800 hover:text-black cursor-pointer border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                  <LogOut size={18} />
                  <span className="font-medium text-sm">Log out</span>
              </div>
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Back Form  */}
      {
        isFeedBackFormOpen && 
        <FeedBackForm closeForm ={()=>setIsFeedBackFormOpen(false)}/>
      }
    </nav>
  );
};

export default Navigation;
