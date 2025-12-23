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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { updatePeople } from "../interfaces/groceryList";
var NUM_PER_ROW = 4;
export function ChoosePeopleSlider(_a) {
    var people = _a.people, setPeople = _a.setPeople, groceryList = _a.groceryList, setGroceryList = _a.setGroceryList;
    var _b = useState("2"), textValue = _b[0], setTextValue = _b[1];
    var _c = useState(2), numPeople = _c[0], setNumPeople = _c[1];
    function renderPeopleChange(newNumPeople) {
        var newPeople = people.map(function (person) {
            return __assign({}, person);
        });
        if (newNumPeople > people.length)
            newPeople.push.apply(newPeople, Array(newNumPeople - people.length).fill({
                total: 0,
                name: "",
            }));
        else if (newNumPeople < people.length)
            newPeople.splice(newNumPeople, people.length);
        setPeople(newPeople);
    }
    function updateGroceryList(newNumPeople) {
        if (groceryList.length) {
            var newGroceryList = updatePeople(groceryList, newNumPeople);
            setGroceryList(newGroceryList);
        }
    }
    function handleTextChange() {
        if (!Number.isNaN(Number(textValue)) && textValue !== "") {
            var newVar = Math.max(2, Math.min(8, parseInt(textValue)));
            setNumPeople(newVar);
            setTextValue(newVar.toString());
            updateGroceryList(newVar);
            renderPeopleChange(newVar);
        }
        else {
            alert("Enter a number");
            setTextValue(numPeople.toString());
        }
    }
    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.target.blur();
            handleTextChange();
        }
    }
    function handleBlur(e) {
        if (e.target.value) {
            handleTextChange();
        }
    }
    function handleText(e) {
        setTextValue(e.target.value);
    }
    function changeSlider(e) {
        var newNumPeople = parseInt(e.target.value);
        setNumPeople(newNumPeople);
        renderPeopleChange(newNumPeople);
        setTextValue(e.target.value);
        updateGroceryList(parseInt(e.target.value));
    }
    function handleChange(i, newPerson) {
        var newPeople = people.map(function (person) {
            return __assign({}, person);
        });
        newPeople[i].name = newPerson;
        setPeople(newPeople);
    }
    var chunkArray = function (arr, size) {
        var chunks = [];
        for (var i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };
    return (_jsxs("span", { children: ["Number of People:", _jsx("br", {}), _jsx("input", { type: "range", value: numPeople, min: "2", max: "8", onChange: changeSlider }), _jsx("input", { type: "number", value: textValue, onChange: handleText, onKeyDown: handleKeyDown, onBlur: handleBlur, style: { width: "30px" } }), "\u00A0", _jsx("div", { children: chunkArray(__spreadArray([], Array(numPeople), true), NUM_PER_ROW).map(function (row, rowIndex) { return (_jsx("div", { style: { marginBottom: "8px" }, children: row.map(function (_, i) {
                        var index = rowIndex * NUM_PER_ROW + i;
                        return (_jsx("input", { type: "text", value: people[index].name, style: { marginRight: "8px" }, placeholder: "Name", onChange: function (e) {
                                handleChange(index, e.target.value);
                            } }, index));
                    }) }, rowIndex)); }) })] }));
}
