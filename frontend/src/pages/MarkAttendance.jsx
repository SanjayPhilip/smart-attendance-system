import React, { useState } from 'react'
import axios from 'axios'
import { Camera, Upload, CheckCircle, XCircle } from 'lucide-react'

const API = 'https://industrious-heart-production-5a4e.up.railway.app'

export default function MarkAttendance() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
  }

  const handleSubmit = async () => {
    if (!file) { setError('Please select a photo first.'); return }
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('date', date)

    try {
      const res = await axios.post(`${API}/attendance/mark`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to process photo.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Mark Attendance</h2>
      <p className="text-gray-500 mb-6 text-sm">Upload a class photo to automatically mark attendance</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Panel */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Upload size={18} className="text-indigo-600" /> Upload Photo
          </h3>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors mb-4">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <>
                <Camera size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Click to select a class photo</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Attendance Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-3 flex items-center gap-1">
              <XCircle size={14} /> {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Processing…' : 'Mark Attendance'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" /> Results
          </h3>

          {result ? (
            <>
              {result.annotated_image && (
                <img
                  src={`data:image/jpeg;base64,${result.annotated_image}`}
                  alt="Annotated"
                  className="w-full rounded-lg mb-4 object-contain max-h-48"
                />
              )}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{result.total_detected}</p>
                  <p className="text-xs text-indigo-500">Faces Detected</p>
                </div>
                <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.total_marked}</p>
                  <p className="text-xs text-green-500">Marked Present</p>
                </div>
              </div>
              <div className="space-y-2">
                {result.marked.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.roll_number}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Present</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">
              Upload and process a photo to see results here.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
