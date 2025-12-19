import { getUsers } from "../controllers/userController.js";
import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/", protectedRoute, getUsers);

export default router;