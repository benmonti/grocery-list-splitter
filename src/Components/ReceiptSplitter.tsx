import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Item } from "../interfaces/item";
import { createNewPerson, Person } from "../interfaces/people";
import { CreateChoiceBoxes } from "./CreateChoiceBoxes";
import { ItemEntry } from "./ItemEntry";
import { PriceBox } from "./PriceBox";
import { TextInputAndButton } from "./TextInputAndButton";
import { UploadReciept } from "./UploadReciept";
import * as fbauth from "firebase/auth";
import { app, db } from "../App";
import { get, onValue, ref, set } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { List } from "../interfaces/groceryList";
import { getTotals } from "../interfaces/useCalculateSplits";

export function ReceiptSplitter({ user }: { user: fbauth.User | null }) {
    const [groceryList, setGroceryList] = useState<Item[]>([]);
    const [title, setTitle] = useState<string>("");
    // const { state } = useLocation();
    // const initialList: List = state?.list;
    const [people, setPeople] = useState<Person[]>([]);
    const [showShareForm, setShowShareForm] = useState<boolean>(false);
    const [shareEmail, setShareEmail] = useState<string>("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const { listId } = useParams();
    const hasLoaded = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !listId) return;

        const listRef = ref(db, `lists/${listId}`);

        // Live updates
        const unsubscribe = onValue(listRef, async (snap) => {
            const data = snap.val();
            let listName: string = `List-${Date.now()}`;
            if (!data) {
                // Initialize new list if it doesn't exist
                const newList: List = {
                    name: listName,
                    groceryList: [],
                    editors: {
                        [user.uid]: {
                            name: user.displayName ? user.displayName : "_",
                        },
                    },
                    createdBy: user.uid,
                    people: [createNewPerson(user?.displayName || "_")],
                    id: listId,
                };
                set(listRef, newList);
                setGroceryList([]);
                setPeople([
                    {
                        name: user.displayName || "",
                        total: 0,
                    },
                ]);
            } else {
                setGroceryList(
                    Array.isArray(data.groceryList) ? data.groceryList : [],
                );
                listName = data.name;
                const editorsObj = data.editors || {};
                const editorUids = Object.keys(editorsObj);

                let peoplePromises = editorUids.map(async (uid, idx) => {
                    let userName = "_";

                    if (people[idx] && people[idx].name) {
                        userName = people[idx].name;
                    } else {
                        try {
                            const profile = await getUserProfile(uid);
                            const profileData = await profile;
                            if (profileData?.name) {
                                const nameArr = profileData.name.split(" ");
                                userName = `${nameArr[0]}${nameArr[1] ? " " + nameArr[1][0] + "." : ""}`;
                            }
                        } catch (err) {
                            console.error(
                                "Profile fetch failed for uid",
                                uid,
                                err,
                            );
                        }
                    }

                    return {
                        name: userName,
                        total: 0,
                    };
                });

                let newPeople = await Promise.all(peoplePromises);

                newPeople = getTotals(newPeople, data.groceryList);
                setPeople(newPeople);
            }
            if (!isEditingTitle) setTitle(listName);

            hasLoaded.current = true; // mark loaded AFTER onValue fires
        });

        return () => unsubscribe();
    }, [user, listId, isEditingTitle]);

    async function getUserProfile(uid: string) {
        const idToken = await user?.getIdToken();

        const response = await fetch(
            `https://us-central1-grocery-list-splitter-e22fb.cloudfunctions.net/getUserProfile?uid=${uid}&listId=${listId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) throw new Error("Unauthorized or error");

        const profile: Promise<{ email: string; name: string }> =
            response.json();

        return profile;
    }

    // Writing local edits
    useEffect(() => {
        if (!user || !listId) return;
        if (!hasLoaded.current) return;

        const groceryRef = ref(db, `lists/${listId}/groceryList`);
        const peopleRef = ref(db, `lists/${listId}/people`);
        set(groceryRef, groceryList).catch(console.error);
        set(peopleRef, people);
    }, [groceryList, user, listId, people]);

    async function handleShare() {
        if (!shareEmail.includes("@")) {
            alert("Please enter a valid email");
            return;
        }
        console.log("Invite:", shareEmail);

        try {
            const sanitizedEmail = shareEmail.replace(/\./g, ",");
            const emailSnap = await get(
                ref(db, `userEmails/${sanitizedEmail}`),
            );
            if (!emailSnap.exists()) {
                alert("No user found with this email");
                return;
            }

            const invitedUid = emailSnap.val();
            // console.log("Invited UID:", invitedUid);

            const functions = getFunctions(app);
            const shareListFn = httpsCallable(functions, "shareList");
            await shareListFn({
                listId,
                invitedUid,
            });

            const profile = getUserProfile(invitedUid);

            const nameArr: string[] = (await profile).name.split(" ");
            const userName: string = `${nameArr[0]}${nameArr[1] ? " " + nameArr[1][0] + "." : ""}`;

            await alert("List shared successfully");
            setShareEmail("");
            setShowShareForm(false);

            const newPeople: Person[] = people.map((person: Person) => {
                return { ...person };
            });
            newPeople.push({
                name: userName ? userName : "_",
                total: 0,
            });

            setPeople(newPeople);

            const peopleRef = ref(db, `lists/${listId}/people`);
            set(peopleRef, newPeople);
        } catch (err) {
            alert("Failed to share list");
            console.error("Error sharing list:", err);
        }
    }

    const priceRefs = useRef<(HTMLInputElement | null)[]>([]);
    return (
        <div className="App">
            {/* <span className="set-people">
                <ChoosePeopleSlider
                    people={people}
                    setPeople={setPeople}
                    groceryList={groceryList}
                    setGroceryList={setGroceryList}
                ></ChoosePeopleSlider>
            </span> */}
            <header className="App-input-box">
                <TextInputAndButton
                    groceryList={groceryList}
                    setGroceryList={setGroceryList}
                    people={people}
                ></TextInputAndButton>
            </header>
            <h1
                className="list-title"
                style={{ paddingLeft: "170px", cursor: "pointer" }}
            >
                <span>Title: </span>

                {isEditingTitle ?
                    <input
                        type="text"
                        value={title}
                        autoFocus
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            setIsEditingTitle(false);
                            if (user && listId) {
                                const nameRef = ref(db, `lists/${listId}/name`);
                                set(nameRef, title);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setIsEditingTitle(false);
                                if (user && listId) {
                                    const nameRef = ref(
                                        db,
                                        `lists/${listId}/name`,
                                    );
                                    set(nameRef, title);
                                }
                            }
                        }}
                        className="title-input"
                    />
                :   <span
                        onClick={() => setIsEditingTitle(true)}
                        className="title-text"
                    >
                        {title || "Untitled"}
                    </span>
                }
            </h1>
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
                                    user={user}
                                    listId={listId}
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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleShare();
                                setShareEmail("");
                            }
                        }}
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
            <span
                className="dashboard-button"
                onClick={() => {
                    navigate(`/grocery-lists/`);
                }}
            >
                Dashboard
            </span>
        </div>
    );
}
