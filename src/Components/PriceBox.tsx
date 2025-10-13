import { useState, ChangeEvent } from "react";
import { copyGroceryList, groceryListProps } from "../interfaces/groceryList";
import { Item } from "../interfaces/item";
import { getTotals } from "../interfaces/useCalculateSplits";
import { Person } from "../interfaces/people";
import React from "react";

interface PriceBoxProps extends groceryListProps {
    groceryItem: Item;
    priceRef?: React.Ref<HTMLInputElement>;
    priceRefs?: React.RefObject<(HTMLInputElement | null)[]>;
    people: Person[];
    setPeople: (newPeople: Person[]) => void;
}

export function PriceBox({
    groceryList,
    setGroceryList,
    groceryItem,
    priceRef,
    priceRefs,
    people,
    setPeople,
}: PriceBoxProps) {
    const [priceText, setPriceText] = useState<string>(
        groceryItem.price ? groceryItem.price.toFixed(2) : "",
    );

    function isCorrectPrice(text: string): boolean {
        if (!Number.isNaN(Number(text))) {
            return true;
        }
        return false;
    }

    function setPriceHelper(priceString: string) {
        if (isCorrectPrice(priceString) && priceString !== "") {
            const priceNum: number =
                Math.round(parseFloat(priceString) * 100) / 100;
            let newGroceryList = copyGroceryList(groceryList);
            let copyItem = { ...groceryItem };
            copyItem.price = priceNum;
            let itemIndex = newGroceryList.findIndex(
                (item) => item.name === groceryItem.name,
            );
            newGroceryList[itemIndex] = copyItem;
            setGroceryList(newGroceryList);
            setPeople(getTotals(people, newGroceryList));
            setPriceText(priceNum.toFixed(2));
        } else {
            setPriceText("");
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        setPriceHelper(e.target.value);
        if (!isCorrectPrice(e.target.value)) {
            alert("Enter a price");
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        setPriceText(e.target.value);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Escape") {
            (e.target as HTMLInputElement).blur();
            setPriceHelper(priceText);
        }
        if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
            setPriceHelper(priceText);
            const refsArray = priceRefs?.current;
            if (!refsArray) return;
            const currentIndex = refsArray.findIndex((el) => el === e.target);
            const next = refsArray[currentIndex + 1];
            if (next) next.focus();
        }
    }

    return (
        <input
            ref={priceRef ? priceRef : null}
            type="text"
            value={priceText}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
                height: "28px",
                width: "100px",
                fontSize: "calc(5px + 2vmin)",
            }}
            onChange={handleChange}
        ></input>
    );
}
