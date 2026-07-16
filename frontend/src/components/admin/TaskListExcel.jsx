import React, { useEffect, useState } from 'react';
import axios from '../../axios';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

const TaskListExcel = () => {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    if (!loading) {
      fetchTasks();
      if (user?.role === 'admin') fetchCompanies();
    }
  }, [loading]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');

      const filtered = user?.role === 'company'
        ? res.data.filter(task => task.company?._id === user._id)
        : res.data;

      setTasks(filtered);
    } catch (error) {
      console.error('Error fetching tasks:');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/admin/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Error fetching companies:');
    }
  };

  const handleDownloadExcel = async () => {
    const response = await axios.get('/api/tasks/export/excel', {
      responseType: 'blob',
    });
    const file = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(file, 'Tasks_Report.xlsx');
  };

  const filteredTasks = tasks.filter(task => {
    const matchMonth = !selectedMonth || new Date(task.createdAt).toISOString().slice(0, 7) === selectedMonth;
    const matchCompany = !selectedCompany || task.company?._id === selectedCompany;
    return matchMonth && matchCompany;
  });

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
  <input
    type="month"
    className="border p-2 rounded"
    value={selectedMonth}
    onChange={e => setSelectedMonth(e.target.value)}
  />

  {user?.role === 'admin' && (
    <select
      className="border p-2 rounded"
      value={selectedCompany}
      onChange={e => setSelectedCompany(e.target.value)}
    >
      <option value="">All Companies</option>
      {companies.map(company => (
        <option key={company._id} value={company._id}>
          {company.name}
        </option>
      ))}
    </select>
  )}

  <button
    onClick={handleDownloadExcel}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    📥 Export to Excel
  </button>

  {/* ✅ Reset Filters Button */}
  <button
    onClick={() => {
      setSelectedMonth('');
      setSelectedCompany('');
    }}
    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
  >
    ♻️ Reset Filters
  </button>
</div>


      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Company</th>
              <th className="p-2">Status</th>
              <th className="p-2">Submitted</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task._id} className="border-t">
                <td className="p-2">{task.title}</td>
                <td className="p-2">{task.company?.name || '-'}</td>
                <td className="p-2">{task.status}</td>
                <td className="p-2">{task.submissionStatus || 'Not Submitted'}</td>
                <td className="p-2">{new Date(task.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No tasks found for selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default TaskListExcel;
