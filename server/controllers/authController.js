const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        const trimmedName = name?.trim();
        const trimmedEmail = email?.trim();

        if (!trimmedName || !trimmedEmail || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!/\S/.test(password)) {
            return res.status(400).json({
                message: "Password cannot be only whitespace"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // check existing user
        const existingUser = await User.findOne({ email: trimmedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await User.create({
            name: trimmedName,
            email: trimmedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const trimmedEmail = email?.trim();

        if (!trimmedEmail || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        if (!/\S/.test(password)) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};