import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLogin from './Pages/AdminLogin';
import AdminRegister from './Pages/AdminRegister';
import Dashboard from './Pages/Dashboard';
import CreateEvent from './Pages/CreateEvent';
import UserLogin from './Pages/UserLogin';
import UserRegister from './Pages/UserRegister';
import Home from './Pages/Home';
import UserDashboard from './Pages/UserDashboard';

import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
