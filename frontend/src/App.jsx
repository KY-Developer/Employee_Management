import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import AdminLayout from './pages/AdminLayout'
import CompanyLayout from './pages/CompanyLayout'
import ProtectedRoute from './pages/ProtectedRoute'
import AdminLogin from './components/auth/AdminLogin'
import AdminRegister from './components/auth/AdminRegister'
import CompanyLogin from './components/auth/CompanyLogin'
import NotFound from './pages/NotFound'
import AdminDashboard from './components/admin/Dashboard'
import Companies from './components/admin/Companies'
import CreateCompany from './components/admin/CreateCompany'
import EditCompany from './components/admin/EditCompany'
import Tasks from './components/admin/Tasks'
import CreateTask from './components/admin/CreateTask'
import EditTask from './components/admin/EditTask'
import TaskDetails from './components/admin/TaskDetails'
import CompanyDashboard from './components/company/Dashboard'
import CompanyTasks from './components/company/Tasks'
import CompanyProfile from './components/company/Profile'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext'
import AdminProfile from './components/admin/AdminProfile'
import Reports from './components/admin/Reports'
import TaskListExcel from './components/admin/TaskListExcel'
import TasksFilter from './components/admin/TaksFilter'
import Investment from './components/company/Investment'

const RedirectIfLoggedIn = ({ children }) => {
  const { user } = useAuth()

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user?.role === 'company') return <Navigate to="/company/dashboard" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Default route now redirects to /admin/login */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Auth Pages - Only if not logged in */}
            <Route
              path="/admin/login"
              element={
                <RedirectIfLoggedIn>
                  <AdminLogin />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path="/admin/register"
              element={
                <RedirectIfLoggedIn>
                  <AdminRegister />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path="/company/login"
              element={
                <RedirectIfLoggedIn>
                  <CompanyLogin />
                </RedirectIfLoggedIn>
              }
            />

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/create" element={<CreateCompany />} />
                <Route path="companies/edit/:id" element={<EditCompany />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/create" element={<CreateTask />} />
                <Route path="tasks/edit/:id" element={<EditTask />} />
                <Route path="tasks/:id" element={<TaskDetails />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="reports" element={<Reports />} />
                {/* <Route path="tasklist" element={<TaskListExcel />} /> */}
                <Route path="task-list-excel/:companyId" element={<TasksFilter />} />

              </Route>
            </Route>

            {/* Company Protected Routes */}
            <Route element={<ProtectedRoute role="company" />}>
              <Route path="/company" element={<CompanyLayout />}>
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="tasks" element={<CompanyTasks />} />
                <Route path="investment" element={<Investment />} />
                <Route path="profile" element={<CompanyProfile />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
