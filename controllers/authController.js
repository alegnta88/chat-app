import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const userSignUp = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await mongoose.model('User').findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const girlPicUrl = "https://example.com/girl-profile-pic.jpg";
        const boyPicUrl = "https://example.com/boy-profile-pic.jpg";
        const profilePic = gender === 'male' ? boyPicUrl : girlPicUrl;

        const newUser = new (mongoose.model('User'))({
            fullName,
            username,
            password: hashedPassword,
            gender,
            profilePic: profilePic,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
