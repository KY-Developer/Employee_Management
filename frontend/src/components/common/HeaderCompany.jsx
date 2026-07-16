

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiFileText,
  FiPieChart,
  FiUserPlus,
  FiTrendingUp
} from 'react-icons/fi'

const navItems = [
  { to: '/company/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/company/tasks', icon: FiFileText, label: 'Tasks' },
  { to: '/company/investment', icon: FiTrendingUp, label: 'Investment' },
  { to: '/company/profile', icon: FiUserPlus, label: 'Profile' },
  // { to: '/company/reports', icon: FiPieChart, label: 'Reports' },
]

const HeaderCompany = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="bg-white shadow-sm z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-4">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary-600">
            Task Manager
          </Link>

          {/* Desktop User Area */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <NotificationBell />
                <button
                  onClick={logout}
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {user.name} ({user.role})
                </span>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-600" onClick={toggleMenu}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Dropdown */}
        {menuOpen && user && (
          <div className="md:hidden flex flex-col gap-3 pb-4 border-t pt-4">
            {/* Sidebar Nav Links */}
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 text-gray-500" />
                {label}
              </NavLink>
            ))}

            <hr className="my-2" />

            {/* User Actions */}
            <NotificationBell />
            <button
              onClick={() => {
                logout()
                closeMenu()
              }}
              className="flex items-center text-gray-600 hover:text-primary-600"
            >
              <FiLogOut className="mr-1" />
              Logout
            </button>
            <span className="text-sm font-medium text-gray-700">
              {user.name} ({user.role})
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

export default HeaderCompany

