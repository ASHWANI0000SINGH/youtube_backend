import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";
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
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
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
    console.log("password validate", passwordValidate);

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

    if (!decodedToken) {
      throw new Error(" access token didn't match ");
    }
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new Error(" user not available while refreshing token");
    }

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
  } catch (error) {
    console.log("error while refreshing token", error);
  }
};
const changeCurrentPassword = async (req, res) => {
  // login check by middleware by auth middleware
  // take user password
  //take new password and confirm password
  // make a query and modify the password field
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user?._id);

    if (!newPassword && !confirmNewPassword && !newPassword) {
      return res.status(400).send({
        data: {},
        message: "All feilds are mandatory",
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send({
        data: {},
        message: "new password and confirm new password does not match",
      });
    }
    const validatePassword = user.passwordValidate(oldPassword);
    if (!validatePassword) {
      return res.status(401).send({
        data: {},
        message: "old password is not correct",
      });
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).send({ message: "password changed succesfully" });
  } catch (error) {
    console.log("error while chnaging password", error);
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select(
      "-password -refreshToken"
    );
    return res
      .status(200)
      .send({ data: user, message: "current user fetched succesfully" });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Internal server erro while getting current user" });
  }
};
const updateAccoutDetails = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      res.status(401).send({ data: {}, message: "no fields are updated" });
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          email,
          username,
        },
      },
      {
        returnOriginal: false,
      }
    ).select("-password -refreshToken");
    // if (username === user.username) {
    //   console.log("username", username, "user.name", user.username);
    //   return res.status(401).send({ message: "username is same" });
    // }
    // if (email === user.email) {
    //   return res.status(401).send({ message: "email is same" });
    // }

    return res
      .status(200)
      .send({ data: user, message: "details modified succesfully" });
  } catch (error) {}
};

const updateUserAvatar = async (req, res) => {
  // get the avatar
  //update the avatar
  try {
    const avatar = req?.file;
    if (!avatar) {
      res.status(401).send({ message: "no file attached " });
    }
    const avatartLocalPath = await uploadOnCloudinary(avatar?.path);
    if (!avatartLocalPath) {
      res.status(402).send({ message: "no url" });
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatartLocalPath?.url,
        },
      },
      {
        returnOriginal: false,
      }
    ).select("-password -refreshToken");

    return res.status(200).send({ data: user, message: "avatar  updated" });
  } catch (error) {
    console.log("server error while updating the avatar", error);
  }
};
const updateCoverImage = async (req, res) => {
  // get the avatar
  //update the avatar
  try {
    const coverImage = req?.file;
    if (!coverImage) {
      res.status(401).send({ message: "no file attached " });
    }
    const coverImageLocalPath = await uploadOnCloudinary(coverImage?.path);
    if (!coverImageLocalPath) {
      res.status(402).send({ message: "no url" });
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImageLocalPath?.url,
        },
      },
      {
        returnOriginal: false,
      }
    ).select("-password -refreshToken");

    return res.status(200).send({ data: user, message: "cover image updated" });
  } catch (error) {
    console.log("server error while updating the cover image", error);
  }
};
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateCoverImage,
};
