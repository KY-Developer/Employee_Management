import { useState, useEffect } from 'react';
import { Link, Links } from 'react-router-dom';
import { getCompanies, deleteCompany } from '../../services/adminService';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import ConfirmationModal from '../common/ConfirmationModal';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import CompanyDetailsModal from '../common/CompanyDetailsModal';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCompany, setSelectedFilterCompany] = useState('');
  const { socket } = useSocket();

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      const safeCompanies = Array.isArray(data)
        ? data
        : Array.isArray(data?.companies)
        ? data.companies
        : [];

      setCompanies(safeCompanies);
      setFilteredCompanies(safeCompanies);
    } catch (error) {
      console.error('Failed to fetch companies:');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      toast.success('Company updated profile');
      fetchCompanies();
    };

    socket.on('company-profile-updated', handleUpdate);
    return () => socket.off('company-profile-updated', handleUpdate);
  }, [socket]);

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCompany(companyToDelete._id);
      const updated = companies.filter((c) => c._id !== companyToDelete._id);
      setCompanies(updated);
      setFilteredCompanies(updated);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete company:');
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFilterCompany('');
    setFilteredCompanies(companies);
  };

useEffect(() => {
  const filtered = companies.filter((company) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      company.name.toLowerCase().includes(search) ||
      company.email.toLowerCase().includes(search);

    const matchesDropdown = selectedFilterCompany
      ? company.name === selectedFilterCompany
      : true;

    return matchesSearch && matchesDropdown;
  });

  setFilteredCompanies(filtered);
}, [searchTerm, selectedFilterCompany, companies]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
        <Link
          to="/admin/companies/create"
          className="inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-700"
        >
          <FiPlus className="mr-2" size={16} />
          Add Company
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
  type="text"
  placeholder="🔍 Search by Name or Email"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="border px-3 py-2 rounded-md text-sm w-64"
/>

        <select
          value={selectedFilterCompany}
          onChange={(e) => setSelectedFilterCompany(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company._id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
        >
          ♻️ Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company._id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {company.image?.url ? (
                        <img
                          src={company.image.url}
                          alt={company.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 border">
                          <FiEye />
                        </div>
                      )}
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{company.name}</td> */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 hover:underline">
  <Link to={`/admin/task-list-excel/${company._id}`}>{company.name}</Link>
</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{company.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{company.investment?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{company.profit?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-4">
                        <button
                          onClick={() => handleViewDetails(company)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FiEye size={18} />
                        </button>
                        <Link to={`/admin/companies/edit/${company._id}`} className="text-blue-600 hover:text-blue-800">
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(company)}
                          className="text-red-600 hover:text-red-800"
                        >
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
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Company"
        message={`Are you sure you want to delete ${companyToDelete?.name}? This action cannot be undone.`}
      />

      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default Companies;
