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
export function getTotals(people, newGroceryList) {
    if (people === void 0) { people = []; }
    if (newGroceryList === void 0) { newGroceryList = []; }
    // make sure we never reduce undefined
    function calculateSplitsHelper(groceryItem) {
        var choices = Array.isArray(groceryItem.people) ? groceryItem.people : [];
        var peopleSplitting = choices.reduce(function (acc, choice) { return (choice ? acc + 1 : acc); }, 0);
        var pricePerPerson = peopleSplitting ? groceryItem.price / peopleSplitting : 0;
        return pricePerPerson;
    }
    function calculateSplits(groceryListSafe, peopleSafe) {
        return peopleSafe.map(function (person, personIndex) {
            var personTotal = groceryListSafe.reduce(function (acc, item) {
                return Array.isArray(item.people) && item.people[personIndex] ?
                    acc + calculateSplitsHelper(item)
                    : acc;
            }, 0);
            return __assign(__assign({}, person), { total: personTotal });
        });
    }
    return calculateSplits(newGroceryList, people);
}
