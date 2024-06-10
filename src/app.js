import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import videoUpload from "./routes/videoUpload.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import dislikeRouter from "./routes/dislike.route.js";

// import { imageUpload } from "./utils/fileupload.js";

// routes declartaion
app.use("/api/v1/users", userRouter);

app.use("/api/v1/video", videoUpload);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dislikes", dislikeRouter);

export default app;
