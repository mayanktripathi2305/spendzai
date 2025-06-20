import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import supabase from '../Utils/Supabase';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUserDetails } from '../Redux/Slice/userSlice';
import Spinner from "../Components/Spinner"
import { FaDatabase } from "react-icons/fa6";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
const LeftSidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const userDetails = useSelector((state)=>state.user.userDetails)
  const loading = useSelector((state)=>state.user.loading)
  const linkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-md font-medium flex gap-4 items-center ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
    }`;

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
    <aside className="w-64  hidden md:block  p-4">
      {
        loading && <Spinner/>
      }
      <nav className="flex flex-col gap-2">
        <NavLink to="/" end className={linkClasses}>
          <span className='text-xl'><IoHomeOutline/></span>
          Home
        </NavLink>
        <NavLink to="/pdf-data" className={linkClasses}>
          <span className='text-xl'><FaDatabase/></span>
          Data
        </NavLink>
        <NavLink to="/dashboard" className={linkClasses}>
          <span className='text-xl'><LuLayoutDashboard/></span>
          Dashboard
        </NavLink>
      </nav>
    </aside>
  );
};



export default LeftSidebar
