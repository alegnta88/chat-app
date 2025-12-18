import express from "express";
import { sendMessage } from "../controllers/messageController.js";
import { protectedRoute } from "../middleware/protectedRoute.js";


const router = express.Router();

router.post("/message/:id", protectedRoute, sendMessage);

export default router;