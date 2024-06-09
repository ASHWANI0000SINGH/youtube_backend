import { Router } from "express";
import {
	addComment,
	deleteComment,
	editComment,
	getAllComments,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/getAllComments/:videoId").get(verifyJWT, getAllComments);
router.route("/addComments/:videoId").post(verifyJWT, addComment);
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment);
router.route("/editComment/:commentId").post(verifyJWT, editComment);

export default router;
