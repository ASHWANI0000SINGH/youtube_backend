import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addLikes, getAllLikes } from "../controllers/like.controller.js";

const router = Router();

router.route("/getAllLikes/:videoId").get(verifyJWT, getAllLikes);
router.route("/addLikes/:videoId").post(verifyJWT, addLikes);

export default router;
