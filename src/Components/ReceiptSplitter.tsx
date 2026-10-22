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
import { onValue, ref, set } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { List } from "../interfaces/groceryList";
import { getTotals } from "../interfaces/useCalculateSplits";

interface PersonProfile {
    name: string;
    email: string;
}

function formatDistinctNames(profiles: PersonProfile[]): string[] {
    const parsedProfiles = profiles.map((profile) => {
        const nameParts = profile.name.trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || "Person";
        const lastName = nameParts.length > 1 ? nameParts.at(-1)! : "";

        return {
            firstName,
            lastName,
            email: profile.email,
        };
    });
    const prefixLengths = parsedProfiles.map((profile) =>
        profile.lastName ? 1 : 0,
    );

    let hasDuplicate = true;
    while (hasDuplicate) {
        const labels = parsedProfiles.map((profile, index) => {
            const prefixLength = prefixLengths[index];
            return profile.lastName ?
                    `${profile.firstName} ${profile.lastName.slice(0, prefixLength)}`
                :   profile.firstName;
        });
        const duplicateLabels = new Set(
            labels.filter((label, index) => labels.indexOf(label) !== index),
        );
        hasDuplicate = duplicateLabels.size > 0;
        let increasedPrefix = false;

        duplicateLabels.forEach((label) => {
            labels.forEach((currentLabel, index) => {
                if (
                    currentLabel === label &&
                    prefixLengths[index] < parsedProfiles[index].lastName.length
                ) {
                    prefixLengths[index] += 1;
                    increasedPrefix = true;
                }
            });
        });

        if (hasDuplicate && !increasedPrefix) {
            break;
        }
    }

    return parsedProfiles.map((profile, index) => {
        const prefixLength = prefixLengths[index];
        const name = profile.lastName ?
                `${profile.firstName} ${profile.lastName.slice(0, prefixLength)}`
            :   profile.firstName;
        const duplicateName = parsedProfiles.filter(
            (other) =>
                other.firstName === profile.firstName &&
                other.lastName === profile.lastName,
        ).length > 1;

        if (duplicateName && profile.email) {
            return `${name} (${profile.email.split("@")[0]})`;
        }
        return name;
    });
}

