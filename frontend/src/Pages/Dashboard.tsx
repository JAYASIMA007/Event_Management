import type React from "react"
import { useEffect, useState } from "react"
import { CalendarDays, Clock, MapPin, Info, Plus, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import cup from "../images/Framer13.svg"

interface Event {
  _id: string
  title: string
  venue: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  cost_type?: string // Made optional since it can be undefined
  cost?: number // Added cost field
  description?: string
  image?: string
}

const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const role = localStorage.getItem("role")

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Unauthorized: Please login.")
          navigate("/login")
          return
        }

        const res = await fetch("https://event-management-mmle.onrender.com/api/get-events/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.detail || "Failed to fetch events.")
        }

        const data = await res.json()
        setEvents(data.events || [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch events.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/admin-login")
  }

  const handleCreateEvent = () => {
    navigate("/create-event")
  }

  // Helper function to safely get cost type
  const getCostType = (event: Event) => {
    if (event.cost_type) {
      return event.cost_type.toLowerCase() === "free" ? "FREE" : event.cost_type.toUpperCase()
    }
    // Fallback: check if cost exists and is 0
    if (event.cost !== undefined) {
      return event.cost === 0 ? "FREE" : "PAID"
    }
    return "PAID" // Default fallback
  }

  // Helper function to get cost type styling
  const getCostTypeStyle = (event: Event) => {
    const costType = getCostType(event)
    return costType === "FREE" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Event <span className="text-purple-600">Hive</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {role === "admin" && (
                <button
                  onClick={handleCreateEvent}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </button>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8 lg:p-10">
        {/* Hero Section */}
        <div className="mx-auto max-w-6xl mb-10 relative bg-[#6A0DAD] rounded-lg overflow-hidden shadow-lg h-[350px] flex items-center p-8">
          <img
            src={cup}
            alt="Event illustration"
            className="absolute inset-0 w-full h-full object-cover object-right-bottom opacity-80"
          />

            </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto max-w-6xl mb-6 p-4 rounded-lg border border-red-400 bg-red-50 text-red-700 flex items-start gap-2">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Error</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Listed Events Section */}
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Listed Events</h2>
            <span className="text-gray-600">{events.length} Events</span>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="relative w-full h-40 bg-gray-200 rounded-t-lg">
                    <div className="absolute top-2 left-2 bg-gray-300 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full w-12 h-6" />
                  </div>
                  <div className="p-4 pb-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="p-4 pt-0 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {events.length === 0 && !error ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No events found.</p>
                  {role === "admin" && (
                    <button
                      onClick={handleCreateEvent}
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="relative w-full h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                        {event.image ? (
                          <img
                            src={
                              event.image.startsWith("data:image")
                                ? event.image
                                : `data:image/jpeg;base64,${event.image}`
                            }
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}
                        <span
                          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${getCostTypeStyle(event)}`}
                        >
                          {getCostType(event)}
                        </span>
                      </div>
                      <div className="p-4 pb-2">
                        <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">{event.title}</h3>
                        <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {event.venue}
                        </p>
                      </div>
                      <div className="flex-grow p-4 pt-0 space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          <span>
                            {event.start_date} - {event.end_date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {event.start_time} - {event.end_time}
                          </span>
                        </div>
                        {event.description && <p className="text-gray-700 mt-2 line-clamp-3">{event.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
