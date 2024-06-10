import {
	addDisLikes,
	getAllDisLikes,
} from "../controllers/dislike.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/getAlldislikes/:videoId").get(verifyJWT, getAllDisLikes);
router.route("/adddislikes/:videoId").post(verifyJWT, addDisLikes);

export default router;
