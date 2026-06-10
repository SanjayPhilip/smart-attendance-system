import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Camera, FileText } from 'lucide-react'

import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import MarkAttendance from './pages/MarkAttendance'
import Reports from './pages/Reports'

const navItems = [
  { to: '/',           label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/students',   label: 'Students',         icon: Users           },
  { to: '/attendance', label: 'Mark Attendance',  icon: Camera          },
  { to: '/reports',    label: 'Reports',          icon: FileText        },
]

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 bg-indigo-900 text-white flex flex-col">
          <div className="p-5 border-b border-indigo-700">
            <h1 className="text-xl font-bold tracking-wide">🎓 AttendEase</h1>
            <p className="text-indigo-300 text-xs mt-1">Smart Attendance System</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-indigo-700 text-indigo-400 text-xs">
            Backend: localhost:5000
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/students"   element={<Students />} />
            <Route path="/attendance" element={<MarkAttendance />} />
            <Route path="/reports"    element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
