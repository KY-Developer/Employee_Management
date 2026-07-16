import axios from '../axios'; 

export const getCompanyProfile = async () => {
  const response = await axios.get('/api/company/profile');
  return response.data;
};

export const updateCompanyProfile = async (profileData) => {
  const response = await axios.put('/api/company/profile', profileData);
  return response.data;
};

export const getCompanyTasks = async () => {
  const response = await axios.get('/api/company/tasks');
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await axios.put(`/api/company/tasks/${taskId}/status`, { status });
  return response.data;
};

export const updateSubTaskStatus = async (taskId, subTaskId, completed) => {
  const response = await axios.put(`/api/company/tasks/${taskId}/subtasks/${subTaskId}`, { completed });
  return response.data;
};

export const uploadFinalPdf = async (taskId, file) => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await axios.put(
    `/api/company/tasks/${taskId}/final-pdf`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getCompanyDashboardStats = async () => {
  const response = await axios.get('/api/company/dashboard/stats');
  return response.data;
};


export const getInvestments = async () => {
  const response = await axios.get('/api/company/investments');
  return response.data;
};

export const addInvestment = async (investmentData) => {
  const response = await axios.post('/api/company/investments', investmentData);
  return response.data;
};

export const updateInvestment = async (invId, investmentData) => {
  const response = await axios.put(`/api/company/investments/${invId}`, investmentData);
  return response.data;
};

export const deleteInvestment = async (invId) => {
  const response = await axios.delete(`/api/company/investments/${invId}`);
  return response.data;
};