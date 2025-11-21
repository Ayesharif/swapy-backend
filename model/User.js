import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false,
        trim: true,
        default: null

    },
    lastName: {
        type: String,
        required: false,
        trim: true,
        default: null

    },
    city: {
        type: String,
        required: false,
        trim: true,
        default: null

    },
    email: {
        type: String,
        required: false,
        trim: true,
        default: null,
        lowercase: true,
    },
    password: {
        type: String,
        required: false,
        trim: true,
        default: null,
        select: false
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        default: null,
    },
    status: {
        type: String,
        required: false,
        trim: true,
        default: "active",
    },
    role: {
        type: String,
        required: false,
        trim: true,
        default: "user",
    },
    otp: {
      type: String,   // or Number
      default: null,
              required: false,
    },
    expiresAt: {
      type: Date,     // best option: Date type
      default: null,
              required: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
 image: {
      image: { type: String, required: false, default: null },     // Cloudinary URL
      publicId: { type: String, required: false, default: null },  // Cloudinary public ID
    },

},{ timestamps: true });

export const User = mongoose.model('User', userSchema);