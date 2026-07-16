import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTask } from '../../services/taskService'
import TaskForm from '../common/TaskForm'
import { toast } from 'react-toastify'

const CreateTask = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (taskData) => {
    setIsSubmitting(true)
    setError('')

    try {
      await createTask(taskData)
      toast.success('Task created successfully!')
      navigate('/admin/tasks')
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create task'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <TaskForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  )
}

export default CreateTask
