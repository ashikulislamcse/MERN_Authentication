import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import { toast } from "react-toastify";
import axios from 'axios';
import {useContext} from 'react'
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const navigate = useNavigate()
  const inputRefs = React.useRef([]);
  const {backendURL, isLoggedIn, userData, getUserData} = useContext(AppContext);


  const handleChange = (e, index)=>{
    if(e.target.value.length > 0 && index < inputRefs.current.length -1 ){
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData.split("");

    pasteArray.forEach((char, index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
      }
    })
  }

  const handleSubmit = async(e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join("")

      const {data} = await axios.post(backendURL + '/api/auth/varify-account', {otp})
      if(data.success){
        toast.success(data.message)
        getUserData();
        navigate('/')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

  };

  useEffect(()=>{
    isLoggedIn && userData && userData.isAccountVarified && navigate('/')
  },[isLoggedIn, userData])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form onSubmit={handleSubmit} className='bg-slate-800 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-center text-2xl font-semibold mb-4'>Email Varify OTP</h1>
        <p className='text-indigo-200 text-center mb-6'>Enter the 6-digit Code send to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index)=>(
            <input type="text" maxLength="1" key={index} required
            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
            ref={(e) => (inputRefs.current[index] = e)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button
          type="submit"
          className={'w-full py-2 text-white text-lg font-semibold rounded-md transition bg-indigo-500 hover:bg-indigo-600 cursor-pointer'}
        >
          Verify Email
        </button>
      </form>
    </div>
  )
}

export default EmailVerify


//email varify