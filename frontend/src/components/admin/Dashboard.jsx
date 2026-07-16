import { useEffect, useState } from 'react'
import { getDashboardStats } from '../../services/adminService'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-10">Failed to load dashboard data</div>
  }

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

  const safeInvestmentData = Array.isArray(stats.investmentData)
    ? stats.investmentData
    : []

  const investmentData = {
    labels: safeInvestmentData.map((item) => item.name),
    datasets: [
      {
        label: 'Investment',
        data: safeInvestmentData.map((item) => item.investment),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Profit',
        data: safeInvestmentData.map((item) => item.profit),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: 'Total Companies', value: stats.totalCompanies },
          { title: 'Total Tasks', value: stats.totalTasks },
          { title: 'Pending Tasks', value: stats.pendingTasks },
          { title: 'Completed Tasks', value: stats.completedTasks },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center"
          >
            <h3 className="text-sm sm:text-base font-medium text-gray-500">
              {item.title}
            </h3>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
    Task Status Distribution
  </h3>
  <div className="h-64 w-full flex justify-center items-center">
    <div className="max-w-[250px] w-full">
      <Pie data={taskStatusData} />
    </div>
  </div>
</div>


        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4">
    Investment & Profit by Company
  </h3>

  {/* Horizontal scroll wrapper */}
  <div className="w-full overflow-x-auto">
    {/* Minimum width ensures scrollable content on smaller screens */}
    <div className="min-w-[800px] h-64">
      <Bar
        data={investmentData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        }}
      />
    </div>
  </div>
</div>

      </div>
    </div>
  )
}

export default AdminDashboard
