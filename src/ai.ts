import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as fs from "fs";

const FILE_PATH: string = "src/gemini-config.txt";
dotenv.config();

console.log(`API Key Is ${process.env.GEMINI_API_KEY}`);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getGeminiResponse(image: string) {
    if (!image || typeof image !== "string" || !image.trim())
        return "No Image Provided";

    try {
        const systemInstructions: string = fs.readFileSync(FILE_PATH, "utf-8");

        const contents = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image,
                },
            },
            { text: systemInstructions },
        ];

        const result = ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });

        const response = (await result).text;
        return response;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
