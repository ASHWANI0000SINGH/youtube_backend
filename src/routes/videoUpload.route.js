import { Router } from "express";
import {
  fetchAllVideos,
  fetchVideos,
  uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT);
router.route("/upload").post(upload.single("videoFile"), uploadVideo);
router.route("/fetch-user-video").get(fetchVideos);
router.route("/fetch-allvideo").get(fetchAllVideos);

export default router;
