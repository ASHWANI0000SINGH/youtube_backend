import { Router } from "express";
import {
	fetchAllVideos,
	fetchUserVideos,
	fetchVideoById,
	uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
// router.use(verifyJWT);
router
	.route("/upload")
	.post(upload.single("videoFile"), verifyJWT, uploadVideo);
router.route("/fetch-user-video/:id").get(verifyJWT, fetchUserVideos);
router.route("/fetch-allvideo").get(fetchAllVideos);
router.route("/fetch-byId/:id").get(verifyJWT, fetchVideoById);

export default router;
