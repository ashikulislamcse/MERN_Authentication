import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { backendURL, setIsLoggedIn, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      let response;
      if (state === "Sign Up") {
        response = await axios.post(`${backendURL}/api/auth/register`, {
          name,
          email,
          password,
        });
      } else {
        response = await axios.post(`${backendURL}/api/auth/login`, {
          email,
          password,
        });
      }

      if (response.data.success) {
        setIsLoggedIn(true);
        getUserData()
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400 relative">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* Form Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-2">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-gray-600 mb-6">
          {state === "Sign Up" ? "Create your account" : "Login to your account!"}
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {state === "Sign Up" && (
            <div className="flex gap-3 items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="User Icon" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none text-white w-full"
                type="text"
                placeholder="Enter your Name"
                required
              />
            </div>
          )}

          {/* Email Field */}
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

          {/* Password Field */}
          <div className="flex gap-3 items-center w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="Password Icon" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none text-white w-full"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Forgot Password - Only for Login */}
          {state === "Login" && (
            <div
              onClick={() => navigate("/reset-password")}
              className="text-right text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Forgot Password?
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-full w-full hover:bg-blue-700 transition cursor-pointer"
          >
            {state === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <p className="text-gray-700 mt-4">
          {state === "Sign Up" ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}
          >
            {state === "Sign Up" ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;



//Login Section
