import express from "express";
import { messageController } from "../controllers/messageController";
import { protectedRoute } from "../middleware/protectedRoute";


routes = express.Router();

routes.post("/message/:id", protectedRoute, messageController);

export default routes;