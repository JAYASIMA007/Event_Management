import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8000/api/admin/login/', {
      email,
      password,
      role,
    });
    // Store the access token from the correct path
    localStorage.setItem('token', response.data.jwt.access);
    localStorage.setItem('role', role);
    navigate('/dashboard');
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { data?: { error?: string } } } & { message?: string };
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    } else {
      alert('Login failed: ' + String(error));
    }
  }
}; 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
          <p className="text-center">
            Don't have an account? <a href="/register" className="text-blue-500">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;