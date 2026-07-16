import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { getCompanies } from '../../services/adminService'

const TaskForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    taskList: initialData.taskList || [{ title: '', completed: false }],
    pdfFile: null,
    companyId: initialData.company?._id || '',
  })

  const [pdfPreview, setPdfPreview] = useState(initialData.pdfFile?.url || null)
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies()
        setCompanies(data)
      } catch (error) {
        console.error('Failed to fetch companies:')
      }
    }

    fetchCompanies()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubtaskChange = (index, e) => {
    const newTaskList = [...formData.taskList]
    newTaskList[index].title = e.target.value
    setFormData({ ...formData, taskList: newTaskList })
  }

  const addSubtask = () => {
    setFormData({
      ...formData,
      taskList: [...formData.taskList, { title: '', completed: false }],
    })
  }

  const removeSubtask = (index) => {
    const newTaskList = formData.taskList.filter((_, i) => i !== index)
    setFormData({ ...formData, taskList: newTaskList })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, pdfFile: file })
      setPdfPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">
          {initialData?._id ? 'Edit Task' : 'Create Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtasks</label>
            <div className="space-y-3">
              {formData.taskList.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskChange(index, e)}
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Subtask ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <FiPlus size={16} className="mr-1" />
                Add Subtask
              </button>
            </div>
          </div>

          {/* Company Select */}
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Company
            </label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
            <div className="flex items-center space-x-3">
              <label
                htmlFor="pdf"
                className="inline-flex items-center px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-100 cursor-pointer"
              >
                <FiUpload className="mr-2" />
                {formData.pdfFile ? formData.pdfFile.name : 'Upload PDF'}
              </label>
              <input
                id="pdf"
                name="pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {pdfPreview && (
                <a
                  href={pdfPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : initialData?._id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
