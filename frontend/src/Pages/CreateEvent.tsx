import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Upload, Calendar, Clock, MapPin, DollarSign, FileText, ImageIcon } from "lucide-react"

const CreateEvent = () => {
  const [title, setTitle] = useState("")
  const [venue, setVenue] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [cost, setCost] = useState("")
  const [description,] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [generateDescription, setGenerateDescription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("venue", venue)
    formData.append("start_time", startTime)
    formData.append("end_time", endTime)
    formData.append("start_date", startDate)
    formData.append("end_date", endDate)
    formData.append("cost", cost)
    formData.append("description", description)

    if (image) {
      formData.append("image", image)
    }
    formData.append("generate_description", generateDescription.toString())

    try {
      await axios.post("https://event-management-mmle.onrender.com/api/create-event/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      alert("Event created successfully!")
      navigate("/dashboard")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert("Failed to create event: " + (error.response?.data?.error || error.message))
      } else if (error instanceof Error) {
        alert("Failed to create event: " + error.message)
      } else {
        alert("Failed to create event: An unknown error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event <span className="text-purple-600">Hive</span>
          </h1>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Create Event</h2>

          <form onSubmit={handleCreateEvent} className="space-y-8">
            {/* Basic Event Information */}
            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your event title"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Event Venue */}
              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Venue
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="venue"
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter venue address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Cost (INR)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Enter the cost of the event in INR"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Event Description Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-gray-900">Event Description</h3>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    dragActive
                      ? "border-purple-500 bg-purple-50"
                      : image
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-purple-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 text-gray-400">
                      {image ? (
                        <ImageIcon className="w-full h-full text-green-500" />
                      ) : (
                        <Upload className="w-full h-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">{image ? image.name : "Upload Here"}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {image ? "Click to change image" : "Drag and drop your image here, or click to browse"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Description Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  id="generateDescription"
                  type="checkbox"
                  checked={generateDescription}
                  onChange={(e) => setGenerateDescription(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="generateDescription" className="text-sm font-medium text-gray-700">
                  Generate description automatically using AI
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Event..." : "Create event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent
