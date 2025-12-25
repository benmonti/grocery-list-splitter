import { useState, useRef, useEffect, ChangeEvent } from "react";
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
import { get, onValue, ref, set } from "firebase/database";
import { useParams } from "react-router-dom";

export function ReceiptSplitter({ user }: { user: fbauth.User | null }) {
    const [groceryList, setGroceryList] = useState<Item[]>([]);
    const [people, setPeople] = useState<Person[]>([
        { total: 0, name: "" },
        { total: 0, name: "" },
    ]);
    const [showShareForm, setShowShareForm] = useState<boolean>(false);
    const [shareEmail, setShareEmail] = useState<string>("");
    const { listId } = useParams();
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (!user || !listId) return;

        const listRef = ref(db, `lists/${listId}`);

        // Live updates
        const unsubscribe = onValue(listRef, (snap) => {
            const data = snap.val();
            if (!data) {
                // Initialize new list if it doesn't exist
                const newList = {
                    name: `List-${Date.now()}`,
                    groceryList: [],
                    editors: { [user.uid]: true },
                    createdBy: user.uid,
                };
                set(listRef, newList);
                setGroceryList([]);
            } else {
                setGroceryList(
                    Array.isArray(data.groceryList) ? data.groceryList : [],
                );
            }
            hasLoaded.current = true; // mark loaded AFTER onValue fires
        });

        return () => unsubscribe();
    }, [user, listId]);

    // Writing local edits
    useEffect(() => {
        if (!user || !listId) return;
        if (!hasLoaded.current) return;

        const groceryRef = ref(db, `lists/${listId}/groceryList`);
        set(groceryRef, groceryList).catch(console.error);
    }, [groceryList, user, listId]);

    async function handleShare() {
        if (!shareEmail.includes("@")) {
            alert("Please enter a valid email");
            return;
        }
        console.log("Invite:", shareEmail);

        try {
            const sanitizedEmail = shareEmail.replace(/\./g, ",");
            const snap = await get(ref(db, `userEmails/${sanitizedEmail}`));
            if (!snap.exists()) {
                alert("No user found with this email");
                return;
            }
            const invitedUid = snap.val();
            console.log("Invited UID:", invitedUid);

            await set(ref(db, `lists/${listId}/editors/${invitedUid}`), true);
            await set(ref(db, `users/${invitedUid}/lists/${listId}`), true);
            alert("List shared successfully");
            setShareEmail("");
            setShowShareForm(false);
        } catch (err) {
            alert("Failed to share list");
            console.error("Error sharing list:", err);
        }
    }

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
            <h1 className="list-title">Grocery List:</h1>
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
            <button
                className="share-list-button"
                onClick={() => setShowShareForm(true)}
            >
                Share
            </button>
            {showShareForm && (
                <div className="share-form share-form-fixed">
                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <button onClick={handleShare}>Invite</button>
                    <button
                        onClick={() => {
                            setShowShareForm(false);
                            setShareEmail("");
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            <UploadReciept
                groceryList={groceryList}
                setGroceryList={setGroceryList}
            ></UploadReciept>
        </div>
    );
}
