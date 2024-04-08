import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryfile.js";

const registerUser = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    // const user = await User.create({
    //   fullName,
    //   email,
    //   password,
    //   username: username.toLowerCase(),
    // });

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username?.toLowerCase(),
    });

    console.log("User created successfully");

    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error while creating the user:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export { registerUser };
