import express from "express";

const app = express();
app.use(express.json());

// routes import
import userRouter from "./routes/user.route.js";
// import videoUpload from "./routes/videoUpload.route.js";
// import { imageUpload } from "./utils/fileupload.js";

// routes declartaion
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/video", videoUpload);

export default app;
