import axios from '../axios'; 

export const loginAdmin = async (email, password) => {
  const response = await axios.post('/api/auth/admin/login', {
    email,
    password,
  });
  return response.data;
};

export const loginCompany = async (email, password) => {
  const response = await axios.post('/api/auth/company/login', {
    email,
    password,
  });
  return response.data;
};

export const registerAdmin = async (name, email, password) => {
  const response = await axios.post('/api/auth/admin/register', {
    name,
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.post('/api/auth/logout', {});
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data;
};
