import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("no token found");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "password refreshtoken"
    );
    if (!user) {
      throw new Error("User not available");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error while verifying JWT", error);
  }
};
