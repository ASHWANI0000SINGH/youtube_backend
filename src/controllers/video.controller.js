import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";
import { ObjectId } from "mongodb";

const uploadVideo = async (req, res) => {
	try {
		const { thumbnail, title, videoFile, duration } = req.body;
		const owner = req.user?._id;
		console.log("req.file line no 10", req.file);
		let videoLocalpath = req.file.path;
		console.log("video local path", videoLocalpath);
		const videoFileonCloudinary = await uploadOnCloudinary(videoLocalpath);
		console.log("file on cloudinary", videoFileonCloudinary);
		console.log("url  of file on cloudinary", videoFileonCloudinary.url);
		console.log("video on cloudinary", videoFileonCloudinary);

		const video = await Video.create({
			thumbnail,
			title,
			videoFile: videoFileonCloudinary?.url,
			duration,
			owner,
		});

		return res.status(200).send({ data: video, message: "video uploaded" });
	} catch (error) {
		console.log("error while uploading video", error);
		// res.status(400).send("server error while uploading video", error);
	}
};
const fetchUserVideos = async (req, res) => {
	const id = req.params;

	const video = await Video.findById({ _id: id.id });
	const user = await User.findById({ _id: video.owner });
	console.log("user", user?._id);

	try {
		const video = await User.aggregate([
			{
				$match: {
					_id: user?._id,
				},
			},
			{
				$lookup: {
					from: "videos",
					localField: "_id",
					foreignField: "owner",
					as: "allvideo",
					pipeline: [
						{
							$lookup: {
								from: "users",
								localField: "owner",
								foreignField: "_id",
								as: "owner",
								pipeline: [
									{
										$project: {
											fullName: 1,
											username: 1,
											avatar: 1,
											videoFile: 1,
											thumbnail: 1,
											title: 1,
											duration: 1,
										},
									},
								],
							},
						},
						{
							$addFields: {
								owner: {
									$first: "$owner",
								},
							},
						},
					],
				},
			},
		]);
		console.log("allVideos", video[0].allvideo);
		return res
			.status(200)
			.send({ data: video[0].allvideo, message: "fetch video succesfully " });
	} catch (error) {
		console.error("Error fetching all videos for all users:", error);

		// res.status(400).json("server error while fetching video video", error);
	}
};
// const fetchUserVideos = async (req, res) => {
// 	const id = req.params;

// 	const video = await Video.findById({ _id: id.id });
// 	const user = await User.findById({ _id: video.owner });
// 	console.log("user", user?._id);

// 	try {
// 		const video = await User.aggregate([
// 			{
// 				$match: {
// 					_id: user?._id,
// 				},
// 			},
// 			{
// 				$lookup: {
// 					from: "videos",
// 					localField: "_id",
// 					foreignField: "owner",
// 					as: "allvideo",
// 					pipeline: [
// 						{
// 							$project: {
// 								fullName: 1,
// 								username: 1,
// 								avatar: 1,
// 								videoFile: 1,
// 								thumbnail: 1,
// 								title: 1,
// 								duration: 1,
// 							},
// 						},
// 					],
// 				},
// 			},
// 		]);
// 		console.log("allVideos", video[0].allvideo);
// 		return res
// 			.status(200)
// 			.send({ data: video[0].allvideo, message: "fetch video succesfully " });
// 	} catch (error) {
// 		console.error("Error fetching all videos for all users:", error);

// 		// res.status(400).json("server error while fetching video video", error);
// 	}
// };

// const fetchAllVideos = async (req, res) => {
//   try {
//     const allVideosForAllUsers = await Video.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "owner",
//           foreignField: "_id",
//           // as: "users",
//           as: "owner",

//           pipeline: [
//             {
//               $lookup: {
//                 from: "videos",
//                 localField: "_id",
//                 foreignField: "owner",
//                 as: "videoowner",
//                 pipeline: [
//                   {
//                     $project: {
//                       videoFile: 1,
//                       thumbnail: 1,
//                       title: 1,
//                       duration: 1,
//                     },
//                   },
//                 ],
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     console.log("All videos for all users:", allVideosForAllUsers);
//     return res.status(200).send({
//       data: allVideosForAllUsers,
//       message: "fetch video succesfully ",
//     });
//   } catch (error) {
//     console.error("Error fetching all videos for all users:", error);
//   }
// };
const fetchAllVideos = async (req, res) => {
	try {
		const allVideosForAllUsers = await Video.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "owner",
					foreignField: "_id",
					// as: "users",
					as: "owner",
					pipeline: [
						{
							$project: {
								videoFile: 1,
								thumbnail: 1,
								title: 1,
								duration: 1,
								email: 1,
								avatar: 1,
								coverImage: 1,
								username: 1,
							},
						},
					],
				},
			},
		]);

		console.log("All videos for all users:", allVideosForAllUsers);
		return res.status(200).send({
			data: allVideosForAllUsers,
			message: "fetch video succesfully ",
		});
	} catch (error) {
		console.error("Error fetching all videos for all users:", error);
	}
};

// const fetchVideoById = async (req, res) => {
//   try {
//     const id = req.params;

//     const video = await Video.findById({ _id: id.id });
//     const user = await User.findById({ _id: video.owner });

//     console.log("video", video);
//     console.log("user", user);

//     return res.status(200).send({
//       data: [video, user],
//       message: "video with id succesfully fetched",
//     });
//   } catch (error) {
//     res.status(400).send({
//       data: null,
//       message: "somewthing went wrong while getting user channel profile",
//     });
//   }
// };
const fetchVideoById = async (req, res) => {
	try {
		const id = req.params.id; // Extract id from request parameters

		const video = await Video.findById(id).populate("owner"); // Fetch video and populate the owner field
		if (!video) {
			return res.status(404).send({
				data: null,
				message: "Video not found",
			});
		}

		console.log("video", video);

		return res.status(200).send({
			data: video,
			message: "Video successfully fetched",
		});
	} catch (error) {
		console.error("Error fetching video:", error);
		res.status(500).send({
			data: null,
			message: "Something went wrong while fetching video",
		});
	}
};

export { uploadVideo, fetchUserVideos, fetchAllVideos, fetchVideoById };
