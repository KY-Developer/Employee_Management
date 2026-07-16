import { useState } from 'react';
import { FiX, FiFileText, FiUpload } from 'react-icons/fi';
import axios from '../../axios';
import { toast } from 'react-toastify';

const TaskDetailModal = ({ task, onClose, onStatusChange, openPdf, refreshTasks }) => {
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadTime, setUploadTime] = useState(null);

  const [subtaskStatuses, setSubtaskStatuses] = useState(
    task.taskList?.map((sub) => ({ ...sub })) || []
  );

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const existingFileNames = submissionFiles.map((file) => file.name);
    const uniqueNewFiles = [];
    let duplicateFound = false;

    for (const file of newFiles) {
      if (existingFileNames.includes(file.name)) {
        duplicateFound = true;
      } else {
        uniqueNewFiles.push(file);
      }
    }

    if (duplicateFound) {
      toast.warning('One or more selected files already exist in your upload list.');
    }

    if (submissionFiles.length + uniqueNewFiles.length > 200) {
      toast.error('You can upload a maximum of 200 files');
      return;
    }

    setSubmissionFiles((prev) => [...prev, ...uniqueNewFiles]);
  };

  const handleRemoveFile = (index) => {
    setSubmissionFiles((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmission = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  // Validate required fields
  if (!submissionMessage.trim()) {
    toast.warning('Submission message is required');
    return;
  }

  if (submissionFiles.length === 0) {
    toast.warning('At least one file is required');
    return;
  }

  setIsSubmitting(true);
  setUploadTime(null);
  const start = Date.now();

  const formData = new FormData();
  formData.append('message', submissionMessage);
  submissionFiles.forEach((file) => formData.append('files', file));

  try {
    await axios.post(`/api/tasks/${task._id}/submit`, formData);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    setUploadTime(elapsed);
    toast.success(`Task submitted successfully in ${elapsed}s`);

    setSubmissionMessage('');
    setSubmissionFiles([]);
    refreshTasks?.();
    onClose();
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to submit task');
  } finally {
    setIsSubmitting(false);
  }
};


  const handleSubtaskToggle = async (subtaskId, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      const updatedList = subtaskStatuses.map((s) =>
        s._id === subtaskId ? { ...s, completed: updatedStatus } : s
      );
      setSubtaskStatuses(updatedList);

      await axios.put(
        `/api/company/tasks/${task._id}/subtasks/${subtaskId}`,
        { completed: updatedStatus }
      );

      toast.success('Subtask updated');
      refreshTasks?.();
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Task Details</h2>

        <div className="space-y-3 mb-6">
          <div>
            <label className="font-semibold">Title:</label>
            <div>{task.title}</div>
          </div>

          <div>
            <label className="font-semibold">Description:</label>
            <div className="text-gray-700">{task.description}</div>
          </div>

          <div>
            <label className="font-semibold">Assigned By:</label>
            <div>
              {task.assignedBy?.name} ({task.assignedBy?.email})
            </div>
          </div>

          {subtaskStatuses?.length > 0 && (
            <div>
              <label className="font-semibold">Subtasks:</label>
              <ul className="pl-5 text-sm text-gray-700 space-y-2">
                {subtaskStatuses.map((sub) => (
                  <li key={sub._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleSubtaskToggle(sub._id, sub.completed)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className={sub.completed ? 'line-through text-green-600' : ''}>
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.pdfFile?.url && (
            <button
              onClick={() => openPdf(task.pdfFile.url)}
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiFileText className="mr-1" />
              View PDF
            </button>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold text-lg mb-2">Submit Task</h3>
          <form onSubmit={handleSubmission} className="space-y-3">
            <textarea
              value={submissionMessage}
              onChange={(e) => setSubmissionMessage(e.target.value)}
              placeholder="Write a message..."
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            />

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="block border border-gray-300 rounded px-3 py-2 w-full text-sm"
            />

            {submissionFiles.length > 0 && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {submissionFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-red-600 hover:text-red-800 text-xs"
                      disabled={isSubmitting}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Uploading...' : (
                <>
                  <FiUpload className="inline mr-2" />
                  Send Submission
                </>
              )}
            </button>

            {uploadTime && (
              <p className="text-sm text-green-600">Upload completed in {uploadTime}s</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;



