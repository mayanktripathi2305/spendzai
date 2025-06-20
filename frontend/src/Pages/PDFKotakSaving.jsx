import React, { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoSaveOutline } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { setPdfData } from '../Redux/Slice/userSlice';
import { useNavigate } from 'react-router-dom';
import { IoFastFoodOutline } from 'react-icons/io5';
import { FaBusAlt, FaFilm, FaHome, FaHospitalAlt, FaShoppingBag, FaMoneyBill } from 'react-icons/fa';
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineShortText } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { RiNumbersFill } from "react-icons/ri";


function PDFKotakSaving() {

  const navigate = useNavigate()


  const pdfData = useSelector((state)=>state.user.pdfData)
  const dispatch = useDispatch()

  const categories = ["Food","Transportation","Entertainment","Shopping","Utility","HealthCare"]

  const [isEdit,setIsEdit] = useState(false)



const getNarrationParts = (narration, refNo) => {
  const specialPattern = /^NACHDB\d+/;


  if (!narration?.includes('/')) {
    return { base: narration, category: "None" };
  }


  const parts = narration.split('/');
  const category = parts.pop();
  const base = parts.join('/');

  return { base, category };
};

  const handleCategoryChange = (e, refNo) => {
    const newCategory = e.target.value;
    const idx = pdfData.findIndex(item => item.refNo === refNo);
    if (idx === -1) return;

    const { base } = getNarrationParts(pdfData[idx].narration, refNo);
    let newNarration = newCategory === "None" ? base : `${base}/${newCategory}`;

    const updatedData = [...pdfData];
    updatedData[idx] = { ...updatedData[idx], narration: newNarration };
    dispatch(setPdfData(updatedData));
  };

  const handleRemarkChange = (e, refNo) => {
    const newRemark = e.target.value;
    const updatedData = pdfData.map((item) => {
      if (item.refNo === refNo) {
        return { ...item, remark: newRemark };
      }
      return item;
    });
    dispatch(setPdfData(updatedData));
  };

    const categoryIcons = {
        Food: <IoFastFoodOutline />,
        Transportation: <FaBusAlt />,
        Entertainment: <FaFilm />,
        Housing: <FaHome />,
        HealthAndMedical: <FaHospitalAlt />,
        Shopping: <FaShoppingBag />,
        UtilityBill: <FaMoneyBill />,
    };



  return (
    <div className='lg:px-8 px-2 '>
      
      
      <div className='flex justify-between items-center lg:p-4 p-2 border-b border-[#cbcbcb] '>

        <div className='flex flex-col '>
          <div className='flex items-center gap-2'>
            <p className=' text-3xl text-blue-500'><RiNumbersFill/></p>
            <p className='lg:text-[2vw] text-[7vw] font-semibold'>{pdfData?.length}</p>
          </div>
          <p className=''>Total No. of Records</p>
        </div>
        {
          isEdit ?
          <p  onClick={()=>navigate('/dashboard')} className='lg:text-[1.2vw] text-[4vw] cursor-pointer px-4 py-2 rounded-lg bg-blue-400 text-white font-semibold'>Save</p>:
          <p onClick={()=>setIsEdit(!isEdit)} className='lg:text-[1.2vw] text-[4vw] cursor-pointer px-4 py-2 rounded-lg bg-green-400 text-white font-semibold'>Edit</p>
        }
      </div>
      
      <div className='overflow-x-auto '>
        <div className='  w-[95vw] lg:w-full'>

          {/* HEading  */}
          <div className='flex justify-between gap-6 lg:gap-0 font-semibold mt-6  rounded-lg py-2 text-gray-500 px-4 '>
            <p className=' lg:w-[7vw] w-[7rem] flex-shrink-0  flex gap-2 items-center'><span className='text-blue-400'><FaRegCalendarAlt/></span>Date</p>
            <p  className=' lg:w-[30vw]  w-[18rem]  flex-shrink-0    flex gap-2 items-center'><span className='text-blue-400'><MdOutlineShortText/></span>Narration</p>
            <p className=' lg:w-[8vw]  w-[7rem]  flex-shrink-0   flex gap-2 items-center'><span className='text-blue-400'>₹</span>Amount</p>
            <p className='lg:w-[12vw]   w-[12rem]  flex-shrink-0   flex gap-2 items-center'><span className='text-blue-400'><BiCategory/></span>Category</p>
          </div>

          <div className='flex flex-col gap-1 mt-4   rounded-lg '>



            {pdfData?.map((data,index) => {
              const { base, category } = getNarrationParts(data?.narration,data.refNo);
              const refNo = data?.refNo;

              return (
                <div key={refNo+index} className={`flex px-4 gap-6 lg:gap-0 justify-between items-center ${index%2===0 ? "bg-[#fafafa]":"bg-white"} border-[#c0c0c0] py-3`}>
                  <p className='lg:w-[7vw]  flex-shrink-0   w-[7rem]  '>{data?.date}</p>

                  <p className=' lg:w-[30vw]  w-[18rem]  flex-shrink-0    overflow-scroll whitespace-nowrap hide-scrollbar  '>
                    {data?.narration}
                  </p>

                  <p className=' lg:w-[8vw]  w-[7rem]  flex-shrink-0   '><span className='font-semibold text-green-400'>₹</span> {data?.amount}</p>

                  {/* Category Column */}
                  {
                    isEdit ? (
                      <select
                        value={category} 
                        onChange={(e) => handleCategoryChange(e, refNo)}
                        className='border rounded-full border-[#b5b5b5] lg:w-[12vw] w-[12rem] flex-shrink-0   py-1 px-2  outline-none cursor-pointer'
                      >
                        {[...new Set([category, ...categories])].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                    ) : (
                      <p className='lg:w-[12vw]  w-[12rem]  flex-shrink-0  flex gap-2 items-center'><span className='text-yellow-400'>{categoryIcons?.[category]}</span> {category}</p>
                    )
                  }


                </div>
              );
            })}





          </div>
        </div>
      </div>
    </div>
  )
}



export default PDFKotakSaving
