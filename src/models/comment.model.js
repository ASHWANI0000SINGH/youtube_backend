import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
	{
		comment: {
			type: String,
			required: true,
		},

		views: {
			type: Number,
			default: 0,
		},
		likes: {
			type: Number,
			default: 0,
		},

		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		video: {
			type: Schema.Types.ObjectId,
			ref: "Video",
		},
	},
	{ timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
