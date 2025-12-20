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

    async function uploadRecieptToGemini(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        const res = await fetch(`${BACKEND_URL}/api/proxy-generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: file }),
        });
        const data = await res.json();
        const aiText: string = data?.message || "No AI Response";
        if (aiText === "Cannot Read Image" || aiText === "No Image Provided") {
            console.error("Error with image upload");
        } else {
            const newGroceryList: Item[] = JSON.parse(aiText);
            setGroceryList(newGroceryList);
        }
    }

    return (
        <div>
            <button type="button" onClick={handleButtonClick}>
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
