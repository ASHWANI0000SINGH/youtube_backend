import { Video } from "../models/video.model.js";

const uploadVideo = async (req, res) => {
  try {
    const { thumbnail, title, videoFile, duration } = req.body;
    const owner = req.user?._id;
    const video = await Video.create({
      thumbnail,
      title,
      videoFile,
      duration,
      owner,
    });

    return res.status(200).send({ data: video, message: "video uploaded" });
  } catch (error) {
    res.status(400).send("server error while uploading video", error);
  }
};

export { uploadVideo };
