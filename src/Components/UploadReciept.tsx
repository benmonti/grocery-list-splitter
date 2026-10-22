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
    const [processingStage, setProcessingStage] = useState(
        "Preparing your receipt",
    );

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

    function isHeicFile(file: File): boolean {
        return (
            file.type === "image/heic" ||
            file.type === "image/heif" ||
            /\.(heic|heif)$/i.test(file.name)
        );
    }

    async function prepareReceiptImage(file: File): Promise<Blob> {
        if (!file.type.startsWith("image/") && !isHeicFile(file)) {
            throw new Error("Please choose an image file");
        }

        let imageFile: Blob = file;
        if (isHeicFile(file)) {
            setProcessingStage("Converting your receipt photo");
            try {
                const { default: heic2any } = await import("heic2any");
                const converted = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9,
                });
                imageFile = Array.isArray(converted) ? converted[0] : converted;
            } catch (error) {
                console.warn(
                    "HEIC conversion failed; uploading the original image:",
                    error,
                );
            }
        }

        return compressReceiptImage(imageFile, file.name);
    }

    function compressReceiptImage(
        file: Blob,
        originalName: string,
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (
                !file.type.startsWith("image/") &&
                !/\.(heic|heif)$/i.test(originalName)
            ) {
                reject(new Error("Please choose an image file"));
                return;
            }

            const image = new Image();
            const objectUrl = URL.createObjectURL(file);
            const useOriginal = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            };

            image.onload = () => {
                const maxDimension = 1800;
                const scale = Math.min(
                    1,
                    maxDimension /
                        Math.max(image.naturalWidth, image.naturalHeight),
                );
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(image.naturalWidth * scale);
                canvas.height = Math.round(image.naturalHeight * scale);
                const context = canvas.getContext("2d");

                if (!context) {
                    useOriginal();
                    return;
                }

                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.82,
                );
            };
            image.onerror = () => {
                // Keep a backend-compatible original if browser decoding fails.
                useOriginal();
            };
            image.src = objectUrl;
        });
    }

    async function uploadRecieptToGemini(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            setProcessingStage("Preparing your receipt");
            const compressedImage = await prepareReceiptImage(file);
            const formData = new FormData();
            const fileName =
                compressedImage.type === "image/jpeg" ?
                    "receipt.jpg"
                :   file.name;
            formData.append("file", compressedImage, fileName);

            setProcessingStage("Reading items and prices");
            const res = await fetch(`${BACKEND_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Receipt processing failed");
            }

            const data = await res.json();
            const aiText: string = data?.message || "No AI Response";
            const jsonString = extractJsonArray(aiText) || aiText;

            if (!jsonString) {
                throw new Error("Receipt response did not contain a grocery list");
            }

            setProcessingStage("Building your grocery list");
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
                accept="image/*,.heic,.heif"
                style={{ display: "none" }}
            />
            {isProcessing && (
                <div className="loading-overlay" role="status" aria-live="polite">
                    <div className="loading-card">
                        <span className="loading-spinner" aria-hidden="true" />
                        <h2>{processingStage}</h2>
                        <p>
                            This can take a moment while we identify each item
                            and price.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
