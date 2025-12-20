import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as fs from "fs";

const FILE_PATH: string = "public/gemini-config.txt";
dotenv.config();

console.log(`API Key Is ${process.env.GEMINI_API_KEY}`);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function stripBase64Prefix(dataUrl: string): string {
    return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

function extractMimeType(dataUrl: string): string {
    const match = dataUrl.match(/^data:(image\/\w+);base64,/);
    return match?.[1] ?? "image/jpeg";
}

export async function getGeminiResponse(image: string) {
    if (!image || typeof image !== "string" || !image.trim()) {
        return "No Image Provided";
    }

    try {
        const systemInstructions = fs.readFileSync(FILE_PATH, "utf-8");

        const mimeType = extractMimeType(image);
        const base64Image = stripBase64Prefix(image);

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstructions },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image,
                            },
                        },
                    ],
                },
            ],
        });

        console.log("RAW GEMINI RESPONSE:\n", result.text);
        return result.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
