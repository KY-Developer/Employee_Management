import React, { useEffect, useState } from 'react';
import { FiCamera } from 'react-icons/fi';
import { getCompanyProfile, updateCompanyProfile } from '../../services/companyService';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext';

const CompanyProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    investment: 0,
    profit: 0,
  });

    const { refreshUser  } = useAuth()

   const { socket } = useSocket()

     useEffect(() => {
    if (!socket) return

    socket.on('admin-updated-company', (data) => {
      refreshUser();
      toast.success(data.message || 'Your profile was updated by admin')
    })

    // Cleanup to avoid multiple listeners
    return () => socket.off('admin-updated-company')
  }, [socket])




  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getCompanyProfile();
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          image: profile.image?.url || '',
          investment: profile.investment || 0,
          profit: profile.profit || 0,
        });
        setPreviewImage(profile.image?.url || '');
      } catch (err) {
        toast.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);

      const imageForm = new FormData();
      imageForm.append('image', file);

      try {
        const res = await updateCompanyProfile(imageForm);
        toast.success(res.message || 'Image updated successfully');
        await refreshUser();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);

      const res = await updateCompanyProfile(form);
      toast.success(res.message || 'Profile updated successfully');
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
      <Toaster position="top-right" />

      <div className="relative w-28 h-28 mx-auto mb-4">
        <img
          src={previewImage || '/default-profile.png'}
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
      <p className="text-sm text-blue-500 mb-4">Company</p>

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
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Investment ($)</label>
          <input
            type="number"
            name="investment"
            value={formData.investment}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Profit ($)</label>
          <input
            type="number"
            name="profit"
            value={formData.profit}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfile;

