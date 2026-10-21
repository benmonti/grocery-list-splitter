import { useState } from "react";
import { List } from "../interfaces/groceryList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as fbauth from "firebase/auth";
import { db, auth } from "../App";
import { useNavigate } from "react-router-dom";
import { get, onValue, push, ref, set } from "firebase/database";
import { useEffect } from "react";
import { createNewPerson } from "../interfaces/people";

export function Dashboard({ user }: { user: fbauth.User | null }) {
    const [lists, setLists] = useState<List[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const navigate = useNavigate();

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    useEffect(() => {
        if (!user) return;

        async function delay() {
            await sleep(5000);
        }

        const userListsRef = ref(db, `users/${user.uid}/lists`);

        const unsubscribe = onValue(userListsRef, async (snapshot) => {
            const data = snapshot.val() || {};
            if (!data) {
                setLists([]);
                return;
            }

            const listIds: string[] = Object.keys(data);
            if (listIds.length === 0) {
                setLists([]);
                return;
            }

            const loadedLists: List[] = [];
            for (const listId of listIds) {
                const listSnap = await get(ref(db, `lists/${listId}`));
                if (!listSnap.exists() || listSnap.val() === null) {
                    // optionally clean up the orphan reference
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
            setLists(loadedLists);
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [user, refreshKey]);

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
            setLists((prev) => [...prev, { ...newGroceryList }]);
        } catch (error) {
            console.error("Failed to write list:", error);
        }
    }

    async function deleteList(listId: string) {
        if (!user) return;

        try {
            // Remove the list from Firebase
            await Promise.all([
                set(ref(db, `lists/${listId}`), null),
                set(ref(db, `users/${user.uid}/lists/${listId}`), null),
            ]);
        } catch (err) {
            console.error("Failed to delete list:", err);
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

            const deletePromises = listIds.map((listId) =>
                Promise.all([
                    set(ref(db, `lists/${listId}`), null),
                    set(ref(db, `users/${user.uid}/lists/${listId}`), null),
                ]),
            );

            await Promise.all(deletePromises);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            console.error("Failed to clear lists:", err);
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
                {lists.length === 0 && (
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
