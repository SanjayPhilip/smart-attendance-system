import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, CheckCircle, CalendarDays, TrendingUp } from 'lucide-react'

const API = 'https://industrious-heart-production-5a4e.up.railway.app'
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${API}/dashboard/stats`)
      .then(r => setStats(r.data))
      .catch(() => setError('Could not connect to backend. Is app.py running on port 5000?'))
  }, [])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
      <p className="text-gray-500 mb-6 text-sm">Overview of your attendance system</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={Users}       label="Total Students"   value={stats?.total_students}  color="bg-indigo-500" />
        <StatCard icon={CheckCircle} label="Present Today"    value={stats?.present_today}   color="bg-green-500"  />
        <StatCard icon={CalendarDays}label="Total Sessions"   value={stats?.total_sessions}  color="bg-amber-500"  />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-gray-700">Getting Started</h3>
        </div>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
          <li>Go to <strong>Students</strong> and register students with their photo paths.</li>
          <li>Go to <strong>Mark Attendance</strong>, upload a class photo and pick a date.</li>
          <li>View results in <strong>Reports</strong>.</li>
        </ol>
      </div>
    </div>
  )
}
