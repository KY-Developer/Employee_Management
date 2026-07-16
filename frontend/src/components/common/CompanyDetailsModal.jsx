import React from 'react';
import { FiX } from 'react-icons/fi';

const CompanyDetailsModal = ({ company, isOpen, onClose }) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <FiX size={22} />
        </button>

        {/* Profile Section */}
        <div className="text-center mt-2">
  {company?.image?.url ? (
    <img
      src={company.image.url}
      alt="Company Logo"
      className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover"
    />
  ) : (
    <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-white shadow-md mx-auto bg-gray-100 text-gray-400 text-3xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5c1.936 0 3.5 1.564 3.5 3.5S13.936 11.5 12 11.5 8.5 9.936 8.5 8 10.064 4.5 12 4.5zM3 20.25c0-3.038 2.462-5.5 5.5-5.5h7c3.038 0 5.5 2.462 5.5 5.5v.75H3v-.75z"
        />
      </svg>
    </div>
  )}
  <h3 className="text-2xl font-extrabold text-gray-800 mt-3">{company.name}</h3>
  <p className="text-sm text-gray-500">{company.email}</p>
</div>


        {/* Details Section */}
       <div className="flex justify-center items-center gap-8 flex-wrap mt-6 text-gray-700 text-[15px]">
  <div className="flex items-center gap-1">
    <span>💰</span>
    <span className="font-semibold text-gray-900">Investment:</span>
    <span>₹{company.investment.toLocaleString()}</span>
  </div>
  <div className="flex items-center gap-1">
    <span>📈</span>
    <span className="font-semibold text-gray-900">Profit:</span>
    <span>₹{company.profit.toLocaleString()}</span>
  </div>
  <div className="flex items-center gap-1">
    <span>📅</span>
    <span className="font-semibold text-gray-900">Created:</span>
    <span>{new Date(company.createdAt).toLocaleDateString()}</span>
  </div>
  <div className="flex items-center gap-1">
    <span>🕒</span>
    <span className="font-semibold text-gray-900">Updated:</span>
    <span>{new Date(company.updatedAt).toLocaleDateString()}</span>
  </div>
</div>

      </div>
    </div>
  );
};

export default CompanyDetailsModal;
