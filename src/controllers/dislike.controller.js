import { DisLike } from "../models/dislikeModel.js";
import { Video } from "../models/video.model.js";

const getAllDisLikes = async (req, res) => {
	try {
		const { videoId } = req.params;
		if (!videoId) {
			res.status(401).send({ data: null, message: "Video ID not not given" });
		}

		const findVideoIdInLikes = await DisLike.find({ video: videoId });

		return res.status(200).send({
			data: findVideoIdInLikes,
			message: "dislike fetched succesfully ",
		});
	} catch (error) {
		console.error("Error fetching dislikes:", error);
	}
};
const addDisLikes = async (req, res) => {
	try {
		//1. User Id who is watching video
		//2. Video Id - which video is playing
		//3. When the user clicks on like btn
		//4. then trigger api call
		//5 . next time checks wether the user already liked the video
		//5.
		const { videoId } = req.params;
		if (!videoId) {
			res.status(401).send({ data: null, message: "Video ID not not given" });
		}

		const findVideoId = await Video.findById(videoId);

		// now we have video is legit and user legit
		//now we need to make sure the video id and user id only persent one time
		if (!findVideoId) {
			res
				.status(403)
				.send({ data: null, message: "video is not available in database " });
		}
		console.log("findvideo by id", findVideoId);

		const userId = req.user?._id;
		if (!userId) {
			res.status(401).send({ data: null, message: "User not logged In" });
		}

		const findUserAndVideoId = await DisLike.findOne({
			disLikedBy: userId,
			video: videoId,
		});
		console.log("video and user available", findUserAndVideoId);
		if (findUserAndVideoId) {
			res.status(402).send({
				data: null,
				message: "video is already disliked by the user ",
			});
		}
		if (findUserAndVideoId === null) {
			const dislikeDbCall = await DisLike.create({
				video: videoId,
				disLikedBy: userId,
			});
			console.log("dislikeDbCall", dislikeDbCall);
			return res
				.status(200)
				.send({ data: dislikeDbCall, message: "video Disliked" });
		}
	} catch (error) {
		console.error("Error while Liking Video:", error);
	}
};

export { getAllDisLikes, addDisLikes };
