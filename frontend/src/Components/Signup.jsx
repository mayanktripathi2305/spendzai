
import React, { useState } from 'react';
import Navigation from './Navigation';
import { toast } from 'react-toastify';
import {useDispatch, useSelector} from "react-redux"
import {setLoading} from "../Redux/Slice/userSlice"
import Spinner from "./Spinner"
import supabase from "../Utils/Supabase"
import { useNavigate } from 'react-router-dom';

const Signup = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector((state)=>state.user.loading)

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [name,setName] = useState("")


  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      if (!name) {
        alert("Name is required.");
        return;
      }

      if (!email || !password) {
        alert("Email and password are required.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      dispatch(setLoading(true));

      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (fetchError) {
        console.error("Error checking existing user:", fetchError);
        toast.error("Something went wrong while checking existing users.");
        dispatch(setLoading(false));
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast.error("User already Exist with this Email");
        dispatch(setLoading(false));
        return;
      }

      // ✅ Step 2: Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        toast.error("Sign Up failed: " + signUpError.message);
        dispatch(setLoading(false));
        return;
      }

      // ✅ Step 3: Add user to your custom `users` table
      const userId = signUpData?.user?.id;

      if (userId) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: userId,
            name: name,
            email: email
          }
        ]);

        if (insertError) {
          console.error("Error inserting into users table:", insertError);
          toast.error("Failed to save user profile.");
          dispatch(setLoading(false));
          return;
        }
      }

      // ✅ Step 4: Notify and redirect
      toast.success("Sign up successful! Check your email to confirm.");
      navigate("/auth");

    } catch (error) {
      console.error("Unexpected Error:", error);
      toast.error("Something went wrong during signup.");
    } finally {
      dispatch(setLoading(false));
    }
  };



  return (
    <div className='flex flex-col lg:min-h-screen mt-4 lg:mt-0 '>
      {loading && <Spinner/>}
      <div className="my-auto bg-gradient-to-b from-white to-blue-50 flex flex-col md:flex-row items-center justify-center pb-8">
        {/* Left Side: Text Content */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-[4vw] font-bold text-gray-900 lg:mx-0 mx-4">
            AI-Powered <span className="text-blue-600">Personal Finance</span> <br /> Management
          </h1>
          <p className="text-gray-600 mt-4 text-lg md:text-xl max-w-xl lg:mx-0 mx-4">
            Take control of your finances with intelligent insights, automated categorization,
            and personalized budgeting recommendations powered by advanced AI.
          </p>

          <ul className="mt-6 space-y-4 text-md text-left lg:ml-0 ml-8 text-gray-700">
            <li>✅ Automated expense categorization</li>
            <li>✅ Smart budgeting recommendations</li>
            <li>✅ Real-time financial insights</li>
          </ul>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 w-full max-w-md bg-white shadow-lg rounded-xl md:p-8 p-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Sign up</h2>
          <p className="text-sm text-center text-gray-500 mb-6">Access your financial dashboard</p>

          <form className="space-y-4" onSubmit={handleSignUp}>

            <input
              type="name"
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-500"
              required
              value={name} onChange={(e)=>setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-500"
              required
              value={email} onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300  rounded-md focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-500"
              required
              value={password} onChange={(e)=>setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup
