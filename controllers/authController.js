import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const userSignUp = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const baseAvatarUrl = "https://avatar.iran.liara.run/public";
    const profilePic =
      gender === "male"
        ? `${baseAvatarUrl}/boy?username=${encodeURIComponent(username)}`
        : `${baseAvatarUrl}/girl?username=${encodeURIComponent(username)}`;

    const newUser = await User.create({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic,
    });

    res.status(201).json({
      message: "User registered successfully",
      username: newUser.username,
      userId: newUser._id,
      profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

