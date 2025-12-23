import { useState, useRef, useEffect } from "react";
import { Item } from "../interfaces/item";
import { Person } from "../interfaces/people";
import { ChoosePeopleSlider } from "./ChoosePeopleSlider";
import { CreateChoiceBoxes } from "./CreateChoiceBoxes";
import { ItemEntry } from "./ItemEntry";
import { PriceBox } from "./PriceBox";
import { TextInputAndButton } from "./TextInputAndButton";
import { UploadReciept } from "./UploadReciept";
import * as fbauth from "firebase/auth";
import { db } from "../App";
import { ref, set } from "firebase/database";

export function ReceiptSplitter({ user }: { user: fbauth.User | null }) {
    const [groceryList, setGroceryList] = useState<Item[]>([]);
    const [people, setPeople] = useState<Person[]>([
        { total: 0, name: "" },
        { total: 0, name: "" },
    ]);

    useEffect(() => {
        if (!user) return;

        const userGroceryRef = ref(
            db,
            `users/${user.uid}/current-grocery-list`,
        );

        // Save the current groceryList to Firebase
        set(userGroceryRef, groceryList).catch((err) =>
            console.error("Failed to update grocery list:", err),
        );
    }, [groceryList, user]);

    const priceRefs = useRef<(HTMLInputElement | null)[]>([]);
    return (
        <div className="App">
            <span className="set-people">
                <ChoosePeopleSlider
                    people={people}
                    setPeople={setPeople}
                    groceryList={groceryList}
                    setGroceryList={setGroceryList}
                ></ChoosePeopleSlider>
            </span>
            <header className="App-input-box">
                <TextInputAndButton
                    groceryList={groceryList}
                    setGroceryList={setGroceryList}
                    people={people}
                ></TextInputAndButton>
            </header>
            <h1 className="grocery-list-title">Grocery List:</h1>
            <div
                className="App-table"
                style={{ "--num-people": people.length } as React.CSSProperties}
            >
                <div className="table-header">
                    <div className="header-item">Items</div>
                    <div className="header-price">Prices</div>
                    {people.map((person: Person, i: number) => (
                        <div
                            className="header-person"
                            key={i}
                            style={{
                                borderBottom:
                                    person.name !== "" ?
                                        "2px solid black"
                                    :   "none",
                            }}
                        >
                            {person.name}
                        </div>
                    ))}
                </div>
                {groceryList.map((groceryItem: Item, index: number) => (
                    <div className="table-row" key={groceryItem.name}>
                        <div className="table-item">
                            <ItemEntry
                                groceryList={groceryList}
                                setGroceryList={setGroceryList}
                                groceryItemIndex={index}
                                people={people}
                                setPeople={setPeople}
                            />
                        </div>
                        <div className="table-price">
                            {"$"}
                            <PriceBox
                                groceryList={groceryList}
                                setGroceryList={setGroceryList}
                                groceryItem={groceryItem}
                                priceRef={(
                                    el: HTMLInputElement | null,
                                ): void => {
                                    priceRefs.current[index] = el;
                                }}
                                priceRefs={priceRefs}
                                people={people}
                                setPeople={setPeople}
                            />
                        </div>
                        {people.map((person: Person, i: number) => (
                            <div className="table-choice" key={i}>
                                <CreateChoiceBoxes
                                    groceryList={groceryList}
                                    setGroceryList={setGroceryList}
                                    groceryItemIndex={index}
                                    people={people}
                                    setPeople={setPeople}
                                    index={i}
                                ></CreateChoiceBoxes>
                            </div>
                        ))}
                    </div>
                ))}
                <div className="table-footer">
                    <div className="footer-label">Totals:</div>
                    <div className="footer-total-price">
                        {groceryList
                            .reduce((sum, item) => sum + (item.price || 0), 0)
                            .toFixed(2)}
                    </div>
                    {people.map((person: Person, i: number) => (
                        <div className="footer-person" key={i}>
                            {people[i].total.toFixed(2)}
                        </div>
                    ))}
                </div>
            </div>
            <UploadReciept
                groceryList={groceryList}
                setGroceryList={setGroceryList}
            ></UploadReciept>
        </div>
    );
}
