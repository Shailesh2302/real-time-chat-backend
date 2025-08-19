"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.updateProfile = exports.logout = exports.login = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.default.findOne({
            email,
        });
        if (user)
            return res.status(400).json({ message: "Email already exists" });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new user_model_1.default({
            fullName,
            email,
            password: hashedPassword,
        });
        if (newUser) {
            (0, generateToken_1.generateToken)(newUser._id, res);
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
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email && !password) {
            console.log("Email or Password fields are empty");
            return res.status(400).json({
                message: "Email or Password field are empty",
            });
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            console.log("User not exist with this Invalid credentials");
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("User not exist with this Invalid credentials");
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        (0, generateToken_1.generateToken)(user._id, res);
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
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.logout = logout;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const uploadResponse = yield cloudinary_1.default.uploader.upload(profilePic);
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, {
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
exports.updateProfile = updateProfile;
const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user);
    }
    catch (error) {
        console.log("Error in checkAuth controller", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.checkAuth = checkAuth;
