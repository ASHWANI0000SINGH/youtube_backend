import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
	{
		videoFile: {
			type: String,
			required: true,
		},
		thumbnail: String,
		title: {
			type: String,
			required: true,
		},

		duration: Number,
		views: {
			type: Number,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
