import { useState } from "react";
import {
    groceryListProps,
    copyGroceryList,
    removeItem,
} from "../interfaces/groceryList";
import { Item } from "../interfaces/item";
import { Person } from "../interfaces/people";
import { getTotals } from "../interfaces/useCalculateSplits";
import React from "react";

export function ItemEntry({
    groceryList,
    setGroceryList,
    groceryItemIndex,
    people,
    setPeople,
}: groceryListProps & {
    groceryItemIndex: number;
    people: Person[];
    setPeople: (newPeople: Person[]) => void;
}): React.JSX.Element {
    const [itemName, setItemName] = useState<string>(
        groceryList[groceryItemIndex].name,
    );

    function removeItemFromList() {
        let newGroceryList = copyGroceryList(groceryList);
        newGroceryList = removeItem(
            groceryList,
            groceryList[groceryItemIndex].name,
        );
        setGroceryList(newGroceryList);
        setPeople(getTotals(people, newGroceryList));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setItemName(e.target.value);
    }

    function setNameHelper(name: string) {
        let groceryItemNames = groceryList.map((item: Item) => item.name);
        if (groceryItemNames.includes(name)) {
            setItemName(groceryList[groceryItemIndex].name);
        } else {
            let newGroceryList = copyGroceryList(groceryList);
            newGroceryList[groceryItemIndex].name = name;
            setGroceryList(newGroceryList);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
            setNameHelper(itemName);
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        let groceryItemNames = groceryList.map((item: Item) => item.name);
        setNameHelper(e.target.value);
        if (
            groceryItemNames.includes(e.target.value) &&
            e.target.value !== groceryList[groceryItemIndex].name
        )
            alert("Item already in list");
    }

    return (
        <span>
            <button
                style={{
                    height: "35px",
                    width: "100px",
                    fontSize: "20px",
                }}
                onClick={() => {
                    removeItemFromList();
                }}
            >
                Remove
            </button>
            &nbsp;
            <input
                value={itemName}
                style={{
                    height: "28px",
                    width: "100px",
                    fontSize: "calc(5px + 2vmin)",
                    left: "10px",
                }}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        </span>
    );
}
