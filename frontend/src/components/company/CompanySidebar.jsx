import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiFileText,
  FiPieChart,
  FiMenu,
  FiX,
  FiUsers,
  FiTrendingUp
} from 'react-icons/fi';

const navItems = [
  { to: '/company/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/company/tasks', icon: FiFileText, label: 'Tasks' },
  { to: '/company/investment', icon: FiTrendingUp, label: 'Investment' },
  { to: '/company/profile', icon: FiUsers, label: 'Profile' },
  // { to: '/company/reports', icon: FiPieChart, label: 'Reports' },
];

const CompanySidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleDesktopSidebar = () => setDesktopCollapsed((prev) => !prev);
  const isActiveLink = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">Task Manager</h1>
        <button onClick={toggleSidebar} className="text-gray-700">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        } md:hidden`}
        onClick={closeSidebar}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out shadow-lg md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-700">Navigation</h2>
          <button onClick={closeSidebar} className="text-gray-600">
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm ${
                  isActive || isActiveLink(to)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon
                className={`h-5 w-5 ${
                  isActiveLink(to) ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r shadow-sm transition-all duration-300 z-40 fixed inset-y-0 ${
          desktopCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2
            className={`text-xl font-bold text-gray-700 transition-opacity duration-300 ${
              desktopCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            Task Manager
          </h2>
          <button onClick={toggleDesktopSidebar} className="text-gray-600">
            <FiX size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center ${
                  desktopCollapsed ? 'justify-center' : 'gap-3'
                } px-3 py-2 rounded-md font-medium text-sm transition ${
                  isActive || isActiveLink(to)
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon
                className={`h-5 w-5 ${
                  isActiveLink(to) ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              {!desktopCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default CompanySidebar;

