import { useState } from "react";
import { List } from "../interfaces/groceryList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as fbauth from "firebase/auth";
import { app, db, auth } from "../App";
import { useNavigate } from "react-router-dom";
import { get, onValue, push, ref, set } from "firebase/database";
import { useEffect } from "react";
import { createNewPerson } from "../interfaces/people";
import { getFunctions, httpsCallable } from "firebase/functions";

function getListDate(list: List): number {
    if (typeof list.createdAt === "number") {
        return list.createdAt;
    }

    const isoDate = list.name.match(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/);
    const monthDayYear = list.name.match(
        /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/,
    );
    const parsedDate = Date.parse(isoDate?.[0] || monthDayYear?.[0] || "");

    return Number.isNaN(parsedDate) ? 0 : parsedDate;
}

function sortListsByCreatedDate(lists: List[]): List[] {
    return [...lists].sort((a, b) => getListDate(b) - getListDate(a));
}

export function Dashboard({ user }: { user: fbauth.User | null }) {
    const [lists, setLists] = useState<List[]>([]);
    const [isLoadingLists, setIsLoadingLists] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setIsLoadingLists(false);
            return;
        }

        const userListsRef = ref(db, `users/${user.uid}/lists`);

        const unsubscribe = onValue(userListsRef, async (snapshot) => {
            try {
                const data = snapshot.val() || {};
                const listIds: string[] = Object.keys(data);
                const loadedLists: List[] = [];

                for (const listId of listIds) {
                    const listSnap = await get(ref(db, `lists/${listId}`));
                    if (!listSnap.exists() || listSnap.val() === null) {
                        await set(
                            ref(db, `users/${user.uid}/lists/${listId}`),
                            null,
                        );
                        continue;
                    }
                    loadedLists.push({
                        id: listId,
                        ...listSnap.val(),
                    });
                }
                setLists(sortListsByCreatedDate(loadedLists));
            } catch (error) {
                console.error("Failed to load grocery lists:", error);
            } finally {
                setIsLoadingLists(false);
            }
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [user]);

    const handleSignOut = async () => {
        await fbauth.signOut(auth);
    };

    async function addList() {
        if (!user) return;
        const newName = `List-${lists.length + 1}`;

        try {
            const listRef = push(ref(db, `lists`));
            const listId = listRef.key!;
            const newGroceryList: List = {
                name: newName,
                createdAt: Date.now(),
                groceryList: [],
                editors: {
                    [user.uid]: { name: user.displayName || "" },
                } as Record<string, { name: string }>,
                createdBy: user.uid,
                people: [
                    createNewPerson(user.displayName ? user.displayName : ""),
                ],
                id: listId,
            };
            await set(listRef, newGroceryList);
            await set(ref(db, `users/${user.uid}/lists/${listId}`), true);
            setLists((prev) => sortListsByCreatedDate([...prev, newGroceryList]));
        } catch (error) {
            console.error("Failed to write list:", error);
        }
    }

    async function deleteList(listId: string) {
        if (!user) return;

        try {
            const functions = getFunctions(app);
            const deleteListFn = httpsCallable(functions, "deleteList");
            await deleteListFn({ listId });
            setLists((currentLists) =>
                currentLists.filter((list) => list.id !== listId),
            );
        } catch (err) {
            console.error("Failed to delete list:", err);
            alert("Failed to delete list. Please try again.");
        }
    }

    async function clearLists() {
        if (!user) return;

        try {
            const userListsSnapshot = await get(
                ref(db, `users/${user.uid}/lists`),
            );
            const data = userListsSnapshot.val() || {};
            const listIds = Object.keys(data);

            const functions = getFunctions(app);
            const deleteListFn = httpsCallable(functions, "deleteList");
            const deletePromises = listIds.map((listId) =>
                deleteListFn({ listId }),
            );

            await Promise.all(deletePromises);
            setLists([]);
        } catch (err) {
            console.error("Failed to clear lists:", err);
            alert("Failed to clear lists. Please try again.");
        }
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">Your workspace</p>
                    <h1>Grocery lists</h1>
                    <p className="dashboard-subtitle">
                        Plan a shop, invite your people, and settle up with less
                        effort.
                    </p>
                </div>
                <button
                    className="dashboard-signout-btn"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </header>
            <div className="dashboard-actions">
                <button className="dashboard-new-list-btn" onClick={addList}>
                    <span aria-hidden="true">+</span> New list
                </button>
                <button
                    className="dashboard-clear-lists-btn"
                    onClick={() => {
                        const confirmClear = window.confirm(
                            `Are you sure you want to delete all lists?`,
                        );
                        if (!confirmClear) return;
                        clearLists();
                    }}
                >
                    Clear lists
                </button>
            </div>
            <div className="list-wrapper">
                {isLoadingLists && (
                    <div className="loading-status" role="status" aria-live="polite">
                        <span className="loading-spinner small" aria-hidden="true" />
                        Loading your lists…
                    </div>
                )}
                {!isLoadingLists && lists.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-state-icon" aria-hidden="true">
                            +
                        </span>
                        <h2>Your lists will show up here</h2>
                        <p>Create your first list to get started.</p>
                    </div>
                )}
                <DragDropContext
                    onDragEnd={(result) => {
                        if (!result.destination) return;
                        const reordered = Array.from(lists);
                        const [moved] = reordered.splice(
                            result.source.index,
                            1,
                        );
                        reordered.splice(result.destination.index, 0, moved);
                        setLists(reordered);
                    }}
                >
                    <Droppable droppableId="lists">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {lists.map((list, index) => (
                                    <Draggable
                                        key={list.id}
                                        draggableId={list.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <div
                                                    role="button"
                                                    className="list-card"
                                                    onClick={() =>
                                                        navigate(
                                                            `/grocery-lists/${list.id}`,
                                                        )
                                                    }
                                                >
                                                    <h3>{list.name}</h3>
                                                    <hr></hr>
                                                    <button
                                                        className="list-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                            const confirmDelete =
                                                                window.confirm(
                                                                    `Are you sure you want to delete ${list.name}?`,
                                                                );
                                                            if (!confirmDelete)
                                                                return;

                                                            deleteList(
                                                                lists[index].id,
                                                            );
                                                        }}
                                                    >
                                                        Delete List
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}
