import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask } from '../../services/taskService';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import ConfirmationModal from '../common/ConfirmationModal';
import StatusBadge from '../common/StatusBadge';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        const safeTasks = Array.isArray(data)
          ? data
          : Array.isArray(data?.tasks)
          ? data.tasks
          : [];
        setTasks(safeTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskToDelete._id);
      setTasks(tasks.filter((t) => t._id !== taskToDelete._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete task:');
    }
  };

  const exportTasksToExcel = () => {
    const formattedData = filteredTasks.map((task) => ({
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

    // Auto-fit columns
    const maxColWidths = formattedData.reduce((widths, row) => {
      Object.values(row).forEach((val, idx) => {
        const length = String(val).length;
        widths[idx] = Math.max(widths[idx] || 10, length);
      });
      return widths;
    }, []);
    worksheet['!cols'] = maxColWidths.map((w) => ({ wch: w + 5 }));

    // Wrap text in all cells
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

    const fileData = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    FileSaver.saveAs(fileData, `Tasks_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedCompany('');
  };

  const uniqueCompanies = [
    ...new Set(tasks.map((task) => task.company?.name).filter(Boolean)),
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchMonth = selectedMonth
      ? new Date(task.createdAt).toISOString().slice(0, 7) === selectedMonth
      : true;

    const matchCompany = selectedCompany
      ? task.company?.name === selectedCompany
      : true;

    const matchSearch = searchTerm
      ? task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchMonth && matchCompany && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Link
        to="/admin/tasks/create"
        className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-700 w-full sm:w-auto"
      >
        <FiPlus className="mr-2" size={16} />
        Create Task
      </Link>
      <button
        onClick={exportTasksToExcel}
        className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 w-full sm:w-auto"
      >
        📥 Export to Excel
      </button>
    </div>
  </div>

  {/* Filters */}
  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
    <input
      type="month"
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="border px-3 py-2 rounded-md text-sm w-full sm:w-auto"
    />

    <select
      value={selectedCompany}
      onChange={(e) => setSelectedCompany(e.target.value)}
      className="border px-3 py-2 rounded-md text-sm w-full sm:w-auto"
    >
      <option value="">All Companies</option>
      {uniqueCompanies.map((company) => (
        <option key={company} value={company}>
          {company}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Search by Task Title or Company"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border px-3 py-2 rounded-md text-sm w-full sm:w-auto"
    />

    <button
      onClick={handleResetFilters}
      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 w-full sm:w-auto"
    >
      ♻️ Reset Filters
    </button>
  </div>

  {/* Table */}
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
        {filteredTasks.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">No tasks found</td>
          </tr>
        ) : (
          filteredTasks.map((task) => (
            <tr key={task._id}>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{task.company?.name}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedBy?.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex justify-end items-center space-x-4">
                  <Link to={`/admin/tasks/${task._id}`} className="text-gray-600 hover:text-gray-900">
                    <FiEye size={18} />
                  </Link>
                  <Link to={`/admin/tasks/edit/${task._id}`} className="text-blue-600 hover:text-blue-800">
                    <FiEdit2 size={18} />
                  </Link>
                  <button onClick={() => handleDeleteClick(task)} className="text-red-600 hover:text-red-800">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Modal */}
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

export default Tasks;
