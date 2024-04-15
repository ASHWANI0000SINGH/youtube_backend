import { verifyJWT } from "../middleware/auth.middleware.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

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

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      fullName,
      // password: hashedPassword,
      password,
      avatar: avatar.url,
      coverImage: coverImage ? coverImage.url : "",
    });
    const createdUser = await User.findById(user._id).select("-password ");
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(200)
      .send({ user: createdUser, message: "succefully created user" });
  } catch (error) {
    console.error("Error while creating the user:", error);
    return res.status(500).send("Internal Server Error while creating user");
  }
};
const loginUser = async (req, res) => {
  try {
    // how to regsiter user
    //1. get user email and password
    //2. if doesnt match no user
    //3. generate access, refersh token
    //4. send response
    const { email, password } = req.body;
    if (!email && !password) {
      throw new Error("Email and password is required");
    }
    const existedUser = await User.findOne({
      $or: [{ email }],
    });
    if (!existedUser) {
      throw new Error("No User found, Please signnup");
    }
    const passwordValidate = await existedUser.passwordValidate(password);

    if (!passwordValidate) {
      throw new Error("Invalid password, please check the password");
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(
      existedUser
    );
    const loggedInUser = await User.findById(existedUser._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie(" accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .send({ user: loggedInUser, message: "succefully logged In " });
  } catch (error) {
    console.error("Error while login the user:", error);
    return res.status(500).send("Internal Server Error while Login user");
  }
};
const logoutUser = async (req, res) => {
  try {
    console.log("request", req.user);
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .send({ data: {}, message: "succefully logged Out " });
  } catch (error) {
    console.error("Error while creating the user:", error);
    return res.status(500).send("Internal Server Error logging out user");
  }
};
const refreshAccessToken = async (req, res) => {
  try {
    //1. If user not logeed in throw err
    //2.we shall check login with the help of token.
    //3. we will re create access token ,
    //4. If user clicks on route , it will regfetch it
    // console.log("request", req.user);
    console.log("working");
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    // console.log("incoming refreshtoken", incomingRefreshToken);

    if (!incomingRefreshToken) {
      throw new Error("Incoming token not available");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log("decoded token", decodedToken);

    if (!decodedToken) {
      throw new Error(" access token didn't match ");
    }
    const user = await User.findById(decodedToken?._id);
    console.log(" 168 user", user);
    if (!user) {
      throw new Error(" user not available while refreshing token");
    }

    console.log("175", user);

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(user?._id);

    if (user?.accessToken !== newRefreshToken) {
      throw new Error(" Token does not match");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie(" accessToken", accessToken, options)
      .cookie("newRefreshToken", newRefreshToken, options)
      .send({ message: "succefully Refreshed Token " });
  } catch (error) {}
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
