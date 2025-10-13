import { ChangeEvent } from "react";
import { Item } from "../interfaces/item";
import { copyGroceryList } from "../interfaces/groceryList";
import { Person } from "../interfaces/people";
import { getTotals } from "../interfaces/useCalculateSplits";
import React from "react";

export function CreateChoiceBoxes({
    groceryList,
    setGroceryList,
    groceryItemIndex,
    people,
    setPeople,
    index,
}: {
    groceryList: Item[];
    setGroceryList: (newList: Item[]) => void;
    groceryItemIndex: number;
    people: Person[];
    setPeople: (newPeople: Person[]) => void;
    index: number;
}) {
    function handleClick(e: ChangeEvent<HTMLInputElement>) {
        let newGroceryList = copyGroceryList(groceryList);
        let personIndex = parseInt(e.target.value);
        let groceryItemCopy = newGroceryList[groceryItemIndex];
        groceryItemCopy.people[personIndex] =
            !groceryItemCopy.people[personIndex];
        setGroceryList(newGroceryList);
        setPeople(getTotals(people, newGroceryList));
    }

    return (
        <>
            <input
                className="table-choice"
                type="checkbox"
                onChange={handleClick}
                checked={groceryList[groceryItemIndex].people[index]}
                value={index}
                style={{ width: "25px", height: "25px" }}
            />
        </>
    );
}
