import { Item } from "./item";
import { Person } from "./people";

export function getTotals(people: Person[] = [], newGroceryList: Item[] = []) {
    // make sure we never reduce undefined
    function calculateSplitsHelper(groceryItem: Item) {
        const choices =
            Array.isArray(groceryItem.people) ? groceryItem.people : [];

        let peopleSplitting = choices.reduce(
            (acc: number, choice: boolean) => (choice ? acc + 1 : acc),
            0,
        );

        let pricePerPerson =
            peopleSplitting ? groceryItem.price / peopleSplitting : 0;

        return pricePerPerson;
    }

    function calculateSplits(groceryListSafe: Item[], peopleSafe: Person[]) {
        return peopleSafe.map((person: Person, personIndex: number) => {
            let personTotal = groceryListSafe.reduce(
                (acc: number, item: Item) =>
                    Array.isArray(item.people) && item.people[personIndex] ?
                        acc + calculateSplitsHelper(item)
                    :   acc,
                0,
            );
            return { ...person, total: personTotal };
        });
    }

    return calculateSplits(newGroceryList, people);
}
