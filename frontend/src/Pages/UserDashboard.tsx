"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Calendar, Clock, Filter, ChevronDown, Linkedin, Instagram, Facebook } from "lucide-react"
import axios from "axios"
import audience from "../images/Group 139.svg"

interface Event {
  id: string
  title: string
  venue: string
  start_date: string
  end_date: string
  cost: string
  description: string
  image: string
  start_time: string
  end_time: string
  created_by: string
}

const UserDashboard = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/user-login")
          return
        }
        const response = await axios.get("http://localhost:8000/api/get-events/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setEvents(response.data.events)
        console.log("Response:", response.data)
        console.log("Events:", response.data.events)
      } catch (error) {
        console.error("Error fetching events:", error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate("/user-login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = location === "" || event.venue.toLowerCase().includes(location.toLowerCase())
    return matchesSearch && matchesLocation
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Event <span className="text-purple-600">Hive</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${audience})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-64">MADE FOR THOSE WHO DO</h2>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-purple-400 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">Looking For</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-purple-300 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location..."
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-purple-300 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">When</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg transition-colors duration-200 flex items-center">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Upcoming <span className="text-purple-600">Events</span>
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>Category</option>
                <option>Music</option>
                <option>Sports</option>
                <option>Education</option>
              </select>
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Sort by</option>
              <option>Date</option>
              <option>Price</option>
              <option>Popularity</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All regions</option>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative">
                    {event.image ? (
                      <img
                        src={`data:image/jpeg;base64,${event.image}`}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = audience
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">LIVE</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {formatDate(event.start_date)} - {formatDate(event.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {event.start_time} - {event.end_time}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 font-semibold">₹{event.cost}</span>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                Load more
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#10107B] text-white py-12 px-4 md:px-8 rounded-t-xl">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-baseline gap-1 mb-8">
          <h2 className="text-3xl font-bold">Event</h2>
          <span className="text-3xl font-bold text-purple-400">Hive</span>
        </div>
        {/* Email Subscription */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-md">
          <input
            type="email"
            placeholder="Enter your mail"
            className="flex-grow p-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors shadow-md">
            Subscribe
          </button>
        </div>
        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 text-lg font-medium">
          <a href="#" className="hover:text-purple-400 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            About
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            Services
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            Get in touch
          </a>
          <a href="#" className="hover:text-purple-400 transition-colors">
            FAQs
          </a>
        </nav>
        {/* Separator Line */}
        <hr className="border-t border-purple-700 w-full max-w-4xl mb-8" />
        {/* Bottom Section: Language, Social, Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-4xl gap-6">
          {/* Language Selection */}
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors">
              English
            </button>
            <button className="px-4 py-2 text-gray-300 rounded-full text-sm font-semibold hover:text-purple-400 transition-colors">
              French
            </button>
            <button className="px-4 py-2 text-gray-300 rounded-full text-sm font-semibold hover:text-purple-400 transition-colors">
              Hindi
            </button>
          </div>
          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a href="#" aria-label="LinkedIn" className="text-gray-300 hover:text-purple-400 transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-purple-400 transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-purple-400 transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
          </div>
          {/* Copyright */}
        </div>
      </div>
    </footer>
  )
}

export default UserDashboard
