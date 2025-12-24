import { userSignUp, userLogin, updateProfile, userLogout, updatePassword } from "../controllers/authController.js";
import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/signup", userSignUp);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.patch("/update", protectedRoute, updateProfile);
router.patch("/update-password", protectedRoute, updatePassword);

export default router;