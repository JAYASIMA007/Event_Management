import { Link } from 'react-router-dom';
import { FaUserTie, FaUsers } from 'react-icons/fa'; // Import icons

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="container mx-auto px-4 h-screen flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Welcome to Event Hive
          </h1>
          <p className="text-xl text-white/90 font-light">
            Your One-Stop Destination for Seamless Event Management
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mx-auto">
          {/* Admin Portal Card */}
          <Link to="/admin-login" className="w-full md:w-1/2">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="text-center">
                <FaUserTie className="w-16 h-16 mx-auto text-white mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Admin Portal
                </h2>
                <p className="text-white/80 mb-6">
                  Manage events, users, and settings with complete administrative control
                </p>
                <button className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                  Login as Admin
                </button>
              </div>
            </div>
          </Link>

          {/* User Portal Card */}
          <Link to="/user-login" className="w-full md:w-1/2">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="text-center">
                <FaUsers className="w-16 h-16 mx-auto text-white mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-4">
                  User Portal
                </h2>
                <p className="text-white/80 mb-6">
                  Discover and participate in exciting events tailored just for you
                </p>
                <button className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                  Login as User
                </button>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Home;