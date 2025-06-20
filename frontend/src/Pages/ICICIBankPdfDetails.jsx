import React from 'react'
import { useSelector } from 'react-redux'
import { exportToExcel } from './exportToExcel';

function ICICIBankPdfDetails() {
    const pdfData = useSelector((state)=>state.user.pdfData)
      const handleDownload = () => {
        exportToExcel(pdfData, 'Transaction_Report');
      };
  return (
    <div className='flex flex-col gap-4'>
        <div>
            <p className='font-semibold text-lg'>Basic Details</p>
            <button onClick={handleDownload}>Download Excel</button>
        </div>

        <div className='flex flex-col gap-4'>
            {/* Heading  */}
            <div className='flex items-center justify-between font-semibold text-lg'>
                <p className='bg-green-400 w-[8vw] text-center'>Tran Date</p>
                <p  className='bg-green-400 w-[30vw] text-center'>particulars</p>
                <p  className='bg-green-400 w-[10vw] text-center'>Location</p>
                <p  className='bg-green-400 w-[7vw] text-center'>Withdraw</p>
                <p  className='bg-green-400 w-[7vw] text-center'>Deposit</p>
                <p  className='bg-green-400 w-[7vw] text-center'>Balance</p>
            </div>

            {/* PDF Data  */}
            <div className='flex flex-col gap-2'>
                {
                pdfData?.map((data)=>{
                    return  <div key={data?.particulars} className='flex items-center justify-between '>
                                <p className=' w-[8vw] border text-center  py-1 px-2'>{data?.transactionDate}</p>
                                <p  className=' w-[30vw] border text-center overflow-scroll whitespace-nowrap hide-scrollbar py-1 px-2'>{data?.particulars}</p>
                                <p  className=' w-[10vw] border text-center overflow-scroll whitespace-nowrap hide-scrollbar  py-1 px-2'>{data?.location}</p>
                                <p  className=' w-[7vw] border text-center py-1 px-2'>{data?.withdrawal}</p>
                                <p  className=' w-[7vw] border text-center py-1 px-2'>{data?.deposit}</p>
                                <p  className=' w-[7vw] border text-center py-1 px-2'>{data?.balance}</p>
                            </div>
                })  
                }
            </div>
        </div>
    </div>
  )
}

export default ICICIBankPdfDetails
