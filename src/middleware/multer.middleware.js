import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/temp");
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
