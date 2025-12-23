var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export function copyGroceryList(groceryList) {
    var newGroceryList = groceryList.map(function (item) {
        return __assign(__assign({}, item), { people: __spreadArray([], item.people, true) });
    });
    return newGroceryList;
}
export function printGroceryList(groceryList) {
    var groceryListString = copyGroceryList(groceryList).join("\n");
    return groceryListString;
}
export function removeItem(groceryList, itemName) {
    var newList = groceryList.filter(function (groceryItem) { return groceryItem.name !== itemName; });
    return newList;
}
export function findItemByName(groceryList, itemName) {
    var item = groceryList.find(function (groceryItem) { return groceryItem.name !== itemName; });
    return item;
}
export function updatePeople(groceryList, numPeople) {
    var newList = groceryList.map(function (item) {
        var newPersonList = __spreadArray([], item.people, true);
        if (newPersonList.length < numPeople) {
            newPersonList.push.apply(newPersonList, Array(numPeople - newPersonList.length).fill(false));
        }
        else if (newPersonList.length > numPeople) {
            newPersonList.splice(numPeople, newPersonList.length - numPeople);
        }
        return __assign(__assign({}, item), { people: newPersonList });
    });
    return newList;
}
