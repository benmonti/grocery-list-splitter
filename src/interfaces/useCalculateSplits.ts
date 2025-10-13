import { Item } from "./item";
import { Person } from "./people";

export function getTotals(people: Person[], newGroceryList: Item[]) {
    function calculateSplitsHelper(groceryItem: Item) {
        let peopleSplitting: number = groceryItem.people.reduce(
            (accumulator: number, choice: boolean) =>
                choice ? accumulator + 1 : accumulator,
            0,
        );
        let pricePerPerson: number =
            peopleSplitting ? groceryItem.price / peopleSplitting : 0;
        return pricePerPerson;
    }

    function calculateSplits(newGroceryList: Item[], people: Person[]) {
        let newPeople: Person[] = people.map(
            (person: Person, personIndex: number) => {
                let personTotal = newGroceryList.reduce(
                    (accumulator: number, item: Item) =>
                        item.people[personIndex] ?
                            accumulator + calculateSplitsHelper(item)
                        :   accumulator,
                    0,
                );
                return { ...person, total: personTotal };
            },
        );
        return newPeople;
    }

    return calculateSplits(newGroceryList, people);
}
