import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { copyGroceryList } from "../interfaces/groceryList";
import { createNewItem } from "../interfaces/item";
export function TextInputAndButton(_a) {
    var groceryList = _a.groceryList, setGroceryList = _a.setGroceryList, people = _a.people;
    var _b = useState(""), newItem = _b[0], setNewItem = _b[1];
    function notInList(newItem) {
        var groceryListNames = groceryList.map(function (item) { return item.name; });
        if (!groceryListNames.includes(newItem)) {
            return true;
        }
        return false;
    }
    function addItem(newItem) {
        if (newItem !== "") {
            if (notInList(newItem)) {
                var newGroceryList = copyGroceryList(groceryList);
                newGroceryList.push(createNewItem(newItem, 0, people.length));
                setGroceryList(newGroceryList);
                setNewItem("");
            }
            else {
                alert("Item already in list");
                setNewItem("");
            }
        }
    }
    function handleKeyDown(e) {
        if (e.key === "Enter") {
            addItem(newItem);
        }
    }
    return (_jsxs("span", { children: [_jsx("input", { type: "text", value: newItem, onChange: function (e) {
                    setNewItem(e.target.value);
                }, onKeyDown: handleKeyDown, placeholder: "Input Item Here" }), _jsx("button", { onClick: function () {
                    addItem(newItem.trim());
                }, children: "Submit" })] }));
}
