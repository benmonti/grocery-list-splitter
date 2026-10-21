import React, { useRef, useState } from "react";
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
    const [isProcessing, setIsProcessing] = useState(false);

    function handleButtonClick() {
        fileInputRef.current?.click(); // trigger the hidden file input
    }

    // function toBase64(file: File): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file); // converts to base64
    //         reader.onload = () => resolve(reader.result as string);
    //         reader.onerror = (error) => reject(error);
    //     });
    // }

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

        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${BACKEND_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Receipt processing failed");
            }

            const data = await res.json();
            const aiText: string = data?.message || "No AI Response";
            const jsonString = extractJsonArray(aiText);

            if (!jsonString) {
                throw new Error("Receipt response did not contain a grocery list");
            }

            const newGroceryList: Item[] = JSON.parse(jsonString);
            setGroceryList(newGroceryList);
        } catch (error) {
            console.error("Receipt processing failed:", error);
            alert(
                error instanceof Error ?
                    error.message
                :   "Unable to process this receipt",
            );
        } finally {
            setIsProcessing(false);
            event.target.value = "";
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleButtonClick}
                className="upload-receipt-button"
                disabled={isProcessing}
            >
                Upload Reciept
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={uploadRecieptToGemini}
                style={{ display: "none" }}
            />
            {isProcessing && (
                <div className="loading-overlay" role="status" aria-live="polite">
                    <div className="loading-card">
                        <span className="loading-spinner" aria-hidden="true" />
                        <h2>Reading your receipt</h2>
                        <p>
                            We&apos;re turning the items and prices into an
                            editable list.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
