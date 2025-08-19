import mongoose, { Schema } from "mongoose";
const MessageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true,
});
const Message = mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);
export default Message;
