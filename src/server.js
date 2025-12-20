import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getGeminiResponse } from "./ai.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://benmonti.github.io/grocery-list-splitter/",
        ],
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

        const response = await getGeminiResponse(image);
        const text = response.text;
        res.json({ message: text });
    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
});

app.post("/api/proxy-generate", async (req, res) => {
    try {
        const { image } = req.body;
        const response = await fetch(
            "https://cisc470-chatbot.onrender.com/api/generate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            },
        );
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch from external API" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
