import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: false, trim: true, default: null },
        description: { type: String, required: false, trim: true, default: null },
        price: { type: Number, required: false, default: null },

        category: { type: String, trim: true, required: false, default: null },
        productType: { type: String, trim: true, required: false, default: null },

       images: [{
      imageUrl: { type: String, required: false, default:null },     // Cloudinary URL
      publicId: { type: String, required: false, default: null },  // Cloudinary public ID
    }],

        postedBy: {
            type: String,
            required: false,
            default: null,
            required: false,
        },

        status: {
            type: Boolean,
            required: false, default: true
        },
        isDeleted: {
            type: Boolean,
            required: false, default: false
        },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
