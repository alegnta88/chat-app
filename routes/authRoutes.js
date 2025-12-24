import { userSignUp, userLogin, updateProfile, userLogout } from "../controllers/authController.js";
import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/signup", userSignUp);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.put("/update", protectedRoute, updateProfile);

export default router;