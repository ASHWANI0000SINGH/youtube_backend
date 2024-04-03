import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
    });

    console.log("User created successfully");

    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error while creating the user:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export { registerUser };
