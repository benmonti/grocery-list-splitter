import { useState } from "react";
import { List } from "../interfaces/groceryList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as fbauth from "firebase/auth";
import { db, auth } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import { get, onValue, push, ref, set } from "firebase/database";
import { useEffect } from "react";
import { createNewPerson } from "../interfaces/people";

export function Dashboard({ user }: { user: fbauth.User | null }) {
    const [lists, setLists] = useState<List[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const userListsRef = ref(db, `users/${user.uid}/lists`);

        const unsubscribe = onValue(userListsRef, async (snapshot) => {
            const data = snapshot.val() || {};
            const listIds: string[] = Object.keys(data);
            if (listIds.length === 0) {
                setLists([]);
                return;
            }
            const loadedLists: List[] = [];
            for (const listId of listIds) {
                const listSnap = await get(ref(db, `lists/${listId}`));
                if (listSnap.exists()) {
                    loadedLists.push({
                        id: listId,
                        ...listSnap.val(),
                    });
                }
            }
            setLists(loadedLists);
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
        const newGroceryList = {
            name: newName,
            groceryList: [],
            editors: { [user.uid]: { name: user.displayName || "" } } as Record<
                string,
                { name: string }
            >,
            createdBy: user.uid,
            people: [createNewPerson(user.displayName ? user.displayName : "")],
        };

        try {
            const listRef = push(ref(db, `lists`));
            const listId = listRef.key!;
            await set(listRef, newGroceryList);
            await set(ref(db, `users/${user.uid}/lists/${listId}`), true);
            setLists((prev) => [...prev, { id: listId, ...newGroceryList }]);
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
            const userListsRef = ref(db, `users/${user.uid}/lists`);

            const unsubscribe = onValue(userListsRef, async (snapshot) => {
                const data = snapshot.val() || {};
                const listIds: string[] = Object.keys(data);
                for (const listId in listIds) {
                    await Promise.all([
                        set(ref(db, `lists/${listId}`), null),
                        set(ref(db, `users/${user.uid}/lists/${listId}`), null),
                    ]);
                }
                return () => unsubscribe();
            });
        } catch (err) {
            console.error("Failed to clear lists:", err);
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-signout-container">
                <button
                    className="dashboard-signout-btn"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
            <div
                className="dashboard-buttons-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                }}
            >
                <div className="dashboard-new-list-btn" onClick={addList}>
                    New List
                </div>
                <div className="dashboard-clear-lists-btn" onClick={clearLists}>
                    Clear Lists
                </div>
            </div>
            <div className="list-wrapper">
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
                                                            deleteList(
                                                                lists[index].id,
                                                            );
                                                            e.stopPropagation();
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
