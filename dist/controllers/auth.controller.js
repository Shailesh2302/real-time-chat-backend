var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import cloudinary from "../lib/cloudinary";
export const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email) {
            console.log("fullName or email are empty");
            return res.status(400).json({
                message: "Input fields are empty",
            });
        }
        if (!password || password.length < 8) {
            console.log("there is a Password field empty or length must be less that 8");
            return res
                .status(400)
                .json({ message: "Password must be at least 8 characters or empty" });
        }
        const user = yield User.findOne({
            email,
        });
        if (user)
            return res.status(400).json({ message: "Email already exists" });
        const hashedPassword = yield bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            generateToken(newUser._id, res);
            yield newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
        else {
            return res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        console.log("Error in signup controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
export const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email && !password) {
            console.log("Email or Password fields are empty");
            return res.status(400).json({
                message: "Email or Password field are empty",
            });
        }
        const user = yield User.findOne({ email });
        if (!user) {
            console.log("User not exist with this Invalid credentials");
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        const isPasswordCorrect = yield bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("User not exist with this Invalid credentials");
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        generateToken(user._id, res);
        return res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    }
    catch (error) {
        console.log("Error in login controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
export const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.log("Error in logout controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
export const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { profilePic } = req.body;
    try {
        if (!profilePic) {
            return res.status(400).json({
                message: "Profile pic is required",
            });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            console.log("Authenticated user ID not found");
            return res.status(400).json({
                message: "User not found",
            });
        }
        const uploadResponse = yield cloudinary.uploader.upload(profilePic);
        const updatedUser = yield User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url,
        }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        console.log("error in upadating profile", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});
export const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user);
    }
    catch (error) {
        console.log("Error in checkAuth controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
