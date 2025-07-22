import { useState } from "react"
import { useNavigate, } from "react-router-dom"
import axios from "axios"
import eventBackground from "../images/event_background.svg"
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:8000/api/admin/login/", {
        email,
        password,
      })
      localStorage.setItem("token", response.data.jwt.access)
      localStorage.setItem("role", "admin")
      navigate("/dashboard")
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { error?: string } } } & { message?: string }
        alert("Login failed: " + (err.response?.data?.error || err.message))
      } else {
        alert("Login failed: " + String(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Event Hive</h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  PASSWORD
                </label>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:block flex-1 relative h-screen">
        <img 
          src={eventBackground} 
          alt="Event background" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-20"></div>
      </div>
    </div>
  )
}

export default AdminLogin