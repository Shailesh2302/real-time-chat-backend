import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt, { hash } from "bcryptjs";
import { generateToken } from "../utils/generateToken";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
  };

  try {
    if (!fullName || !email) {
      console.log("fullName or email are empty");
      return res.status(400).json({
        message: "Input fields are empty",
      });
    }

    if (!password || password.length < 8) {
      console.log(
        "there is a Password field empty or length must be less that 8"
      );
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters or empty" });
    }

    const user = await User.findOne({
      email,
    });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id as string | number, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email && !password) {
      console.log("Email or Password fields are empty");
      return res.status(400).json({
        message: "Email or Password field are empty",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not exist with this Invalid credentials");
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log("User not exist with this Invalid credentials");
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateToken(user._id as string | number, res);
    return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error: any) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { profilePic } = req.body;
  try {
    if (!profilePic) {
      return res.status(400).json({
        message: "Profile pic is required",
      });
    }

    const userId = req.user?._id;

    if (!userId) {
      console.log("Authenticated user ID not found");
      return res.status(400).json({
        message: "User not found",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in upadating profile", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  try {
    return res.status(200).json(req.user);
  } catch (error: any) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
