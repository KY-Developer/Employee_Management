import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTaskById, reviewTaskSubmission, deleteSingleSubmissionFile, deleteMultipleSubmissionFiles, deleteSubmissionMessage } from '../../services/taskService'
import StatusBadge from '../common/StatusBadge'
import PDFViewer from '../common/PDFViewer'
import { FiArrowLeft, FiEdit } from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const TaskDetails = () => {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [deleteAllLoading, setDeleteAllLoading] = useState({});
  const [deleteMessageLoading, setDeleteMessageLoading] = useState({});
  const { socket } = useSocket()

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await getTaskById(id)
        setTask(data)
      } catch (error) {
        console.error('Failed to fetch task:')
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [id])

  useEffect(() => {
  if (socket && task?._id) {
    const handleTaskUpdated = async (updatedTask) => {
      if (updatedTask.taskId === task._id) {
        const fresh = await getTaskById(updatedTask.taskId);
        setTask(fresh); // full update including submissions
      }
    };

    socket.on('task-updated', handleTaskUpdated);
    return () => {
      socket.off('task-updated', handleTaskUpdated);
    };
  }
}, [socket, task?._id]);


const handleDownloadAll = async () => {
  if (!task?.submissions || task.submissions.length === 0) {
    alert("No submissions found to download.");
    return;
  }

  setIsDownloading(true); // Start loading
  const zip = new JSZip();

  try {
    for (const [i, submission] of task.submissions.entries()) {
      if (!submission.files || submission.files.length === 0) continue;

      for (const file of submission.files) {
        const fileUrl = file.url;
        const fileName = fileUrl.split('/').pop() || `file_${i}`;

        try {
          const response = await fetch(fileUrl, { mode: 'cors' });
          if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}`);

          const blob = await response.blob();
          zip.file(`Submission_${i + 1}/${fileName}`, blob);
        } catch (fileError) {
          // console.error(`Error fetching ${fileUrl}:`, fileError);
        }
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'all_submissions.zip');
  } catch (err) {
    alert("Something went wrong while preparing the download.");
  } finally {
    setIsDownloading(false); // End loading
  }
};

const handleDownloadSingleSubmission = async (submission, index) => {
  if (!submission?.files || submission.files.length === 0) {
    alert("No files in this submission.");
    return;
  }
 setDownloadLoading(prev => ({ ...prev, [submission._id]: true }));
  const zip = new JSZip();
  try {
    for (const file of submission.files) {
      const fileUrl = file.url;
      const fileName = fileUrl.split('/').pop();

      const response = await fetch(fileUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}`);
      const blob = await response.blob();

      zip.file(fileName, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `submission_${index + 1}.zip`);
  } catch (error) {
    alert("Download failed for this submission.");
  } finally {
      setDownloadLoading(prev => ({ ...prev, [submission._id]: false }));
    }
};

const handleDeleteFile = async (taskId, submissionId, public_id) => {
   setDeleteLoading(prev => ({ ...prev, [public_id]: true }));
  try {
    await deleteSingleSubmissionFile(taskId, submissionId, public_id);
    const updated = await getTaskById(taskId);
    setTask(updated);
  } catch (err) {
    alert('Failed to delete file.');
  }finally {
      setDeleteLoading(prev => ({ ...prev, [public_id]: false }));
    }
};


const handleDeleteAllFiles = async (taskId, submissionId, publicIds) => {
  const confirmDelete = window.confirm('Delete all files in this submission?');
  if (!confirmDelete) return;
setDeleteAllLoading(prev => ({ ...prev, [submissionId]: true }));
  try {
    await deleteMultipleSubmissionFiles(taskId, submissionId, publicIds);
    const updated = await getTaskById(taskId);
    setTask(updated);
  } catch (err) {
    alert('Failed to delete files.');
  } finally {
      setDeleteAllLoading(prev => ({ ...prev, [submissionId]: false }));
    }
};

const handleDeleteMessage = async (taskId, submissionId) => {
  setDeleteMessageLoading(prev => ({ ...prev, [submissionId]: true }));
  try {
    await deleteSubmissionMessage(taskId, submissionId);
    const updated = await getTaskById(taskId);
    setTask(updated);
  } catch (err) {
    alert('Failed to delete message.');
  }finally {
      setDeleteMessageLoading(prev => ({ ...prev, [submissionId]: false }));
    }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!task) {
    return <div className="text-center py-10">Task not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/tasks" className="flex items-center text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="mr-1" />
          Back to Tasks
        </Link>
        <Link
          to={`/admin/tasks/edit/${task._id}`}
          className="flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiEdit className="mr-2" />
          Edit Task
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
        </div>
        <div className="px-4 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Submission Status</h4>
            <p className="text-sm text-gray-900">{task.submissionStatus || 'Not Submitted'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Title</h4>
            <p className="text-sm text-gray-900">{task.title}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <StatusBadge status={task.status} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
            <p className="text-sm text-gray-900">{task.company?.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Assigned By</h4>
            <p className="text-sm text-gray-900">{task.assignedBy?.name}</p>
          </div>
          <div className="sm:col-span-2">
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="text-sm text-gray-900 whitespace-pre-line">{task.description}</p>
          </div>
        </div>
      </div>

      {task.submissionStatus === 'Submitted' && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={async () => {
              await reviewTaskSubmission(task._id, 'Approved')
              const updated = await getTaskById(task._id)
              setTask(updated)
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={async () => {
              const reason = prompt('Enter reason for rejection (optional):')
              await reviewTaskSubmission(task._id, 'Rejected', reason)
              const updated = await getTaskById(task._id)
              setTask(updated)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}




      {task.submissions?.length > 0 ? (
  <div className="mt-6 bg-white shadow rounded-lg p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
      <h3 className="font-semibold text-lg">Submissions</h3>
      <button
        onClick={handleDownloadAll}
        disabled={isDownloading}
        className={`px-4 py-2 text-sm rounded transition duration-200 w-full sm:w-auto ${
          isDownloading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
        }`}
      >
        {isDownloading ? 'Downloading...' : 'Download All Files'}
      </button>
    </div>

    <ul className="space-y-4">
      {task.submissions.map((s, index) => (
        <li key={index} className="border p-4 rounded bg-gray-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
            <p className="text-sm text-gray-700">
              <span className="text-gray-900 font-semibold mr-2">#{index + 1}:</span>
              <span className="font-medium text-gray-900">Message:</span> {s.message || 'No message'}
            </p>
            <div className="flex flex-wrap gap-2">
              {s.message && (
                <button
                  onClick={() => handleDeleteMessage(task._id, s._id)}
                  disabled={deleteMessageLoading[s._id]}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  {deleteMessageLoading[s._id] ? '...' : 'Delete Message'}
                </button>
              )}
              {s.files?.length > 0 && (
                <button
                  onClick={() => handleDownloadSingleSubmission(s, index)}
                  disabled={downloadLoading[s._id]}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {downloadLoading[s._id] ? '...' : 'Download Files'}
                </button>
              )}
              {s.files?.length > 1 && (
                <button
                  onClick={() =>
                    handleDeleteAllFiles(task._id, s._id, s.files.map(f => f.public_id))
                  }
                  disabled={deleteAllLoading[s._id]}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  {deleteAllLoading[s._id] ? '...' : 'Delete All Files'}
                </button>
              )}
            </div>
          </div>

          {s.files?.length > 0 && (
            <div>
              <p className="font-medium text-sm text-gray-800 mb-1">Files:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                {s.files.map((file, fileIdx) => (
                  <li key={fileIdx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline break-all"
                    >
                      {`${fileIdx + 1}. ${file.url.split('/').pop()}`}
                    </a>
                    <button
                      onClick={() => handleDeleteFile(task._id, s._id, file.public_id)}
                      disabled={deleteLoading[file.public_id]}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded w-full sm:w-auto"
                    >
                      {deleteLoading[file.public_id] ? '...' : 'Delete'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Submitted at: {new Date(s.submittedAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  </div>
) : (
  <div className="mt-6 text-gray-600 text-sm bg-yellow-50 border border-yellow-200 p-4 rounded">
    No submissions yet.
  </div>
)}


      {pdfViewerOpen && (
        <PDFViewer
          url={task.finalPdf?.url || task.pdfFile?.url}
          onClose={() => setPdfViewerOpen(false)}
        />
      )}



    </div>
  )
}

export default TaskDetails





















