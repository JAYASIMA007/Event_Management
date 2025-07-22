import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Event = {
  id: number;
  title: string;
  venue: string;
  start_date: string;
  end_date: string;
  cost: number;
  description: string;
  image?: string;
};

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/get-events/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data.events);
      console.log('Events data:', response.data); // Debug log
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert('Failed to fetch events: ' + (error.response?.data?.error || error.message));
      } else if (error instanceof Error) {
        alert('Failed to fetch events: ' + error.message);
      } else {
        alert('Failed to fetch events: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEvents();
  }, [navigate, token, fetchEvents]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard - {role === 'admin' ? 'Admin' : 'User'}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>

      {role === 'admin' && (
        <button
          onClick={() => navigate('/create-event')}
          className="mb-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Create Event
        </button>
      )}

      {loading ? (
        <div className="text-center py-4">Loading events...</div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-3 text-left">Title</th>
                <th className="border p-3 text-left">Venue</th>
                <th className="border p-3 text-left">Start Date</th>
                <th className="border p-3 text-left">End Date</th>
                <th className="border p-3 text-left">Cost (INR)</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Image</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="border p-3">{event.title}</td>
                  <td className="border p-3">{event.venue}</td>
                  <td className="border p-3">{formatDate(event.start_date)}</td>
                  <td className="border p-3">{formatDate(event.end_date)}</td>
                  <td className="border p-3">₹{event.cost.toLocaleString()}</td>
                  <td className="border p-3">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      {event.description}
                    </div>
                  </td>
                  <td className="border p-3">
                    {event.image ? (
                      <img
                        src={`data:image/jpeg;base64,${event.image}`}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded-md shadow-sm"
                        onError={(e) => {
                          console.error('Image loading error for:', event.title);
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm">
                        No Image
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="text-center py-8 bg-white">
              <p className="text-gray-500">No events found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;