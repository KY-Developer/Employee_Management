import React, { useEffect, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify'

const AdminProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const tempUrl = URL.createObjectURL(file);
  setFormData((prev) => ({ ...prev, profileImage: tempUrl }));

  const imageForm = new FormData();
  imageForm.append('profileImage', file);

  const res = await updateProfile(imageForm);
  if (res.success) {
    toast.success('Image updated successfully!');
  } else {
    toast.error(res.message || 'Failed to update image.');
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const updateForm = new FormData();
  updateForm.append('name', formData.name);
  updateForm.append('email', formData.email);
  if (formData.password) updateForm.append('password', formData.password);

  const res = await updateProfile(updateForm);
  if (res.success) {
    toast.success('Profile updated successfully!');
    setFormData((prev) => ({ ...prev, password: '' }));
  } else {
    toast.error(res.message || 'Failed to update profile.');
  }
};


  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
      <div className="relative w-28 h-28 mx-auto mb-4">
        <img
          src={formData.profileImage || '/default-profile.png'}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-500"
        />
        <label className="absolute bottom-1 right-1 bg-yellow-400 p-2 rounded-full cursor-pointer shadow hover:bg-yellow-500 transition">
          <FiCamera className="text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      <h2 className="text-xl font-semibold">{formData.name}</h2>
      <p className="text-sm text-blue-500 mb-4">Admin</p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password (optional)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Enter new password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;


