import User from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username fullName profilePic");
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};