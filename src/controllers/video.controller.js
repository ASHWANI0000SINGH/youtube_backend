import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";

const uploadVideo = async (req, res) => {
  try {
    const { thumbnail, title, videoFile, duration } = req.body;
    const owner = req.user?._id;
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
const fetchVideos = async (req, res) => {
  try {
    const video = await User.aggregate([
      {
        $match: {
          _id: req.user._id,
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

const fetchAllVideos = async (req, res) => {
  try {
    const allVideosForAllUsers = await Video.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "users",

          pipeline: [
            {
              $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videoowner",
                pipeline: [
                  {
                    $project: {
                      videoFile: 1,
                      thumbnail: 1,
                      title: 1,
                      duration: 1,
                    },
                  },
                ],
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

const fetchVideoById = async (req, res) => {
  // *
  // 1.get video id
  // 2.hit a ququery with aggregate fn
  // 3. send result with user
  // *
  // try {
  //   const id = req.params;

  //   if (!id) {
  //     res.status(401).send({ data: null, mesaage: "id not given" });
  //   }
  //   console.log("id", id.id);
  //   const video = await Video.aggregate([
  //     {
  //       $match: {
  //         _id: id.id,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "owner",
  //         foreignField: "_id",
  //         as: "users",

  //         pipeline: [
  //           {
  //             $lookup: {
  //               from: "videos",
  //               localField: "_id",
  //               foreignField: "owner",
  //               as: "videoowner",
  //               pipeline: [
  //                 {
  //                   $project: {
  //                     videoFile: 1,
  //                     thumbnail: 1,
  //                     title: 1,
  //                     duration: 1,
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   ]);
  //   console.log("Video", video);
  //   // return res
  //   //   .status(200)
  //   //   .send({ data: channel[0], message: "user channel profile" });

  //   // const channel = console.log("user from channel", user);
  // }

  try {
    const id = req.params;

    const video = await Video.findById({ _id: id.id });
    const user = await User.findById({ _id: video.owner });

    console.log("video", video);
    console.log("user", user);

    return res
      .status(200)
      .send({
        data: [video, user],
        message: "video with id succesfully fetched",
      });
  } catch (error) {
    res.status(400).send({
      data: null,
      message: "somewthing went wrong while getting user channel profile",
    });
  }
};

export { uploadVideo, fetchVideos, fetchAllVideos, fetchVideoById };
