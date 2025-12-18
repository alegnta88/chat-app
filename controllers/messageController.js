import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { getOrCreateConversation } from "../utils/conversationHelper.js";

export const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { message } = req.body;
    const senderId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid receiver ID" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const conversation = await getOrCreateConversation(senderId, receiverId);

    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      text: message,
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (
      !conversation ||
      !conversation.participants.includes(userId)
    ) {
      return res.status(403).json({ error: "Access denied to this conversation" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};