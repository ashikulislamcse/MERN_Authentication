import { useContext } from 'react';
import { assets } from '../assets/assets.js';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  
  const navigate = useNavigate();
  const { userData, backendURL, setUserData, setIsLoggedIn } = useContext(AppContext);


  const sendvarifyOtp = async ()=>{
    try {
      axios.defaults.withCredentials = true;

      const {data} = await axios.post(backendURL + '/api/auth/send-varify-otp');
      if(data.success){
        navigate('/email-varify');
        toast.success(data.message);
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const logout = async()=>{
    try {
      axios.defaults.withCredentials = true
      const {data} = await axios.post(backendURL + '/api/auth/logout')
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate('/');

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
        <img src={assets.logo} alt="Logo" className="w-28 sm:w-32" />
        {userData && userData.name ? (
  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-800 font-bold relative group">
    {userData.name[0].toUpperCase()}
    <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
      <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
        {!userData.isAccountVarified &&  <li onClick={sendvarifyOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Varify Email</li>
        }
        <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer text-center pr-15'>Logout</li>
      </ul>
    </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-all"
            >
              Login <img src={assets.arrow_icon} alt="Arrow Icon" />
            </button>
          )}

      </div>
    </div>
  );
};

export default Navbar;
