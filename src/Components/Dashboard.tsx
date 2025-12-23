import { useState } from "react";
import { copyLists, List } from "../interfaces/groceryList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as fbauth from "firebase/auth";
import { db, auth } from "../App";
import { useNavigate } from "react-router-dom";
import { onValue, push, ref, set } from "firebase/database";
import { useEffect } from "react";

export function Dashboard({ user }: { user: fbauth.User | null }) {
    const [lists, setLists] = useState<List[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const userListsRef = ref(db, `users/${user.uid}/grocery-lists`);

        const unsubscribe = onValue(userListsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Transform the data from Firebase into List[]
                const loadedLists: List[] = Object.keys(data).map((key) => ({
                    name: data[key].name,
                    groceryList: data[key].groceryList || [],
                }));
                setLists(loadedLists);
            } else {
                setLists([]);
            }
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [user]);

    const handleSignOut = async () => {
        await fbauth.signOut(auth);
    };

    async function addList() {
        const newName = `List-${lists.length + 1}`;
        let listsCopy: List[] = [
            ...copyLists(lists),
            { groceryList: [], name: newName },
        ];
        setLists(listsCopy);
        if (user) {
            try {
                const listRef = ref(
                    db,
                    `/users/${user.uid}/grocery-lists/${newName}`,
                );
                await set(listRef, {
                    name: newName,
                });
            } catch (error) {
                console.error("Failed to write list:", error);
            }
        }
    }

    async function deleteList(name: string) {
        if (!user) return;

        try {
            // Remove the list from Firebase
            const listRef = ref(db, `users/${user.uid}/grocery-lists/${name}`);
            await set(listRef, null);

            // Update local state
            setLists((prevLists) =>
                prevLists.filter((list) => list.name !== name),
            );
        } catch (err) {
            console.error("Failed to delete list:", err);
        }
    }

    async function clearLists() {
        if (!user) return;
        try {
            const userListsRef = ref(db, `users/${user.uid}/grocery-lists`);
            await set(userListsRef, null);
            setLists([]);
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
                                        key={list.name}
                                        draggableId={list.name}
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
                                                            `/grocery-lists/${list.name}`,
                                                            {
                                                                state: {
                                                                    name: list.name,
                                                                },
                                                            },
                                                        )
                                                    }
                                                >
                                                    <h3>{list.name}</h3>
                                                    <hr></hr>
                                                    <button
                                                        className="list-delete-btn"
                                                        onClick={(e) => {
                                                            deleteList(
                                                                lists[index]
                                                                    .name,
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
