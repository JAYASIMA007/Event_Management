import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  venue: string;
  start_date: string;
  end_date: string;
  cost: string;
  description: string;
  image: string;
  start_time: string;
  end_time: string;
  created_by: string;
}

const UserDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/user-login');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/get-events/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Update this line to access the events array from the response
        setEvents(response.data.events);
        
        // Debug logs
        console.log('Response:', response.data);
        console.log('Events:', response.data.events);

      } catch (error) {
        console.error('Error fetching events:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/user-login');
        }
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard - User</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {events && events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (INR)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.venue}</td>
                    <td className="px-6 py-4">
                      <div>From: {new Date(event.start_date).toLocaleDateString()}</div>
                      <div>To: {new Date(event.end_date).toLocaleDateString()}</div>
                      <div>Time: {event.start_time} - {event.end_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.cost}</td>
                    <td className="px-6 py-4">
                      <div className="max-h-40 overflow-y-auto prose prose-sm">
                        {event.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {event.image && (
                        <img 
                          src={`data:image/jpeg;base64,${event.image}`}
                          alt={event.title}
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No events found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;