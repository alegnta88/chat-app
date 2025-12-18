import { userSignUp, userLogin } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router.post("/signup", userSignUp);
router.post("/login", userLogin);

export default router;