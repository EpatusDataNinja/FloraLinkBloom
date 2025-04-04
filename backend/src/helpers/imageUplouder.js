import uploader from "../config/cloudinary.js";

const imageUploader = async (req) => {
  try {
    console.log('=== Image Uploader ===');
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    // Handle both multer and express-fileupload cases
    const file = req.file || (req.files && req.files.image);
    
    if (!file) {
      console.error('No file found in request');
      throw new Error('No file uploaded');
    }

    // Get the file path based on the upload method
    const filePath = req.file ? req.file.path : file.tempFilePath;
    
    if (!filePath) {
      console.error('No file path found');
      throw new Error('File path not found');
    }

    console.log('Uploading file from path:', filePath);
    console.log('File details:', {
      size: file.size,
      mimetype: file.mimetype,
      name: file.name
    });

    // Upload to Cloudinary with explicit resource type
    const Result = await uploader.upload(filePath, {
      folder: "Card",
      resource_type: "image",
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
    });

    console.log('Upload result:', Result);

    if (!Result || !Result.url) {
      console.error('Upload failed - no URL returned');
      throw new Error('Upload failed - no URL returned');
    }

    return Result;
  } catch (error) {
    console.error('Image upload error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

export default imageUploader;