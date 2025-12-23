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
    function calculateSplitsHelper(groceryItem) {
        var peopleSplitting = groceryItem.people.reduce(function (accumulator, choice) {
            return choice ? accumulator + 1 : accumulator;
        }, 0);
        var pricePerPerson = peopleSplitting ? groceryItem.price / peopleSplitting : 0;
        return pricePerPerson;
    }
    function calculateSplits(newGroceryList, people) {
        var newPeople = people.map(function (person, personIndex) {
            var personTotal = newGroceryList.reduce(function (accumulator, item) {
                return item.people[personIndex] ?
                    accumulator + calculateSplitsHelper(item)
                    : accumulator;
            }, 0);
            return __assign(__assign({}, person), { total: personTotal });
        });
        return newPeople;
    }
    return calculateSplits(newGroceryList, people);
}
