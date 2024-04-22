import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/upload").post(uploadVideo);

export default router;
