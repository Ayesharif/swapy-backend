import mongoose from "mongoose";

const favSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false,
        trim: true,
        default: null

    },
    productId: {
        type: String,
        required: false,
        trim: true,
        default: null

    },


},{ timestamps: true });

export const Favourite = mongoose.model('Favourite', favSchema);