import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLODUINARY_CLOUD_NAME,
  api_key: process.env.CLODUINARY_API_KEY,
  api_secret: process.env.CLODUINARY_API_SECRET,
});

// Return "https" URLs by setting secure: true

/////////////////////////
// Uploads an image file
/////////////////////////
const uploadOnCloudinary = async (imagePath) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);

    console.log("file uploaded sucssfully");
    fs.unlinkSync(imagePath);
    return result;
  } catch (error) {
    fs.unlinkSync(imagePath); // remove the locally saved temporary file as the upload operation got failed
    console.error(error);
    return null;
  }
};

export { uploadOnCloudinary };
