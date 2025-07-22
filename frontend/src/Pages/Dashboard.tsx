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
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/get-events/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data.events);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert('Failed to fetch events: ' + (error.response?.data?.error || error.message));
      } else if (error instanceof Error) {
        alert('Failed to fetch events: ' + error.message);
      } else {
        alert('Failed to fetch events: An unknown error occurred.');
      }
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

  // ...existing code...

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard - {role === 'admin' ? 'Admin' : 'User'}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {role === 'admin' && (
        <button
          onClick={() => navigate('/create-event')}
          className="mb-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Create Event
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Title</th>
              <th className="border p-2">Venue</th>
              <th className="border p-2">Start Date</th>
              <th className="border p-2">End Date</th>
              <th className="border p-2">Cost (INR)</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Image</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="border p-2">{event.title}</td>
                <td className="border p-2">{event.venue}</td>
                <td className="border p-2">{event.start_date}</td>
                <td className="border p-2">{event.end_date}</td>
                <td className="border p-2">{event.cost}</td>
                <td className="border p-2">{event.description}</td>
                <td className="border p-2">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-16 h-16 object-cover" />
                  ) : (
                    "No Image"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && <p className="text-center mt-4">No events found.</p>}
    </div>
  );
};

export default Dashboard;