import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("⚠️ No file path provided to Cloudinary upload.");
      return null;
    }

    const absolutePath = path.resolve(localFilePath);
    const fileName = path.basename(localFilePath, path.extname(localFilePath)); // without extension
    const ext = path.extname(localFilePath); // with dot (e.g., .pdf)

    // Upload file
    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: 'raw',
      folder: 'pdfs',
      use_filename: true,       // Use original filename
      unique_filename: true,   // Avoid random hash
      overwrite: false          // Don't overwrite existing files
    });


    if (response.original_filename) {
  const cleanName = response.original_filename.replace(/_/g, ' ');
  console.log("📄 Original Name (formatted):", cleanName + ext);
} else {
  console.warn("⚠️ original_filename is missing in Cloudinary response.");
}

    // Delete local file
    fs.unlinkSync(absolutePath);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);

    // Clean up even on failure
    try {
      fs.unlinkSync(localFilePath);
    } catch (cleanupErr) {
      console.error("⚠️ Failed to delete file after Cloudinary error:", cleanupErr);
    }

    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    console.log("🗑️ File deleted from Cloudinary:", publicId);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary delete failed:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
