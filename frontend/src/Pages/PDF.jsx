import React from 'react'

function PDF({parsedData}) {
  return (
    <div>
      {/* HEading  */}
      <div className='flex justify-between items-center text-lg font-semibold'>
        <p className='bg-red-400 w-[12vw]'>Tran Date</p>
        {/* <p  className='bg-red-400 w-[12vw]'>Value Date</p> */}
        <p  className='bg-red-400 w-[70vw]'>Particulars</p>
        <p className='bg-red-400 w-[8vw]'>Amount</p>
        {/* <p className='bg-red-400 w-[8vw]'>Type</p> */}
      </div>

      <div className='flex flex-col gap-1 mt-2'>

        {
          parsedData?.map((data,index)=>{
            return <div key={index} className='flex justify-between items-center  '>
          <p className=' w-[12vw] border py-1 px-2'>{data?.tranDate}</p>
          {/* <p  className='border w-[12vw]'>Value Date</p> */}
          <p  className='border w-[70vw] overflow-scroll whitespace-nowrap hide-scrollbar py-1 px-2'>{data?.narration}</p>
          <p className='border w-[8vw] py-1 px-2'>{data?.withdrawals}</p>
          {/* <p className='border w-[8vw] py-1 px-2'>{data?.type}</p> */}
        </div>
          })
        }


      </div>
    </div>
  )
}

export default PDF
