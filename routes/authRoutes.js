import { userSignUp } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router.post("/signup", userSignUp);

export default router;