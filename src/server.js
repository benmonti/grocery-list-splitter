import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getGeminiResponse } from "./ai.js";
import { BACKEND_URL } from "./url.js";
import multer from "multer";

dotenv.config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
    throw new Error("Missing GEMINI_API_KEY");
}

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json({ limit: "30mb" }));
app.use(
    cors({
        origin: [
            "https://benmonti.github.io",
            "https://grocery-list-split.onrender.com",
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    }),
);

app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.post("/api/generate", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Missing image" });
        }

        const text = await getGeminiResponse(image, req.body.mimeType);
        res.json({ message: text });
    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024, files: 1 },
}); // Limit to 25MB

app.post(
    "/api/upload",
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            const base64Image = req.file.buffer.toString("base64");
            console.log("Received image length:", base64Image.length);

            const response = await fetch(`${BACKEND_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: base64Image,
                    mimeType: req.file.mimetype,
                }),
            });

            const data = await response.json();

            res.json(data);
        } catch (err) {
            console.error("Error in /api/upload:", err);
            res.status(500).json({
                error: "Failed to process uploaded file",
            });
        }
    },
    (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res
                    .status(413)
                    .json({ error: "File too large (max 25MB allowed)." });
            }
        }
        next(err);
    },
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
