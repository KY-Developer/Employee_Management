import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const absolutePath = path.resolve(localFilePath);
    const fileName = path.basename(localFilePath, path.extname(localFilePath));

    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: 'image',
      folder: 'images',
      public_id: `${Date.now()}_${fileName}`,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    });

    fs.unlinkSync(absolutePath);
    console.log("✅ Image uploaded:", response.secure_url);
    return response;
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    try {
      fs.unlinkSync(localFilePath);
    } catch {}
    return null;
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
    return response;
  } catch (error) {
    console.error("❌ Image deletion failed:", error);
    return null;
  }
};

export { uploadImageToCloudinary, deleteImageFromCloudinary };
