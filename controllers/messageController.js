import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import messageModel from "../models/messageModel.js";

export const messageController = async (req, res) => {
    console.log("Message controller reached");
};