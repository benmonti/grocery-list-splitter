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

interface ReceiptItem {
    name: string;
    price: number;
    people: boolean[];
}

interface ReceiptAnalysis {
    storeName?: string;
    items: ReceiptItem[];
    receiptSubtotal: number;
}

const genericNameMappings: Record<string, string> = {
    "kl evoo": "Extra Virgin Olive Oil",
    "kirkland evoo": "Extra Virgin Olive Oil",
    evoo: "Extra Virgin Olive Oil",
    "tide pods": "Laundry Detergent Pods",
    "downy ultra": "Fabric Softener",
};

function normalizeReceiptAnalysis(text: string): string {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return text;

    try {
        const analysis = JSON.parse(
            text.slice(start, end + 1),
        ) as ReceiptAnalysis;
        if (!Array.isArray(analysis.items)) return text;

        const store = (analysis.storeName || "").toLowerCase();
        analysis.items = analysis.items.map((item) => {
            const key = item.name.trim().toLowerCase();
            const mappedName = genericNameMappings[key];
            return mappedName ? { ...item, name: mappedName } : item;
        });

        console.log(
            `Normalized ${analysis.items.length} receipt items` +
                (store ? ` for ${analysis.storeName}` : ""),
        );
        return JSON.stringify(analysis);
    } catch {
        return text;
    }
}

export async function getGeminiResponse(
    image: string,
    mimeType = "image/jpeg",
    attempt = 1,
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
                    type: "OBJECT",
                    properties: {
                        storeName: { type: "STRING" },
                        items: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    name: { type: "STRING" },
                                    price: { type: "NUMBER" },
                                    people: {
                                        type: "ARRAY",
                                        items: { type: "BOOLEAN" },
                                    },
                                },
                                required: ["name", "price", "people"],
                            },
                        },
                        receiptSubtotal: { type: "NUMBER" },
                    },
                    required: ["storeName", "items", "receiptSubtotal"],
                },
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstructions },
                        ...(attempt > 1 ?
                            [
                                {
                                    text: "This is a reanalysis attempt. Carefully inspect every line item and the receipt subtotal again before responding.",
                                },
                            ]
                        :   []),
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
        return normalizeReceiptAnalysis(result.text || "");
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
