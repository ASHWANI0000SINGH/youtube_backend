import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/temp");
		// cb(null, "./p");
	},
	filename: function (req, file, cb) {
		console.log("file from multer", file);
		// cb(null, file.originalname);
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname)
		);
		console.log("multer task done", file);
	},
});

export const upload = multer({
	storage,
});
