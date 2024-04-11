import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let files = fs.readdirSync("./public/temp");
files.forEach((file) => {
  if (files.length > 0) {
    fs.unlinkSync(`./public/temp/${file}`);
  }
});

export const upload = multer({
  storage,
});
