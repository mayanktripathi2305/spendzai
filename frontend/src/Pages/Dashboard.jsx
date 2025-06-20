
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { categorizeTransactions } from './CalculateKotalTransactions';
import { categorizeMonthTransactions } from './MonthWiseTransactions';
import { categorizeTransactionsByMonthObject } from './CalculateMonthArraytransaction';

import supabase from '../Utils/Supabase';
import LineGraph from './LineGraph';

import { exportToExcel } from './exportToExcel';
import { exportToCSV } from './exportToCSV';
import { toast } from 'react-toastify';
import { setLoading } from '../Redux/Slice/userSlice';
import Spinner from '../Components/Spinner';



const Dashboard = () => {

  const userDetails = useSelector((state)=>state.user.userDetails)
  const dispatch = useDispatch();
  const loading = useSelector((state)=>state.user.loading)

  const [month,setMonth] = useState("May")
  const [year,setYear] = useState(2025)
  const pdfData = useSelector(state => state.user.pdfData);
  const categorizedData = categorizeTransactions(pdfData || []);
  const categorizedMonthData = categorizeMonthTransactions(pdfData || [],month,year);
  const result = categorizeTransactionsByMonthObject(pdfData||[])

  const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


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
    return;
  }

  const userId = userDetails.id;

  if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
    console.warn("Result is empty or invalid.");
    return;
  }

  try {
    dispatch(setLoading(true))
    // Ensure strict user filtering
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
      toast.success("Data updated in Supabase!");

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
        toast.success("Data inserted to Supabase!");
    }
    dispatch(setLoading(false))

  } catch (err) {
    console.error(err);
    alert("Operation failed: " + err.message);
  }
};




  // useEffect(() => {
  //   if (userDetails && result && Object.keys(result).length > 0) {
  //     insertIntoSupabase();
  //   }
  // }, [userDetails, result]);


  return (
    <>
      <div>
        {
          loading && <Spinner/>
        }
        <div className='flex items-center justify-between'>
          <div>
            <p className='my-4 font-semibold text-xl text-blue-500'>Total Transactions: {pdfData?.length}</p>
            <p className='my-4 font-semibold text-xl text-blue-500'>Total Amount: {pdfData?.reduce((acc,val)=>acc+Number(val?.amount),0).toFixed(2)}</p>
          </div>
          <button onClick={insertIntoSupabase} className='px-4 py-2 rounded-lg border bg-blue-400 text-white font-semibold cursor-pointer'>Save Data</button>
        </div>
        <div className='flex gap-10'>

          <button onClick={handleDownload} className='px-4 py-2 rounded-lg bg-green-400 text-white font-semibold cursor-pointer'>Download Excel</button>
          <button onClick={handleDownloadCSV} className='px-4 py-2 rounded-lg bg-green-400 text-white font-semibold cursor-pointer'>Download CSV</button>
        </div>
      </div>
       <div className='flex justify-between items-center'>

          <div className='w-[45%]'>
            <p className='my-4 font-semibold text-lg py-2'>Over all</p>
            <div className="flex flex-wrap justify-between gap-6">
              {Object.entries(categorizedData)?.map(([category, data]) => (
                  <div key={category} className="border border-blue-500 rounded-xl p-4 shadow w-[14vw]">
                  <p className="font-semibold text-blue-500 text-lg">{category}</p>
                  <p className="text-sm text-gray-600">Transactions: {data.transactions.length}</p>
                  <p className="text-sm text-gray-600">Total: ₹{data.totalAmount.toFixed(2)}</p>
                  </div>
              ))}
            </div>
          </div>

          {/* <div className='border-l-2 w-[1vw] h-[60vh]'></div> */}
          
          <div  className='w-[45%]'>
            <div className='flex justify-between items-center my-4'>
              <p className='font-semibold text-lg'>This Month</p>
              <div className='flex gap-4'>
                <select name="" id="" value={month} onChange={(e)=>setMonth(e.target.value)} className='outline-none border px-4 py-2 rounded-lg appearance-none'>
                  {
                    months?.map((mon)=>{
                      return <option key={mon} value={mon}>{mon}</option>
                    })
                  }
                </select>
                <select name="" id="" value={year} onChange={(e)=>setYear(e.target.value)}  className='outline-none border px-4 py-2 rounded-lg appearance-none'>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-6">
              {Object.entries(categorizedMonthData)?.map(([category, data]) => (
                <div key={category} className="border border-blue-500 rounded-xl p-4 shadow w-[14vw]">
                  <p className="font-semibold text-blue-500 text-lg">{category}</p>
                  <p className="text-sm text-gray-600">Transactions: {data.transactions.length}</p>
                  <p className="text-sm text-gray-600">Total: ₹{data.totalAmount.toFixed(2)}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className='mt-10'>
          <LineGraph data={result}/>
        </div>

      </>
  );
};

export default Dashboard;



















