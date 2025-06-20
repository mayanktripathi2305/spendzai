import React, { useState } from 'react'
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import supabase from '../Utils/Supabase';
import { setLoading } from '../Redux/Slice/userSlice';
function FeedBackForm({closeForm}) {

    const [messageType,setMessageType] = useState("suggestions")
    const [message,setMessage] = useState("")
    const userDetails = useSelector((state)=>state.user.userDetails)
    const dispatch = useDispatch()

    const submitForm = async (e) => {
        e.preventDefault();

        if (!userDetails || !userDetails.id) {
            toast.error("Please login first");
            return;
        }

        try {
            // Check if a feedback already exists for this user
            dispatch(setLoading(true))
            const { data: existingFeedback, error: fetchError } = await supabase
            .from("feedbacks")
            .select("*")
            .eq("user_id", userDetails.id)
            .maybeSingle(); // ✅ avoids throwing if no row

            if (fetchError) {
            console.error("Fetch error:", fetchError);
            toast.error("Error checking existing feedback");
            return;
            }

            if (existingFeedback) {
            // ✅ Feedback exists → update
            const { error: updateError } = await supabase
                .from("feedbacks")
                .update({
                message_type: messageType,
                message: message,
                created_at: new Date(), // optional update timestamp
                })
                .eq("user_id", userDetails.id);

            if (updateError) {
                console.error("Update error:", updateError);
                toast.error("Failed to update feedback.");
                return;
            }

            toast.success("Feedback updated!");
            
            } else {
            // ✅ No feedback yet → insert new
            const { error: insertError } = await supabase
                .from("feedbacks")
                .insert([
                {
                    user_id: userDetails.id,
                    message_type: messageType,
                    message: message,
                }
                ]);

            if (insertError) {
                console.error("Insert error:", insertError);
                toast.error("Failed to submit feedback.");
                return;
            }

            toast.success("Feedback submitted!");
            }

            setMessage("");
            setMessageType("suggestions");
            closeForm();
            dispatch(setLoading(false))

        } catch (error) {
            console.error("Unexpected Error:", error);
            toast.error("Unexpected Error: " + error.message);
            dispatch(setLoading(false))
        }
    };


  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center'>
      <div className='border   border-[#d6d6d6] rounded-xl  lg:w-[30vw] w-[90vw] lg:h-[60vh] h-[50vh] p-6 bg-white'>
         <div className='flex justify-between items-center'>
            <p className='md:text-[1.6vw] text-[6vw] font-semibold'>Feedback Form </p>
            <button type='button' className='cursor-pointer  md:text-[2vw] text-[6vw]' onClick={closeForm}><RxCross1/></button>
         </div>

         <form action="" onSubmit={submitForm} className='mt-6 flex flex-col gap-4'>
            <label htmlFor="type" className='flex flex-col gap-2'>
                <span  className='text-xl font-semibold'>Type</span>
                <select name="" id="type" value={messageType} onChange={(e)=>setMessageType(e.target.value)} className='border  border-[#d6d6d6] outline-none appearance-none px-4 py-2 rounded-lg'>
                    <option value="featureRequest">Feature Request</option>
                    <option value="suggestions">Suggestions</option>
                </select>
            </label>
            <label htmlFor="message" className='flex flex-col gap-2'>
                <span  className='text-xl font-semibold'>Message</span>
                <textarea name="" id="message" value={message} onChange={(e)=>setMessage(e.target.value?.slice(0,200))} rows={5} className='border  border-[#d6d6d6] outline-none p-2 rounded-lg' placeholder='Message...'></textarea>
            </label>

            <button type='submit' className='py-2 cursor-pointer hover:bg-blue-600 transition-all duration-all px-4 rounded-lg bg-blue-500 text-white font-semibold text-lg'>Send</button>
         </form>
      </div>
    </div>
  )
}

export default FeedBackForm
