import React, { useRef } from "react";
import { Item } from "../interfaces/item";
import { BACKEND_URL } from "../url";

export function UploadReciept({
    groceryList,
    setGroceryList,
}: {
    groceryList: Item[];
    setGroceryList: (newList: Item[]) => void;
}): React.JSX.Element {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleButtonClick() {
        fileInputRef.current?.click(); // trigger the hidden file input
    }
    function toBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // converts to base64
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    }

    function extractJsonArray(text: string): string | null {
        // look for the first `[` and the last `]`
        const start = text.indexOf("[");
        const end = text.lastIndexOf("]");

        if (start === -1 || end === -1) {
            return null;
        }

        return text.slice(start, end + 1);
    }

    async function uploadRecieptToGemini(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        const base64Image = await toBase64(file);

        const res = await fetch(`${BACKEND_URL}/api/proxy-generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
        });

        const data = await res.json();

        // 🔍 LOG THE FULL BACKEND RESPONSE
        console.log("FULL BACKEND RESPONSE:", data);

        const aiText: string = data?.message || "No AI Response";
        const jsonString = extractJsonArray(aiText);

        if (!jsonString) {
            alert("AI response did not contain a JSON array");
            return;
        }
        // 🔍 LOG EXACTLY WHAT YOU PARSE
        console.log("AI TEXT (raw):", aiText);

        // Validate JSON before parsing
        let newGroceryList: Item[] = [];
        try {
            newGroceryList = JSON.parse(jsonString);
        } catch (err) {
            console.error("AI returned invalid JSON:", jsonString);
            alert("Failed to parse AI response. Response: " + jsonString);
            return;
        }

        setGroceryList(newGroceryList);
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleButtonClick}
                className="upload-receipt-button"
            >
                Upload Reciept
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={uploadRecieptToGemini}
                style={{ display: "none" }}
            />
        </div>
    );
}
