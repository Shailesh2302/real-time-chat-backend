import mongoose, { Document, Schema } from "mongoose";

export interface User extends Document {
  fullName: string;
  email: string;
  password: string;
  profilePic: string;
}

const UserSchema: Schema<User> = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const User =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default User;
