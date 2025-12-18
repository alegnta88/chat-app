import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { getOrCreateConversation } from "../utils/conversationHelper.js";
import DOMPurify from "isomorphic-dompurify";

const MAX_MESSAGE_LENGTH = 5000;

export const sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  
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

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` 
      });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    session.startTransaction();

    const conversation = await getOrCreateConversation(senderId, receiverId, session);

    const sanitizedMessage = DOMPurify.sanitize(message.trim());

    const newMessage = await Message.create([{
      conversationId: conversation._id,
      senderId,
      text: sanitizedMessage,
    }], { session });

    conversation.lastMessage = newMessage[0]._id;
    await conversation.save({ session });

    await session.commitTransaction();

    const populatedMessage = await Message.findById(newMessage[0]._id)
      .populate('senderId', 'username avatar');

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error sending message:", error);
    return res.status(500).json({ 
      error: "Failed to send message. Please try again." 
    });
  } finally {
    session.endSession();
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;
    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        error: "Access denied to this conversation" 
      });
    }

    const totalMessages = await Message.countDocuments({ conversationId });
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) 
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('senderId', 'username avatar')
      .lean(); 

    return res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        messagesPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({ 
      error: "Failed to retrieve messages. Please try again." 
    });
  }
};