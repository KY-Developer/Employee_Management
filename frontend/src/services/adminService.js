import axios from '../axios'; 

export const getCompanies = async () => {
  const response = await axios.get('/api/admin/companies');
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await axios.post('/api/admin/companies', companyData);
  return response.data;
};

export const updateCompany = async (id, companyData) => {
  const response = await axios.put(`/api/admin/companies/${id}`, companyData);
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await axios.delete(`/api/admin/companies/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await axios.get('/api/admin/dashboard/stats');
  return response.data;
};

export const getCompanyById = async (id) => {
  const response = await axios.get(`/api/admin/companies/${id}`);
  return response.data;
};

