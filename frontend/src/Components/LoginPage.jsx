
import React, { useState } from 'react';
import Navigation from './Navigation';
import { toast } from 'react-toastify';
import {useDispatch, useSelector} from "react-redux"
import {setLoading} from "../Redux/Slice/userSlice"
import Spinner from "./Spinner"
import supabase from "../Utils/Supabase"
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loading = useSelector((state)=>state.user.loading)

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const loginHandler = async(e)=>{
    try{
      e.preventDefault();

      if (!email || !password) {
        toast.error("Email and password are required.");
        return;
        }
      dispatch(setLoading(true))
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
        
      if (error) {
        toast.error("Login failed: " + error.message);
        dispatch(setLoading(false))
        return;
      } else {
        toast.success("Logged in successfully!");
      }
      dispatch(setLoading(false))
      navigate("/")
    }
    catch(error){
      toast.error("Unexpected Error"+error.message)
      console.log("Error while login ",error)
      return;
    }
  }



  return (
    <div className='flex flex-col  lg:min-h-screen mt-4 lg:mt-0'>
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
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Login</h2>
          <p className="text-sm text-center text-gray-500 mb-6">Access your financial dashboard</p>

          <form className="space-y-4" onSubmit={loginHandler}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-500"
              required
              value={email} onChange={(e)=>setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-none focus:ring-blue-500"
              required
              value={password} onChange={(e)=>setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;







































// import React, { useState } from 'react';
// import supabase from '../Utils/Supabase';
// import { toast } from 'react-toastify';
// import { useDispatch, useSelector } from 'react-redux';
// import { setLoading } from '../Redux/Slice/userSlice';
// const LoginPage = () => {

//   const dispatch = useDispatch()
//   const loading = useSelector((state)=>state.user.loading)

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('')


    
//     const handleSignUp = async (e) => {
//       try{
//         e.preventDefault();

//         if (!email || !password) {
//             alert("Email and password are required.");
//             return;
//         }

//         if (password.length < 6) {
//             alert("Password must be at least 6 characters.");
//             return;
//         }
//         dispatch(setLoading(true))

//         const { data, error } = await supabase.auth.signUp({ email, password });
        
//         if (error) {
//           const alreadyExists =
//           error.message.toLowerCase().includes("already registered") ||
//           error.message.toLowerCase().includes("email") ||
//           error.status === 400 || error.status === 422;
          
//           if (alreadyExists) {
//             toast.error("User already exists. Please log in instead.");
//           } else {
//             toast.error("Signup failed: " + error.message);
//           }
          
//         } else {
//           toast.success("Sign up successful! Check your email to confirm.");
//           console.log("Signup success:", data);
//         }
//         dispatch(setLoading(false))
//       }
//       catch(error){
//         console.log("Unexpected Error : ",error)
//         toast.error(error)
//       }

//     };

//     const handleLogin = async (e) => {
//       try{
//         e.preventDefault();

//         if (!email || !password) {
//         toast.error("Email and password are required.");
//         return;
//         }
//         dispatch(setLoading(true))
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });
        
//         if (error) {
//           toast.error("Login failed: " + error.message);
//           console.error("Login error:", error);
//         } else {
//           toast.success("Logged in successfully!");
//           console.log("Login success:", data);
//         }
//         dispatch(setLoading(false))
//       }
//       catch(error){
//         console.log("Unexpected Error : ",error)
//         toast.error("Unexpected Error"+error)
//       }
//     };



//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
//       <form
//         onSubmit={handleSignUp}
//         // onSubmit={handleLogin}
//         className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
//       >
//         <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             type="email"
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Password</label>
//           <input
//             type="password"
//             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
//         >
//           Sign In
//         </button>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;
