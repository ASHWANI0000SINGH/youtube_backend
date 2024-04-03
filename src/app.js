import express from "express";

const app = express();
app.use(express.json());

// routes import
import userRouter from "./routes/user.route.js";

// routes declartaion
app.use("api/v1/users", userRouter);

export default app;
