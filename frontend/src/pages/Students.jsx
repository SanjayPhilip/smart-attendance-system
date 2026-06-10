import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserPlus, Trash2, User } from 'lucide-react'

const API = 'https://industrious-heart-production-5a4e.up.railway.app'

export default function Students() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ name: '', roll_number: '', image_path: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchStudents = () => {
    axios.get(`${API}/students`).then(r => setStudents(r.data)).catch(() => {})
  }

  useEffect(() => { fetchStudents() }, [])

  const handleAdd = async () => {
    if (!form.name || !form.roll_number || !form.image_path) {
      setMessage({ type: 'error', text: 'All fields are required.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await axios.post(`${API}/students`, form)
      setMessage({ type: 'success', text: `${form.name} added successfully!` })
      setForm({ name: '', roll_number: '', image_path: '' })
      fetchStudents()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to add student.' })
    }
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    await axios.delete(`${API}/students/${id}`)
    fetchStudents()
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Students</h2>
      <p className="text-gray-500 mb-6 text-sm">Register students and link their reference photos</p>

      {/* Add Student Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-indigo-600" /> Add New Student
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <input
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Roll Number"
            value={form.roll_number}
            onChange={e => setForm({ ...form, roll_number: e.target.value })}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Image path (e.g. dataset/john.jpg)"
            value={form.image_path}
            onChange={e => setForm({ ...form, image_path: e.target.value })}
          />
        </div>
        {message && (
          <p className={`text-sm mb-3 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register Student'}
        </button>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Roll No.</th>
              <th className="px-5 py-3">Image Path</th>
              <th className="px-5 py-3">Registered</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-10">No students registered yet.</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 flex items-center gap-2">
                  <User size={16} className="text-indigo-400" /> {s.name}
                </td>
                <td className="px-5 py-3 font-mono text-gray-600">{s.roll_number}</td>
                <td className="px-5 py-3 text-gray-500 truncate max-w-xs">{s.image_path}</td>
                <td className="px-5 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
