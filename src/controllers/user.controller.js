import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";
import bcrypt from "bcrypt";

const registerUser = async (req, res) => {
  try {
    // how to regsiter user
    //1. get user details all mandatory details
    //2.if deatils not presend show bad response
    //3.if user.email is already present - throw user already present
    //3.1 before pushing get the local path of file stored in temp
    //3.2 pass local path to the clooudinary utili function
    //4.otherwise push user
    //5. delete password
    const { username, email, fullName, password } = req.body;
    if (!username || !email || !fullName || !password) {
      res.status(400).send("please fill all mandatory details of the user");
    }
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existedUser) {
      res.status(401).send("User already registered");
    }

    let avatarLocalpath = req.files?.avatar[0]?.path;
    let coverImageLocalpath = req.files?.coverImage[0]?.path;

    const avatar = await uploadOnCloudinary(avatarLocalpath);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);
    if (!avatar) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      fullName,
      password: hashedPassword,
      avatar: avatar.url,
      coverImage: coverImage ? coverImage.url : "",
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    res
      .status(200)
      .send({ user: createdUser, message: "succefully created user" });
  } catch (error) {
    console.error("Error while creating the user:", error);
    return res.status(500).send("Internal Server Error while creating user");
  }
};

export { registerUser };
