import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

const getAllComments = async (req, res) => {
	try {
		//1 . we need video Id --thats where eevryone comments
		//2. we need to make query using video Id
		// 3. We need to fetch all Comments on the particular video with the help of videoId
		// 4. We also need user details along with the comments
		// 5. If there is no comment we will show no comments
		// 6.
		const { videoId } = req.params;
		//make query
		if (!videoId) {
			res.status(401).send({ data: null, message: "Video ID not not given" });
		}

		console.log(" 16 video id", videoId);
		const getCommentsUsingVideoId = await Comment.find({ video: videoId });
		// console.log("getComments", getCommentsUsingVideoId);
		// const ObjectId = new mongoose.Types.ObjectId();

		const commentAggregate = await Comment.aggregate([
			{
				$match: { video: new mongoose.Types.ObjectId(videoId) },
			},
			{
				$lookup: {
					from: "users",
					localField: "owner",
					foreignField: "_id",
					as: "userDetails",
					pipeline: [
						{
							$project: {
								email: 1,
								avatar: 1,
								coverImage: 1,
								username: 1,
							},
						},
					],
				},
			},
			{
				$unwind: "$userDetails",
			},
			{ $sort: { createdAt: -1 } },
		]);
		console.log("commentAggregate", commentAggregate);
		// console.log("getCommentsUsingVideoId", getCommentsUsingVideoId);

		return res.status(200).send({
			data: commentAggregate,
			message: "comments succesfully ",
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
	}
};
const addComment = async (req, res) => {
	try {
		//1 . we need video Id --thats where eevryone comments

		const { comment } = req.body;
		console.log("comment", comment);
		const owner = req.user?._id;
		const { videoId } = req.params;
		console.log(req.params);

		console.log("owner", owner, "video");
		const createdUser = await Comment.create({
			comment,
			owner,
			video: videoId,
		});

		return res
			.status(200)
			.send({ data: createdUser, message: "comment succesfully added" });
	} catch (error) {
		console.error("Error file adding comment:", error);
	}
};
const deleteComment = async (req, res) => {
	try {
		//1 . we need video Id --thats where eevryone comments

		// const { comment } = req.body;
		// console.log("comment", comment);
		const { commentId } = req.params;

		const userId = req.user._id;
		const commnetedUserId = await Comment.findById({ _id: commentId });
		console.log("commentedUserId", commnetedUserId);
		console.log("commentedUserId", commnetedUserId.owner.toString());
		console.log("userId", userId.toString());
		console.log(
			"id equal",
			commnetedUserId.owner.toString() === userId.toString()
		);
		if (commnetedUserId.owner.toString() !== userId.toString()) {
			res.status(403).send({
				data: null,
				message: "You can only delete your own comment",
			});
		}
		const commentDeleted = await Comment.deleteOne({ _id: commentId });

		return res
			.status(200)
			.send({ data: commentDeleted, message: "comment succesfully delted" });
	} catch (error) {
		console.error("Error while deleting comment:", error);
	}
};

const editComment = async (req, res) => {
	try {
		//1 . we need video Id --thats where eevryone comments

		// const { comment } = req.body;
		// console.log("comment", comment);
		const { commentId } = req.params;
		const { comment } = req.body;

		const EditedComment = await Comment.findByIdAndUpdate(
			{ _id: commentId },
			{
				$set: {
					comment,
				},
			},
			{
				returnOriginal: false,
			}
		);

		return res
			.status(200)
			.send({ data: EditedComment, message: "comment succesfully delted" });
	} catch (error) {
		console.error("Error while deleting comment:", error);
	}
};

export { getAllComments, addComment, deleteComment, editComment };
