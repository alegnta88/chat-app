import { userSignUp, userLogin, userLogout } from "../controllers/authController.js";
import express from "express";

const router = express.Router();

router.post("/signup", userSignUp);
router.post("/login", userLogin);
router.post("/logout", userLogout);

export default router;