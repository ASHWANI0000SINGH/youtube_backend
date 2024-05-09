import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Specify the absolute path to the "public/temp" directory
		const uploadPath = path.join(__dirname, "../../public/temp");
		// cb(null, "./public/temp");
		cb(null, uploadPath);

		// cb(null, "./p");
	},
	filename: function (req, file, cb) {
		console.log("file from multer", file);
		cb(null, file.originalname);
	},
});

export const upload = multer({
	storage,
});
