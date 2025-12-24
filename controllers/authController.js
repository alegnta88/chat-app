import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import dotenv from "dotenv";
import { sendSMS } from "../utils/sendSMS.js";
import { sendMessage } from "./messageController.js";
import { isValidPhone } from "../validators/phoneValidator.js";


dotenv.config();

export const userSignUp = async (req, res) => {
  try {
    const { fullName, username, phone, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !phone || !password || !confirmPassword || !gender) {
      return res.status(400).json({ message: "All fields are required" }); 
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits and start with 09",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (gender !== "male" && gender !== "female") {
      return res.status(400).json({ message: "Invalid gender" });
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

   const smsMessage = `Welcome to our ChatApp, ${fullName}! Your username is ${username}.`;
   await sendSMS(phone, smsMessage);
   console.log("Welcome SMS sent to:", phone);

    const newUser = await User.create({
      fullName,
      username,
      phone,
      password: hashedPassword,
      gender,
      profilePic,
    });

    res.status(201).json({
      message: "User registered successfully",
      username: newUser.username,
      userId: newUser._id,
      phone: newUser.phone,
      profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,       
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",  
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const userLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, gender } = req.body;

    if (!fullName || !phone || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits and start with 09",
      });

    }

    if (gender !== "male" &&  gender !== "female") {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName;
    user.phone = phone;
    user.gender = gender;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      fullName: user.fullName,
      phone: user.phone,
      gender: user.gender,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};  