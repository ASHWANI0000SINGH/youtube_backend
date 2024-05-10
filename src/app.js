import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import videoUpload from "./routes/videoUpload.route.js";
// import { imageUpload } from "./utils/fileupload.js";

// routes declartaion
app.use("/api/v1/users", userRouter);

app.use("/api/v1/video", videoUpload);

export default app;
