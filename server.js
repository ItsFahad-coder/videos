import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Railway ka dynamic port use karo
const PORT = process.env.PORT || 3000;

// Ensure 'uploads' folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (frontend) — ab root folder se serve hoga
app.use(express.static(__dirname));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Setup Multer to store images in the "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Handle multiple image uploads (5 images)
app.post("/upload", upload.array("image", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }

  const filenames = req.files.map((file) => file.filename);
  console.log(`✅ Images saved: ${filenames.join(", ")}`);

  res.json({ success: true, filenames });
});

app.get("/gallery", (req, res) => {
  const files = fs.readdirSync(uploadsDir);
  const images = files
    .map(file => `<img src="/uploads/${file}" width="200" style="margin:10px; border-radius:8px;">`)
    .join("");
  res.send(`
    <html>
      <head><title>Gallery</title></head>
      <body style="background:#111; padding:20px;">
        <h2 style="color:white;">Captured Photos</h2>
        ${images || "<p style='color:white;'>No photos yet.</p>"}
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
