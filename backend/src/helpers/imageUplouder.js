import uploader from "../config/cloudinary.js";

const imageUploader = async (req) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const Result = await uploader.upload(
      req.file.path,
      { folder: "Card" },
      (_, result) => result
    );
    return Result;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export default imageUploader;