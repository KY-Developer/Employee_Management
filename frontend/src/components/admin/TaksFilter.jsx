import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from '../../axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import ConfirmationModal from '../common/ConfirmationModal';

const TasksFilter = () => {
  const { companyId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');


  useEffect(() => {
const fetchTasks = async () => {
  try {
    const res = await axios.get(`/api/tasks/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    });
    const fetchedTasks = res.data.tasks || [];
    setTasks(fetchedTasks);
    if (fetchedTasks.length > 0) {
      setCompanyName(fetchedTasks[0].company?.name || '');
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

    if (companyId) fetchTasks();
  }, [companyId, user]);

  const exportToExcel = () => {
    const formattedData = tasks.map((task) => ({
      Title: task.title || '',
      Description: task.description || '',
      'Company Name': task.company?.name || '',
      'Company Email': task.company?.email || '',
      'Assigned By': task.assignedBy?.name || '',
      'Assigned Email': task.assignedBy?.email || '',
      Status: task.status || '',
      'Submission Status': task.submission?.status || 'Not Submitted',
      'Created At': new Date(task.createdAt).toISOString().split('T')[0],
      'Updated At': new Date(task.updatedAt).toISOString().split('T')[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Auto column width
    const maxColWidths = formattedData.reduce((widths, row) => {
      Object.values(row).forEach((val, idx) => {
        const length = String(val).length;
        widths[idx] = Math.max(widths[idx] || 10, length);
      });
      return widths;
    }, []);
    worksheet['!cols'] = maxColWidths.map((w) => ({ wch: w + 5 }));

    // Wrap & align cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;
        worksheet[cellRef].s = {
          alignment: {
            wrapText: true,
            vertical: 'center',
            horizontal: 'center',
          },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });

    saveAs(blob, `CompanyTasks_${companyId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };



  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/tasks/${taskToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setTasks(tasks.filter((t) => t._id !== taskToDelete._id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-4">
  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
    Tasks for Company{companyName ? `: ${companyName}` : ''}
  </h1>

  <button
    onClick={exportToExcel}
    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow"
  >
    📥 Export to Excel
  </button>
</div>


      {loading ? (
        <div className="text-center text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-red-500">No tasks found for this company.</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.description}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{task.company?.name || 'N/A'}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{task.assignedBy?.name || 'N/A'}</td>
                  <td className="px-4 py-4 text-right text-sm">
                    <div className="flex justify-end items-center space-x-4">
                      <Link to={`/admin/tasks/${task._id}`} className="text-gray-600 hover:text-gray-900">
                        <FiEye size={18} />
                      </Link>
                      <Link to={`/admin/tasks/edit/${task._id}`} className="text-blue-600 hover:text-blue-800">
                        <FiEdit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TasksFilter;
