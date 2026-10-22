import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as fs from "fs";

const FILE_PATH: string = "public/gemini-config.txt";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function stripBase64Prefix(dataUrl: string): string {
    return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

function extractMimeType(dataUrl: string, fallback = "image/jpeg"): string {
    const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,/);
    return match?.[1] ?? fallback;
}

export async function getGeminiResponse(
    image: string,
    mimeType = "image/jpeg",
) {
    if (!image || typeof image !== "string" || !image.trim()) {
        return "No Image Provided";
    }

    try {
        const systemInstructions = fs.readFileSync(FILE_PATH, "utf-8");

        const resolvedMimeType = extractMimeType(image, mimeType);
        const base64Image = stripBase64Prefix(image);

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: {type: "STRING"},
                            price: {type: "NUMBER"},
                            people: {
                                type: "ARRAY",
                                items: {type: "BOOLEAN"},
                            },
                        },
                        required: ["name", "price", "people"],
                    },
                },
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstructions },
                        {
                            inlineData: {
                                mimeType: resolvedMimeType,
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
