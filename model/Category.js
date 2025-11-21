import mongoose from "mongoose";

const catSchema = new mongoose.Schema(
  {
    category: { type: String, required: false, default:null, trim :true },

    image: {
      image: { type: String, required: false, default:null },     // Cloudinary URL
      publicId: { type: String, required: false, default: null },  // Cloudinary public ID
    },
  },
  { timestamps: true }
);


export const Category = mongoose.model('Category', catSchema);