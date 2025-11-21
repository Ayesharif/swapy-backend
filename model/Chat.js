import mongoose from "mongoose";

const chatScheme = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: false,
        default: null
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: false,
        default: null
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        require: false,
        default: null
    },

    message: {
        type: String,
        require: false,
        default: null
    },
    roomId: {
        type: String,
        require: false,
        default: null
    },
    is_read: {
        type: Boolean,
        require: false,
        default: false
    },
    is_blocked: {
        type: Boolean,
        require: false,
        default: false
    },
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatScheme);
// module.exports = Chat;