import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const userSocketMap = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; 
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

    userSocketMap.set(userId, socket.id);

    io.emit("userOnline", { userId });

    socket.join(userId);

    socket.on("typing", ({ conversationId, receiverId }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("stopTyping", ({ conversationId, receiverId }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", {
          conversationId,
          userId,
        });
      }
    });

    socket.on("markAsRead", ({ conversationId, messageId, senderId }) => {
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", {
          conversationId,
          messageId,
          readBy: userId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
      userSocketMap.delete(userId);
      
      io.emit("userOffline", { userId });
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export const emitToUser = (io, userId, event, data) => {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

export const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

export { userSocketMap };