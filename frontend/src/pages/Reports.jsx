import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FileText, RefreshCw } from 'lucide-react'

const API = 'https://industrious-heart-production-5a4e.up.railway.app'

export default function Reports() {
  const [report, setReport] = useState([])
  const [attendance, setAttendance] = useState([])
  const [filterDate, setFilterDate] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchReport = () => {
    axios.get(`${API}/attendance/report`).then(r => setReport(r.data)).catch(() => {})
  }

  const fetchAttendance = () => {
    setLoading(true)
    const params = filterDate ? `?date=${filterDate}` : ''
    axios.get(`${API}/attendance${params}`)
      .then(r => setAttendance(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReport()
    fetchAttendance()
  }, [])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Reports</h2>
      <p className="text-gray-500 mb-6 text-sm">View attendance records and student summaries</p>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" /> Student Summary
        </h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Roll No.</th>
              <th className="px-4 py-2">Total Present</th>
            </tr>
          </thead>
          <tbody>
            {report.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">No data yet.</td></tr>
            ) : report.map(row => (
              <tr key={row.student.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{row.student.name}</td>
                <td className="px-4 py-2 font-mono text-gray-500">{row.student.roll_number}</td>
                <td className="px-4 py-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {row.total_present} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance Log */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            Attendance Log
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={fetchAttendance}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Roll No.</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Marked At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">Loading…</td></tr>
            ) : attendance.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">No attendance records found.</td></tr>
            ) : attendance.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{a.student_name}</td>
                <td className="px-4 py-2 font-mono text-gray-500">{a.roll_number}</td>
                <td className="px-4 py-2">{a.date}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    a.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {new Date(a.marked_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
