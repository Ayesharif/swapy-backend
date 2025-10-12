import multer from "multer";
import path from "path";

// Storage config (store images in "uploads/" folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // folder to save files
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });
