var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export function createNewItem(name, price, people) {
    var newItem = {
        name: name,
        price: price,
        people: __spreadArray([], Array(people), true).map(function (_, i) {
            return false;
        }),
    };
    return newItem;
}
