import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOptions = {
	origin: process.env.CORS_ORIGIN, // Specify the allowed origin (or use a function for dynamic origin check)
	methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed HTTP methods

	credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

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
