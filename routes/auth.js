const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/users");

const router = express.Router();

// Register
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("----------", process.env.NODE_ENV);
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "12h" });
        // res.cookie("auth_token", token, { maxAge: 86400000 });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 86400000,
        });
        res.status(200).json({ message: "Logged in successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
