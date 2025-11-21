import express from "express";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    //console.log("File uploaded:", req.file);
    return res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
