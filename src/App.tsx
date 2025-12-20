import React, { useRef, useState } from "react";
import "./App.css";
import { ChoosePeopleSlider } from "./Components/ChoosePeopleSlider";
import { TextInputAndButton } from "./Components/TextInputAndButton";
import { ItemEntry } from "./Components/ItemEntry";
import { CreateChoiceBoxes } from "./Components/CreateChoiceBoxes";
import { PriceBox } from "./Components/PriceBox";
import { Item } from "./interfaces/item";
import { Person } from "./interfaces/people";
import { UploadReciept } from "./Components/UploadReciept";

function App(): React.JSX.Element {
    const [groceryList, setGroceryList] = useState<Item[]>([]);
    const [people, setPeople] = useState<Person[]>([
        { total: 0, name: "Name" },
        { total: 0, name: "Name" },
    ]);

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
                    <div></div>
                    <div className="footer-label">Totals:</div>
                    {groceryList.length > 0 && (
                        <>
                            {people.map((person: Person, i: number) => (
                                <div className="footer-person" key={i}>
                                    <div>{people[i].total.toFixed(2)}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
            <UploadReciept
                groceryList={groceryList}
                setGroceryList={setGroceryList}
            ></UploadReciept>
        </div>
    );
}

export default App;
