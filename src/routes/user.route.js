import { Router } from "express";
import {
	changeCurrentPassword,
	getCurrentUser,
	getUserChannelProfile,
	getWatchHistory,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	updateAccoutDetails,
	updateCoverImage,
	updateFullName,
	updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-accessToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/currentuser").get(verifyJWT, getCurrentUser);
router.route("/updateuserdetails").post(verifyJWT, updateAccoutDetails);
router.route("/updateFullName").post(verifyJWT, updateFullName);

router.route("/watchhistory").get(verifyJWT, getWatchHistory);

router
	.route("/userchannelprofile/:username")
	.get(verifyJWT, getUserChannelProfile);

router
	.route("/update-userAvatar")
	.post(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
	.route("/update-coverImage")
	.post(verifyJWT, upload.single("coverImage"), updateCoverImage);

export default router;
