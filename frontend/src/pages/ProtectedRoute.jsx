import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ role }) => {
  const { user } = useAuth()

  if (!user) return <Navigate to="/admin/login" replace />

  // Restrict access to other role's area
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'company') return <Navigate to="/company/dashboard" replace />
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
