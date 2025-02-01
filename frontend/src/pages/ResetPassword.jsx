import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {

  const {backendURL} = useContext(AppContext);
  axios.defaults.withCredentials = true;


  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isemailSend, setIsEmailSend] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false)

  const inputRefs = React.useRef([]);
  

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

  const OnSubmitEmail = async(e)=>{
    e.preventDefault();
    try {
      const {data} = await axios.post(backendURL + '/api/auth/send-reset-otp', {email})

      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSend(true);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async (e)=>{
    e.preventDefault();
   const OtpArray = inputRefs.current.map(e =>e.value)
   setOtp(OtpArray.join(""));
   setIsOtpSubmited(true);
  }

  const onsubmitNewPassword = async(e)=>{
    e.preventDefault();
    try {
      const {data} = await axios.post(backendURL + '/api/auth/reset-password', {email, otp, newPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
       <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="Logo"
          className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        />

{!isemailSend &&

        <form onSubmit={OnSubmitEmail} className='bg-slate-800 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-center text-2xl font-semibold mb-4'>Reset your Password</h1>
          <p className='text-indigo-200 text-center mb-6'>Enter Your Registered email address</p>
          <div className="flex gap-3 items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="Email Icon" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none text-white w-full"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
            <button
            type="submit"
            
            className={'w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer'}
          >
            Verify Email
          </button>
        </form>
}

{!isOtpSubmited && isemailSend &&

        <form onSubmit={onSubmitOtp} className='bg-slate-800 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-center text-2xl font-semibold mb-4'>Reset Password OTP</h1>
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
          className={'w-full py-2.5 text-white text-lg font-semibold rounded-md transition bg-indigo-500 hover:bg-indigo-600 cursor-pointer'}
          >
          Submit
          </button>
      </form>

}

{isOtpSubmited && isemailSend &&

      <form onSubmit={onsubmitNewPassword} className='bg-slate-800 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-center text-2xl font-semibold mb-4'>New Password</h1>
          <p className='text-indigo-200 text-center mb-6'>Enter the new password below</p>
          <div className="flex gap-3 items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="Email Icon" />
            <input
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              className="bg-transparent outline-none text-white w-full"
              type="password"
              placeholder="Enter your new password"
              required
            />
          </div>
            <button
            type="submit"
            
            className={'w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer'}
          >
            Submit
          </button>
        </form>
 }
    </div>
  )
}

export default ResetPassword
