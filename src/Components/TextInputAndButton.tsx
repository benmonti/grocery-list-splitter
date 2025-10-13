import { useState } from "react";
import { groceryListProps, copyGroceryList } from "../interfaces/groceryList";
import { createNewItem, Item } from "../interfaces/item";
import { Person } from "../interfaces/people";
import React from "react";

export function TextInputAndButton({
    groceryList,
    setGroceryList,
    people,
}: groceryListProps & { people: Person[] }): React.JSX.Element {
    const [newItem, setNewItem] = useState<string>("");

    function notInList(newItem: string): boolean {
        const groceryListNames: string[] = groceryList.map(
            (item: Item) => item.name,
        );
        if (!groceryListNames.includes(newItem)) {
            return true;
        }
        return false;
    }

    function addItem(newItem: string) {
        if (newItem !== "") {
            if (notInList(newItem)) {
                const newGroceryList: Item[] = copyGroceryList(groceryList);
                newGroceryList.push(createNewItem(newItem, 0, people.length));
                setGroceryList(newGroceryList);
                setNewItem("");
            } else {
                alert("Item already in list");
                setNewItem("");
            }
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            addItem(newItem);
        }
    }

    return (
        <span>
            <input
                type="text"
                value={newItem}
                onChange={(e) => {
                    setNewItem(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Input Item Here"
            ></input>
            <button
                onClick={() => {
                    addItem(newItem.trim());
                }}
            >
                Submit
            </button>
        </span>
    );
}
