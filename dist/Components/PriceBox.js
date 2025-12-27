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
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { copyGroceryList } from "../interfaces/groceryList";
import { getTotals } from "../interfaces/useCalculateSplits";
export function PriceBox(_a) {
    var groceryList = _a.groceryList, setGroceryList = _a.setGroceryList, groceryItem = _a.groceryItem, priceRef = _a.priceRef, priceRefs = _a.priceRefs, people = _a.people, setPeople = _a.setPeople;
    var _b = useState(groceryItem.price ? groceryItem.price.toFixed(2) : ""), priceText = _b[0], setPriceText = _b[1];
    function isCorrectPrice(text) {
        if (!Number.isNaN(Number(text))) {
            return true;
        }
        return false;
    }
    function setPriceHelper(priceString) {
        if (isCorrectPrice(priceString) && priceString !== "") {
            var priceNum = Math.round(parseFloat(priceString) * 100) / 100;
            var newGroceryList = copyGroceryList(groceryList);
            var copyItem = __assign({}, groceryItem);
            copyItem.price = priceNum;
            var itemIndex = newGroceryList.findIndex(function (item) { return item.name === groceryItem.name; });
            newGroceryList[itemIndex] = copyItem;
            setGroceryList(newGroceryList);
            setPeople(getTotals(people, newGroceryList));
            setPriceText(priceNum.toFixed(2));
        }
        else {
            setPriceText("");
        }
    }
    function handleBlur(e) {
        setPriceHelper(e.target.value);
        if (!isCorrectPrice(e.target.value)) {
            alert("Enter a price");
        }
    }
    function handleChange(e) {
        setPriceText(e.target.value);
    }
    function handleKeyDown(e) {
        if (e.key === "Escape") {
            e.target.blur();
            setPriceHelper(priceText);
        }
        if (e.key === "Tab" || e.key === "Enter") {
            e.preventDefault();
            setPriceHelper(priceText);
            var refsArray = priceRefs === null || priceRefs === void 0 ? void 0 : priceRefs.current;
            if (!refsArray)
                return;
            var currentIndex = refsArray.findIndex(function (el) { return el === e.target; });
            var next = refsArray[currentIndex + 1];
            if (next)
                next.focus();
        }
    }
    return (_jsx("input", { ref: priceRef ? priceRef : null, type: "text", value: priceText, onBlur: handleBlur, onKeyDown: handleKeyDown, style: {
            height: "28px",
            width: "100px",
            fontSize: "calc(5px + 2vmin)",
        }, onChange: handleChange }));
}
