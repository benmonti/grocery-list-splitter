export interface Item {
    name: string;
    price: number;
    people: boolean[];
}

export function createNewItem(name: string, price: number, people: number) {
    let newItem: Item = {
        name: name,
        price: price,
        people: [...Array(people)].map((_, i) => {
            return false;
        }),
    };
    return newItem;
}
