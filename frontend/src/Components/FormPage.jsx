import React, { useState } from 'react';
import PDF from '../Pages/PDF';
import PDFKotakSaving from '../Pages/PDFKotakSaving';
import { useDispatch, useSelector } from 'react-redux';
import { setPdfData } from '../Redux/Slice/userSlice';

function FormPage() {

  const [bankName,setBankName] = useState("kotakBank")
  const [file, setFile] = useState(null);
  const dispatch = useDispatch()
  const pdfData = useSelector((state)=>state.user.pdfData)


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!file) {
        console.log("No file selected");
        return;
      }
      console.log("FIle is : ",file)

      const formData = new FormData();
      formData.append('pdfInput', file);
      formData.append('password', "84679919");

      if(bankName === "kotakBank"){

        const response = await fetch('http://localhost:4000/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to parse PDF');
        }

        const data = await response.json();
        const parsedTransactions = data?.data || [];

        const filteredWithRemarks = parsedTransactions
          .filter((val) => val?.refNo && val?.type !== "credit")
          .map((txn) => ({
            ...txn,
            remark: "" // add remark field
          }));

        console.log('Parsed transactions:', filteredWithRemarks.length);
        dispatch(setPdfData(filteredWithRemarks));
      }

      else{
        
        const response = await fetch('http://localhost:4000/parse-pdf-icici-commercial', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to parse PDF');
        }

        const data = await response.json();
        console.log("data is : ",data)
        // const parsedTransactions = data?.data || [];

        // const filteredWithRemarks = parsedTransactions
        //   .filter((val) => val?.refNo && val?.type !== "credit")
        //   .map((txn) => ({
        //     ...txn,
        //     remark: "" // add remark field
        //   }));

        // console.log('Parsed transactions:', filteredWithRemarks.length);
        dispatch(setPdfData(data?.data));
      }


    } catch (error) {
      console.log("Error in parsing the pdf:", error);
    }
  };


  return (
    <>
      <div className=" bg-gradient-to-br from-blue-800 via-purple-800 to-indigo-900 flex items-center justify-center p-10">
        <div className=" bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-4 border border-white/20">
          <h1 className="text-3xl text-white font-bold text-center my-6">Upload Form</h1>
          
            <form onSubmit={handleSubmit} className="space-y-6">

              <select name="" value={bankName} onChange={(e)=>setBankName(e.target.value)} id="" className='border outline-none px-4 py-2 rounded-lg appearance-none text-white border-white'>
                <option value="kotakBank" className='text-black'>Kotak Bank</option>
                <option value="icici" className='text-black'>ICICI</option>
              </select>

              <div>
                <input
                  type="file"
                  id="fileInput"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-white bg-white/20 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Submit
              </button>
            </form>

            <h1 className='font-semibold text-lg mt-4'>Your PDF data is : </h1>
            <p className="font-semibold mt-4">Length is : {pdfData?.length}</p>

        </div>

      </div>
    </>
  );
}


export default FormPage;
