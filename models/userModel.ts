import mongoose, { Document, Schema } from "mongoose";

// Define an interface for the user document
export interface IUser extends Document {
    _id:string;
    name: string;
    email: string;
    mobile: string;
    image: string;
    password: string;
    is_admin: number;
    is_varified: number;
}

// Define the user schema
const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    is_varified: {
        type: Number,
        default: 0
    }
});

// Create the User model
const User = mongoose.model<IUser>("User", userSchema);

// Export the model
export { User }; // Named export for User
