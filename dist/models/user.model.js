import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: 8,
    },
    profilePic: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
const User = mongoose.models.User ||
    mongoose.model("User", UserSchema);
export default User;
