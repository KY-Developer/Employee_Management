import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTaskById, updateTask } from '../../services/taskService'
import TaskForm from '../common/TaskForm'
import { toast } from 'react-toastify'

const EditTask = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTaskById(id)
        setTask(data)
      } catch (error) {
        toast.error('Failed to load task')
        navigate('/admin/tasks')
      }
    }
    fetchTask()
  }, [id, navigate])

  const handleSubmit = async (taskData) => {
    setIsSubmitting(true)
    setError('')

    try {
      await updateTask(id, taskData)
      toast.success('Task updated successfully!')
      navigate('/admin/tasks')
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update task'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Task</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <TaskForm 
        initialData={task} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  )
}

export default EditTask
