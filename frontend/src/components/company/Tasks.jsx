import { useState, useEffect } from 'react'
import { getCompanyTasks, updateTaskStatus } from '../../services/companyService'
import { FiEye, FiUpload } from 'react-icons/fi'
import PDFViewer from '../common/PDFViewer'
import UploadFinalPdfModal from './UploadFinalPdfModal'
import TaskDetailModal from './TaskDetailModal'
import { useSocket } from '../../context/SocketContext'

const CompanyTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const { socket } = useSocket()

  const fetchTasks = async () => {
    try {
      const data = await getCompanyTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch tasks:')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

useEffect(() => {
  if (socket) {
    const handleTaskUpdate = ({ taskId, submissionStatus, status }) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, submissionStatus, status }
            : task
        )
      );
    };

    const handleNewNotification = (notification) => {
      // You can optionally show a toast or fetch tasks again
      fetchTasks(); // ⬅️ ensure this fetches newly created tasks
    };

    socket.on('task-updated', handleTaskUpdate);
    socket.on('new-notification', handleNewNotification); // ⬅️ ADD THIS

    return () => {
      socket.off('task-updated', handleTaskUpdate);
      socket.off('new-notification', handleNewNotification); // ⬅️ CLEANUP
    };
  }
}, [socket]);


  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error('Failed to update task status:')
    }
  }

  const openPdfViewer = (pdfUrl) => {
    setSelectedPdf(pdfUrl)
    setPdfViewerOpen(true)
  }

  const openUploadModal = (task) => {
    setSelectedTask(task)
    setShowUploadModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedTaskDetail && (
        <TaskDetailModal
          task={selectedTaskDetail}
          onClose={() => setSelectedTaskDetail(null)}
          onStatusChange={handleStatusChange}
          openPdf={(url) => {
            setSelectedTaskDetail(null)
            openPdfViewer(url)
          }}
          refreshTasks={fetchTasks}
        />
      )}
      <h2 className="text-2xl font-bold text-gray-800">Assigned Tasks</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                    No tasks assigned
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{task.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`block w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 sm:text-sm transition-colors ${
                          task.status === 'Pending' ? 'bg-yellow-50 text-yellow-800' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-800' :
                          'bg-green-50 text-green-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.submissionStatus || 'Not Submitted'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-4">
                        <button
                          onClick={() => setSelectedTaskDetail(task)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Task Details"
                        >
                          <FiEye size={18} />
                        </button>

                        {task.status === 'In Progress' && (
                          <button
                            onClick={() => openUploadModal(task)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Upload Final PDF"
                          >
                            <FiUpload size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pdfViewerOpen && (
        <PDFViewer url={selectedPdf} onClose={() => setPdfViewerOpen(false)} />
      )}

      {showUploadModal && (
        <UploadFinalPdfModal
          task={selectedTask}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setTasks(tasks.map(t =>
              t._id === selectedTask._id ? { ...t, status: 'Completed' } : t
            ))
            setShowUploadModal(false)
          }}
        />
      )}
    </div>
  )
}

export default CompanyTasks
