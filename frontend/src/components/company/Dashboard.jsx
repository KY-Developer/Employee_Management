import { useEffect, useState } from 'react'
import { getCompanyDashboardStats } from '../../services/companyService'
import { Pie, Bar } from 'react-chartjs-2'
import { useSocket } from '../../context/SocketContext' // <-- import this

// chart.js imports (same as you already have)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const CompanyDashboard = () => {
  const { socket } = useSocket() // <-- use socket context
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🟡 Fetch stats
  const fetchStats = async () => {
    try {
      const data = await getCompanyDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:')
    } finally {
      setLoading(false)
    }
  }

  // 🟢 On mount and socket update
  useEffect(() => {
    fetchStats()

    if (socket) {
      // 🔥 Listen for admin updates
      socket.on('admin-updated-company', (data) => {
        fetchStats()
      })
    }

    return () => {
      if (socket) socket.off('admin-updated-company')
    }
  }, [socket])

  // ⏳ Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // ❌ If failed
  if (!stats) {
    return <div className="text-center py-10">Failed to load dashboard data</div>
  }

  // 📊 Chart configs (same as you have)
  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [stats.pendingTasks, stats.inProgressTasks, stats.completedTasks],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const investmentChartData = {
    labels: ['Investment', 'Profit'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [stats.investment || 0, stats.profit || 0],
        backgroundColor: ['rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'],
        borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 15 },
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Investment & Profit Overview',
      },
    },
  }

  return (
    <div className="space-y-8 p-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Task Status Distribution
          </h3>
          <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]">
            <Pie data={taskStatusData} options={pieChartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Investment & Profit Overview
          </h3>
          <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px]">
            <Bar data={investmentChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard

