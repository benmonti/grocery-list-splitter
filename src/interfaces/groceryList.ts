import { Item } from "./item";
import * as fbauth from "firebase/auth";
import { Person } from "./people";

export interface List {
    id: string;
    name: string;
    groceryList: Item[];
    editors: Record<string, { name: string }>;
    createdBy: string;
    people: Person[];
}

export interface groceryListProps {
    /**The list that holds all items on the reciept */
    groceryList: Item[];
    setGroceryList: (newList: Item[]) => void;
}

export function copyLists(lists: List[]) {
    const newLists: List[] = lists.map((list: List) => {
        const newList: List = {
            id: list.id,
            name: list.name,
            groceryList: copyGroceryList(list.groceryList),
            editors: { ...list.editors },
            createdBy: list.createdBy,
            people: [...{ ...list.people }],
        };
        return newList;
    });
    return newLists;
}

export function copyGroceryList(groceryList: Item[]): Item[] {
    const newGroceryList: Item[] = groceryList.map((item: Item) => {
        return {
            ...item,
            people: [...item.people],
        };
    });
    return newGroceryList;
}

export function printGroceryList(groceryList: Item[]) {
    let groceryListString: string = copyGroceryList(groceryList).join("\n");
    return groceryListString;
}

export function removeItem(groceryList: Item[], itemName: string) {
    let newList = groceryList.filter(
        (groceryItem: Item) => groceryItem.name !== itemName,
    );
    return newList;
}

export function findItemByName(groceryList: Item[], itemName: string) {
    let item = groceryList.find(
        (groceryItem: Item) => groceryItem.name !== itemName,
    );
    return item;
}

export function updatePeople(groceryList: Item[], numPeople: number) {
    let newList: Item[] = groceryList.map((item: Item) => {
        let newPersonList: boolean[] = [...item.people];
        if (newPersonList.length < numPeople) {
            newPersonList.push(
                ...Array(numPeople - newPersonList.length).fill(false),
            );
        } else if (newPersonList.length > numPeople) {
            newPersonList.splice(numPeople, newPersonList.length - numPeople);
        }
        return { ...item, people: newPersonList };
    });
    return newList;
}
