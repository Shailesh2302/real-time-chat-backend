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
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";
import { getRecieverSocketId, io } from "../lib/socket";
export const getUsersForSidebar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = yield User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");
        return res.status(200).json(filteredUsers);
    }
    catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
export const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const messages = yield Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });
        return res.status(200).json(messages);
    }
    catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
export const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const myId = req.user._id;
        let imageUrl;
        if (image) {
            const uploadResponse = yield cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId: myId,
            receiverId,
            text,
            image: imageUrl,
        });
        yield newMessage.save();
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        return res.status(201).json(newMessage);
    }
    catch (error) {
        console.log("Error in sendMessages controller: ", error.message);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
