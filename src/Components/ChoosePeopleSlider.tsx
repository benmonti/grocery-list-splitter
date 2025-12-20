import { useState, ChangeEvent } from "react";
import { Item } from "../interfaces/item";
import { updatePeople } from "../interfaces/groceryList";
import { Person } from "../interfaces/people";
import React from "react";

const NUM_PER_ROW: number = 4;

export function ChoosePeopleSlider({
    people,
    setPeople,
    groceryList,
    setGroceryList,
}: {
    people: Person[];
    setPeople: (newPeople: Person[]) => void;
    groceryList: Item[];
    setGroceryList: (newGroceryList: Item[]) => void;
}) {
    const [textValue, setTextValue] = useState<string>("2");
    const [numPeople, setNumPeople] = useState<number>(2);

    function renderPeopleChange(newNumPeople: number) {
        let newPeople: Person[] = people.map((person: Person) => {
            return { ...person };
        });
        if (newNumPeople > people.length)
            newPeople.push(
                ...Array(newNumPeople - people.length).fill({
                    total: 0,
                    name: "",
                }),
            );
        else if (newNumPeople < people.length)
            newPeople.splice(newNumPeople, people.length);
        setPeople(newPeople);
    }

    function updateGroceryList(newNumPeople: number) {
        if (groceryList.length) {
            let newGroceryList = updatePeople(groceryList, newNumPeople);
            setGroceryList(newGroceryList);
        }
    }

    function handleTextChange(): void {
        if (!Number.isNaN(Number(textValue)) && textValue !== "") {
            const newVar: number = Math.max(
                2,
                Math.min(8, parseInt(textValue)),
            );
            setNumPeople(newVar);
            setTextValue(newVar.toString());
            updateGroceryList(newVar);
            renderPeopleChange(newVar);
        } else {
            alert("Enter a number");
            setTextValue(numPeople.toString());
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
            handleTextChange();
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        if (e.target.value) {
            handleTextChange();
        }
    }

    function handleText(e: ChangeEvent<HTMLInputElement>) {
        setTextValue(e.target.value);
    }

    function changeSlider(e: ChangeEvent<HTMLInputElement>) {
        let newNumPeople = parseInt(e.target.value);
        setNumPeople(newNumPeople);
        renderPeopleChange(newNumPeople);
        setTextValue(e.target.value);
        updateGroceryList(parseInt(e.target.value));
    }

    function handleChange(i: number, newPerson: string) {
        const newPeople: Person[] = people.map((person: Person) => {
            return { ...person };
        });
        newPeople[i].name = newPerson;
        setPeople(newPeople);
    }

    const chunkArray = <T,>(arr: T[], size: number) => {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    return (
        <span>
            Number of People:
            <br></br>
            <input
                type="range"
                value={numPeople}
                min="2"
                max="8"
                onChange={changeSlider}
            ></input>
            <input
                type="number"
                value={textValue}
                onChange={handleText}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                style={{ width: "30px" }}
            ></input>
            &nbsp;
            <div>
                {chunkArray([...Array(numPeople)], NUM_PER_ROW).map(
                    (row, rowIndex) => (
                        <div key={rowIndex} style={{ marginBottom: "8px" }}>
                            {row.map((_, i) => {
                                const index = rowIndex * NUM_PER_ROW + i;
                                return (
                                    <input
                                        key={index}
                                        type="text"
                                        value={people[index].name}
                                        style={{ marginRight: "8px" }}
                                        placeholder="Name"
                                        onChange={(e) => {
                                            handleChange(index, e.target.value);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ),
                )}
            </div>
        </span>
    );
}
