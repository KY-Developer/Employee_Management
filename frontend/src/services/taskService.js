import axios from '../axios'; 

export const getTasks = async () => {
  const response = await axios.get('/api/tasks');
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await axios.get(`/api/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const formData = new FormData();
  formData.append('title', taskData.title);
  formData.append('description', taskData.description);
  formData.append('taskList', JSON.stringify(taskData.taskList));
  formData.append('companyId', taskData.companyId);
  if (taskData.pdfFile) {
    formData.append('pdf', taskData.pdfFile);
  }

  const response = await axios.post('/api/tasks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const formData = new FormData();
  formData.append('title', taskData.title);
  formData.append('description', taskData.description);
  if (taskData.taskList) {
    formData.append('taskList', JSON.stringify(taskData.taskList));
  }
  if (taskData.pdfFile) {
    formData.append('pdf', taskData.pdfFile);
  }

  const response = await axios.put(`/api/tasks/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`/api/tasks/${id}`);
  return response.data;
};

export const reviewTaskSubmission = async (id, status, message = '') => {
  const response = await axios.put(`/api/tasks/${id}/review`, {
    status,
    message,
  });
  return response.data;
};


export const deleteSingleSubmissionFile = async (taskId, submissionId, publicId) => {
  const encodedPublicId = encodeURIComponent(publicId); // encode it
  const response = await axios.delete(
    `/api/admin/task/${taskId}/submission/${submissionId}/file/${encodedPublicId}`
  );
  return response.data;
};

export const deleteMultipleSubmissionFiles = async (taskId, submissionId, publicIds) => {
  const response = await axios.post(
    `/api/admin/task/${taskId}/submission/${submissionId}/files/delete`,
    { publicIds } // ✅ key name must match backend
  );
  return response.data;
};


export const deleteSubmissionMessage = async (taskId, submissionId) => {
  const response = await axios.put(
    `/api/admin/task/${taskId}/submissions/${submissionId}/message`,
    {},
    { withCredentials: true }
  );
  return response.data;
};


