import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { copyGroceryList, removeItem, } from "../interfaces/groceryList";
import { getTotals } from "../interfaces/useCalculateSplits";
export function ItemEntry(_a) {
    var groceryList = _a.groceryList, setGroceryList = _a.setGroceryList, groceryItemIndex = _a.groceryItemIndex, people = _a.people, setPeople = _a.setPeople;
    var _b = useState(groceryList[groceryItemIndex].name), itemName = _b[0], setItemName = _b[1];
    function removeItemFromList() {
        var newGroceryList = copyGroceryList(groceryList);
        newGroceryList = removeItem(groceryList, groceryList[groceryItemIndex].name);
        setGroceryList(newGroceryList);
        setPeople(getTotals(people, newGroceryList));
    }
    function handleChange(e) {
        setItemName(e.target.value);
    }
    function setNameHelper(name) {
        var groceryItemNames = groceryList.map(function (item) { return item.name; });
        if (groceryItemNames.includes(name)) {
            setItemName(groceryList[groceryItemIndex].name);
        }
        else {
            var newGroceryList = copyGroceryList(groceryList);
            newGroceryList[groceryItemIndex].name = name;
            setGroceryList(newGroceryList);
        }
    }
    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.target.blur();
            setNameHelper(itemName);
        }
    }
    function handleBlur(e) {
        var groceryItemNames = groceryList.map(function (item) { return item.name; });
        setNameHelper(e.target.value);
        if (groceryItemNames.includes(e.target.value) &&
            e.target.value !== groceryList[groceryItemIndex].name)
            alert("Item already in list");
    }
    return (_jsxs("span", { children: [_jsx("button", { style: {
                    height: "35px",
                    width: "100px",
                    fontSize: "20px",
                }, onClick: function () {
                    removeItemFromList();
                }, children: "Remove" }), "\u00A0", _jsx("input", { value: itemName, style: {
                    height: "28px",
                    width: "100px",
                    fontSize: "calc(1px + 2vmin)",
                    left: "10px",
                }, onChange: handleChange, onBlur: handleBlur, onKeyDown: handleKeyDown })] }));
}
