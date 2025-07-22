import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import registrationBackground from '../images/registration_background.svg'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const UserRegister = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("https://event-management-mmle.onrender.com/api/user/register/", {
        name: name,
        email: email,
        password: password,
        confirm_password: confirmPassword
      })

      if (response.data.jwt) {
        localStorage.setItem('token', response.data.jwt.access)
        localStorage.setItem('refreshToken', response.data.jwt.refresh)
        localStorage.setItem('role', 'user')
        alert("Registration successful! Please login to continue.")
        navigate("/user-login")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert('Registration failed: ' + (error.response?.data?.message || error.message))
      } else {
        alert('Registration failed: An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Background Image with Overlay */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 z-10"></div>
        <img
          src={registrationBackground}
          alt="Tech workspace background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-20"></div>

        {/* Welcome Message Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="text-center text-white px-8">
            <h3 className="text-4xl font-bold mb-4">Welcome back</h3>
            <p className="text-lg opacity-90 mb-6 max-w-md">
              To keep connected with us provide us with your information
            </p>
            <button
              onClick={() => navigate("/user-login")}
              className="px-8 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Event <span className="text-purple-600">Hive</span>
            </h1>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up to Event Hive</h2>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                YOUR NAME
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                YOUR EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/user-login")}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserRegister