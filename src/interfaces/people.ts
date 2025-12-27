export interface Person {
    total: number;
    name: string;
}

export function createNewPerson(name?: string) {
    return { name: name ? name : "", total: 0 };
}