export function ReceiptSplitter({ user }: { user: fbauth.User | null }) {
    const [groceryList, setGroceryList] = useState<Item[]>([]);
    const [title, setTitle] = useState<string>("");
    // const { state } = useLocation();
    // const initialList: List = state?.list;
    const [people, setPeople] = useState<Person[]>([]);
    const [showShareForm, setShowShareForm] = useState<boolean>(false);
    const [shareSearch, setShareSearch] = useState("");
    const [shareSuggestions, setShareSuggestions] = useState<
        {uid: string; name: string; email: string}[]
    >([]);
    const [selectedPeople, setSelectedPeople] = useState<
        {uid: string; name: string; email: string}[]
    >([]);
    const [isSearchingPeople, setIsSearchingPeople] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const { listId } = useParams();
    const hasLoaded = useRef(false);
    const loadingListId = useRef<string | undefined>(undefined);
    const navigate = useNavigate();
    const profileCache = useRef<
        Record<string, { name: string; email: string }>
    >({});

    useEffect(() => {
        if (!user || !listId) {
            setIsLoadingList(false);
            return;
        }

        if (loadingListId.current !== listId) {
            loadingListId.current = listId;
            hasLoaded.current = false;
            setIsLoadingList(true);
        }

        const listRef = ref(db, `lists/${listId}`);
        let isActive = true;

        // Live updates
        const unsubscribe = onValue(listRef, async (snap) => {
            try {
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
                    await set(listRef, newList);
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

                    let peoplePromises = editorUids.map(async (uid) => {
                        let profile: PersonProfile = {
                            name: editorsObj[uid]?.name || "",
                            email: "",
                        };

                        try {
                            // Use cached profile if available
                            if (profileCache.current[uid]) {
                                profile = profileCache.current[uid];
                            } else {
                                const profileData = await getUserProfile(uid);
                                if (profileData) {
                                    profileCache.current[uid] = profileData; // cache it
                                    profile = profileData;
                                }
                            }
                        } catch (err) {
                            console.error("Profile fetch failed for uid", uid, err);
                        }

                        return profile;
                    });

                    const profiles = await Promise.all(peoplePromises);
                    const displayNames = formatDistinctNames(profiles);
                    let newPeople = profiles.map((profile, index) => ({
                        name: displayNames[index],
                        total: 0,
                    }));

                    newPeople = getTotals(newPeople, data.groceryList);
                    setPeople(newPeople);
                }
                if (!isEditingTitle) setTitle(listName);

                hasLoaded.current = true; // mark loaded AFTER onValue fires
            } catch (error) {
                console.error("Failed to load grocery list:", error);
            } finally {
                if (isActive) setIsLoadingList(false);
            }
        });

        return () => {
            isActive = false;
            unsubscribe();
        };
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

        const profile: { email: string; name: string } = await response.json();

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
        if (selectedPeople.length === 0) {
            alert("Choose at least one person to share with");
            return;
        }

        try {
            const functions = getFunctions(app);
            const shareListFn = httpsCallable(functions, "shareList");
            await shareListFn({
                listId,
                invitedUids: selectedPeople.map((person) => person.uid),
            });

            alert("List shared successfully");
            setShareSearch("");
            setShareSuggestions([]);
            setSelectedPeople([]);
            setShowShareForm(false);
        } catch (err) {
            alert("Failed to share list");
            console.error("Error sharing list:", err);
        }
    }

    useEffect(() => {
        const query = shareSearch.trim();
        if (query.length < 2) {
            setShareSuggestions([]);
            return;
        }

        const timer = window.setTimeout(async () => {
            setIsSearchingPeople(true);
            try {
                const functions = getFunctions(app);
                const searchUsersFn = httpsCallable<
                    {query: string},
                    {users: {uid: string; name: string; email: string}[]}
                >(functions, "searchUsers");
                const result = await searchUsersFn({query});
                setShareSuggestions(
                    result.data.users.filter(
                        (person) =>
                            !selectedPeople.some(
                                (selected) => selected.uid === person.uid,
                            ) && person.uid !== user?.uid,
                    ),
                );
            } catch (error) {
                console.error("Failed to search users:", error);
                setShareSuggestions([]);
            } finally {
                setIsSearchingPeople(false);
            }
        }, 250);

        return () => window.clearTimeout(timer);
    }, [shareSearch, selectedPeople, user]);

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
                            <div
                                className="table-choice"
                                key={i}
                                data-person={
                                    person.name || `Person ${i + 1}`
                                }
                            >
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
                        <div
                            className="footer-person"
                            key={i}
                            data-person={person.name || `Person ${i + 1}`}
                        >
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
                    <div className="share-picker">
                        <div className="share-selected">
                            {selectedPeople.map((person) => (
                                <span className="person-chip" key={person.uid}>
                                    {person.name || person.email}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${person.name || person.email}`}
                                        onClick={() =>
                                            setSelectedPeople((current) =>
                                                current.filter(
                                                    (selected) =>
                                                        selected.uid !== person.uid,
                                                ),
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add people by name or email"
                                value={shareSearch}
                                onChange={(e) => setShareSearch(e.target.value)}
                            />
                        </div>
                        {(isSearchingPeople || shareSuggestions.length > 0) && (
                            <div className="share-suggestions">
                                {isSearchingPeople && (
                                    <div className="share-suggestion-status">
                                        Searching people…
                                    </div>
                                )}
                                {shareSuggestions.map((person) => (
                                    <button
                                        type="button"
                                        className="share-suggestion"
                                        key={person.uid}
                                        onClick={() => {
                                            setSelectedPeople((current) => [
                                                ...current,
                                                person,
                                            ]);
                                            setShareSearch("");
                                            setShareSuggestions([]);
                                        }}
                                    >
                                        <span className="suggestion-avatar">
                                            {(person.name || person.email)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                        <span>
                                            <strong>
                                                {person.name || "Unnamed user"}
                                            </strong>
                                            <small>{person.email}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleShare}
                        disabled={selectedPeople.length === 0}
                    >
                        Share
                    </button>
                    <button
                        onClick={() => {
                            setShowShareForm(false);
                            setShareSearch("");
                            setShareSuggestions([]);
                            setSelectedPeople([]);
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
            {isLoadingList && (
                <div className="loading-overlay" role="status" aria-live="polite">
                    <div className="loading-card">
                        <span className="loading-spinner" aria-hidden="true" />
                        <h2>Opening your list</h2>
                        <p>
                            Fetching your items and people so everything is
                            ready to edit.
                        </p>
                    </div>
                </div>
            )}
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
