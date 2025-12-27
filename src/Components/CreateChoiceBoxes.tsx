import { ChangeEvent, useEffect, useState } from "react";
import { Item } from "../interfaces/item";
import { copyGroceryList } from "../interfaces/groceryList";
import { Person } from "../interfaces/people";
import { getTotals } from "../interfaces/useCalculateSplits";
import * as fbauth from "firebase/auth";
import { onValue, ref } from "@firebase/database";
import { db } from "../App";

export function CreateChoiceBoxes({
    groceryList,
    setGroceryList,
    groceryItemIndex,
    people,
    setPeople,
    index,
    user,
    listId,
}: {
    groceryList: Item[];
    setGroceryList: (newList: Item[]) => void;
    groceryItemIndex: number;
    people: Person[];
    setPeople: (newPeople: Person[]) => void;
    index: number;
    user: fbauth.User | null;
    listId: string | undefined;
}) {
    const [userAllowed, setUserAllowed] = useState<boolean>(false);

    useEffect(() => {
        if (!listId) return alert("List not found");
        if (!user) return alert("Please sign in to edit");

        const listRef = ref(db, `lists/${listId}`);

        const unsubscribe = onValue(listRef, async (snap) => {
            const data = snap.val();
            const editorsObj = data.editors || {};
            const editorUids: string[] = Object.keys(editorsObj);
            const intendedUid = editorUids[index];
            if (!intendedUid) return alert("User not found");

            setUserAllowed(user.uid === intendedUid);

            return () => unsubscribe();
        });
    }, [user, listId, index]);

    function handleClick(e: ChangeEvent<HTMLInputElement>) {
        if (!userAllowed) return alert("Cannot edit other for user");
        let newGroceryList = copyGroceryList(groceryList);
        let personIndex = parseInt(e.target.value);
        let groceryItemCopy = newGroceryList[groceryItemIndex];
        groceryItemCopy.people[personIndex] =
            !groceryItemCopy.people[personIndex];
        setGroceryList(newGroceryList);
        setPeople(getTotals(people, newGroceryList));
    }

    return (
        <>
            <input
                className="table-choice"
                type="checkbox"
                onChange={handleClick}
                checked={groceryList[groceryItemIndex].people[index]}
                value={index}
                style={{ width: "25px", height: "25px" }}
                disabled={!userAllowed}
            />
        </>
    );
}
