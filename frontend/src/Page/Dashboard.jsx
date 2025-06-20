import React, { useEffect, useState } from 'react'
import { IoFastFoodOutline } from 'react-icons/io5';
import { FaBusAlt, FaFilm, FaHome, FaHospitalAlt, FaShoppingBag, FaMoneyBill } from 'react-icons/fa';

import { useDispatch, useSelector } from 'react-redux';
import { exportToExcel } from '../Pages/exportToExcel';
import { exportToCSV } from '../Pages/exportToCSV';
import { categorizeMonthTransactions } from '../Pages/MonthWiseTransactions';
import { categorizeTransactions } from '../Pages/CalculateKotalTransactions';
import { categorizeTransactionsByMonthObject } from '../Pages/CalculateMonthArraytransaction';
import supabase from '../Utils/Supabase';
import LineGraph from '../Pages/LineGraph';
import { setIsDataUpdated, setLoading } from '../Redux/Slice/userSlice';
import { toast } from 'react-toastify';
import Navigation from '../Components/Navigation';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Components/Spinner';
function Dashboard() {

  const userDetails = useSelector((state)=>state.user.userDetails)
  const isDataUpdated = useSelector((state)=>state.user.isDataUpdated)
  // console.log("user Details : ",userDetails)
  const dispatch = useDispatch();
  const loading = useSelector((state)=>state.user.loading)
  const navigate = useNavigate()

const currentMonth = new Date().toLocaleString('default', { month: 'long' });

const [month, setMonth] = useState(currentMonth);
  const [year,setYear] = useState(2025)
  const pdfData = useSelector(state => state.user.pdfData);
  const categorizedData = categorizeTransactions(pdfData || []);
  const categorizedMonthData = categorizeMonthTransactions(pdfData || [],month,year);
  const result = categorizeTransactionsByMonthObject(pdfData||[])

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    const categoryIcons = {
        Food: <IoFastFoodOutline />,
        Transportation: <FaBusAlt />,
        Entertainment: <FaFilm />,
        Housing: <FaHome />,
        HealthCare: <FaHospitalAlt />,
        Shopping: <FaShoppingBag />,
        Utility: <FaMoneyBill />,
    };

  const formattedData = pdfData?.map(txn => ({
    Date: txn.date,
    Narration: txn.narration,
    'Ref No': txn.refNo,
    Amount: txn.amount,
    Type: txn.type,
  }));

  const handleDownload = () => {
    exportToExcel(formattedData, 'Transaction_Report');
  };

    const handleDownloadCSV = () => {
    exportToCSV(pdfData, 'Transaction_Report');
  };



    const insertIntoSupabase = async () => {
      if (!userDetails) {
          toast.error("Please Login first");
          navigate("/")
          return;
      }

      const userId = userDetails.id;

      if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
          console.warn("Result is empty or invalid.");
          return;
      }

      try {
          dispatch(setLoading(true))
          
          const { data: existingData, error: fetchError } = await supabase
          .from('monthly_transaction_data')
          .select('*')
          .eq('user_id', userId) // make sure user-specific data
          .limit(1);

          if (fetchError) {
          throw new Error("Failed to fetch existing data: " + fetchError.message);
          }

          if (existingData && existingData.length > 0) {
          const existing = existingData[0];
          const mergedData = { ...(existing.data || {}) };

          for (const monthKey of Object.keys(result)) {
              mergedData[monthKey] = result[monthKey]; // Add or overwrite
          }

          const { data: updated, error: updateError } = await supabase
              .from('monthly_transaction_data')
              .update({ data: mergedData, pdfData })
              .eq('id', existing.id) // Update only this exact row
              .eq('user_id', userId) // Extra safety
              .select();

          if (updateError) {
              throw new Error("Failed to update data: " + updateError.message);
          }

          console.log("Data updated successfully!", updated);
          // toast.success("Data updated in Supabase!");

          } 
          else {
          // No data exists for this user — insert new
              const { data: inserted, error: insertError } = await supabase
              .from('monthly_transaction_data')
              .insert([
                  {
                  key: `user_dashboard_${Date.now()}`,
                  data: result,
                  user_id: userId,
                  pdfData
                  }
              ])
              .select();

              if (insertError) {
              throw new Error("Failed to insert data: " + insertError.message);
              }
              // toast.success("Data inserted to Supabase!");
          }
          dispatch(setLoading(false))
          dispatch(setIsDataUpdated(true))

      } catch (err) {
          console.error(err);
          alert("Operation failed: " + err.message);
          dispatch(setLoading(false))
      }
    };

    useEffect(()=>{
      if(!isDataUpdated){
        insertIntoSupabase()
      }
    },[])



  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(prev => !prev);
  };


  return (
    <div className='lg:p-8 p-2 bg-[#f6f6f6]'>
      
      {loading && <Spinner/>}

      <div className='flex justify-between items-center lg:mr-12 px-4 lg:px-0'>
        <p className='text-xl font-semibold text-blue-500 flex gap-2 items-center'>Overall <span className='hidden lg:block'>Expenses</span></p>
        <div className='flex gap-4'>
            <button onClick={()=>navigate("/pdf-data")} className='lg:px-4 px-2 py-2 rounded-lg bg-green-400 text-white font-semibold cursor-pointer'>Edit Data</button>
            <div className="relative inline-block">
                <button
                    onClick={toggleOptions}
                    className="bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white lg:px-4 px-2  py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    disabled={!pdfData}
                >
                    Export 
                </button>

                {showOptions && (
                    <div className="absolute mt-2 right-0 lg:-right-16 bg-white border border-[#f6f6f6] rounded shadow w-36 z-10">
                    <button
                        onClick={handleDownload}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                        Export to CSV
                    </button>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Total Pdf Data  */}
      <div className='flex flex-wrap mt-6  gap-5  p-4 rounded-xl bg-white '>

        {Object.entries(categorizedData)?.map(([category, data],index) => (
            <div key={category} className={`flex flex-col gap-1  lg:w-[18vw] w-full  border-[#e3e3e3] ${index !== 0 ? "bg-[#F6F6F6]":"bg-blue-500 text-white"}  lg:h-[20vh] h-[8rem] border rounded-xl lg:p-4 p-2 px-6 `}>
                <div className='flex justify-between items-center text-lg '>
                    <p>{category}</p>
                    <p className='px-[6px] py-[6px] bg-blue-100 text-blue-500 rounded-full lg:text-[1.3vw] text-[5vw]'>{categoryIcons[category] || <IoFastFoodOutline />}</p>
                </div>
                <p className='text-start font-semibold lg:text-[2vw] text-[7vw]'>₹ {data.totalAmount.toFixed(2)}</p>
                <div className='flex items-center gap-2'> 
                    <p className='px-4  rounded-xl bg-green-100 text-green-400 text-sm'>↑ 10% </p>
                    <p className={`lg:text-[0.8vw] text-[2.6vw] ${index !== 0 ? "text-[#686868]":"text-[#d8d8d8]"}`}>Overall Month</p>
                </div>
            </div>
        ))}


      </div>

      {/* Total Montly data  */}
          
      <div  className='mt-10'>
            <div className='flex justify-between items-center my-4 bg-white px-4 py-2 rounded-lg'>
              <p className='font-semibold text-xl text-blue-500 flex gap-2 items-center'>Monthly <span className='hidden lg:block'>Expenses</span></p>
              <div className='flex gap-4'>
                <select name="" id="" value={month} onChange={(e)=>setMonth(e.target.value)} className='outline-none border px-4 py-2 rounded-lg appearance-none border-green-500 bg-green-400 text-white font-semibold cursor-pointer'>
                  {
                    months?.map((mon)=>{
                      return <option key={mon} className='bg-white text-black' value={mon}>{mon}</option>
                    })
                  }
                </select>
                <select name="" id="" value={year} onChange={(e)=>setYear(e.target.value)}  className='outline-none border px-4 py-2 rounded-lg appearance-none border-blue-500 bg-blue-400 text-white font-semibold cursor-pointer'>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap  gap-5 p-4 rounded-xl bg-white ">
              {Object.entries(categorizedMonthData)?.map(([category, data],index) => (
                <div key={category} className={`flex flex-col gap-1  lg:w-[18vw] w-full border-[#e3e3e3]  ${index !== 0 ? "bg-[#F6F6F6]":"bg-blue-500 text-white"} lg:h-[20vh] h-[8rem] border rounded-xl lg:p-4 p-2 px-6 `}>
                    <div className='flex justify-between items-center text-lg '>
                        <p>{category}</p>
                        <p className='px-[6px] py-[6px] bg-blue-100 text-blue-500 rounded-full lg:text-[1.3vw]  text-[5vw]'>{categoryIcons[category] || <IoFastFoodOutline />}</p>
                    </div>
                    <p className='text-start font-semibold lg:text-[2vw]  text-[7vw]'>₹ {data.totalAmount.toFixed(2)}</p>
                    <div className='flex items-center gap-2'> 
                        <p className='px-4  rounded-xl bg-green-100 text-green-400 text-sm'>↑ 10% </p>
                        <p className={`lg:text-[0.8vw]  text-[2.6vw] ${index !== 0 ? "text-[#686868]":"text-[#d8d8d8]"}`}>This Month</p>
                    </div>
                </div>
              ))}
            </div>
      </div>


      {/* Line Graph  */}
        <div className='mt-10'>
          <LineGraph data={result}/>
        </div>
    </div>
  )
}

export default Dashboard
