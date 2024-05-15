import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
	cloud_name: process.env.CLODUINARY_CLOUD_NAME,
	api_key: process.env.CLODUINARY_API_KEY,
	api_secret: process.env.CLODUINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
	console.log("local path ", localFilePath);

	try {
		if (!localFilePath) {
			console.log("local file path not there");
			// return null;
		}
		//upload the file on cloudinary
		const response = await cloudinary.uploader.upload(localFilePath, {
			folder: "Playtube",
			resource_type: "auto",
		});
		// file has been uploaded successfull
		console.log("file is uploaded on cloudinary ", response);
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		// remove the locally saved temporary file as the upload operation got failed
		return null;
	}
};

export { uploadOnCloudinary };
