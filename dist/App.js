import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import "./App.css";
import { ChoosePeopleSlider } from "./Components/ChoosePeopleSlider";
import { TextInputAndButton } from "./Components/TextInputAndButton";
import { ItemEntry } from "./Components/ItemEntry";
import { CreateChoiceBoxes } from "./Components/CreateChoiceBoxes";
import { PriceBox } from "./Components/PriceBox";
import { UploadReciept } from "./Components/UploadReciept";
function App() {
    var _a = useState([]), groceryList = _a[0], setGroceryList = _a[1];
    var _b = useState([
        { total: 0, name: "" },
        { total: 0, name: "" },
    ]), people = _b[0], setPeople = _b[1];
    var priceRefs = useRef([]);
    return (_jsxs("div", { className: "App", children: [_jsx("span", { className: "set-people", children: _jsx(ChoosePeopleSlider, { people: people, setPeople: setPeople, groceryList: groceryList, setGroceryList: setGroceryList }) }), _jsx("header", { className: "App-input-box", children: _jsx(TextInputAndButton, { groceryList: groceryList, setGroceryList: setGroceryList, people: people }) }), _jsx("h1", { className: "grocery-list-title", children: "Grocery List:" }), _jsxs("div", { className: "App-table", style: { "--num-people": people.length }, children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { className: "header-item", children: "Items" }), _jsx("div", { className: "header-price", children: "Prices" }), people.map(function (person, i) { return (_jsx("div", { className: "header-person", style: {
                                    borderBottom: person.name !== "" ?
                                        "2px solid black"
                                        : "none",
                                }, children: person.name }, i)); })] }), groceryList.map(function (groceryItem, index) { return (_jsxs("div", { className: "table-row", children: [_jsx("div", { className: "table-item", children: _jsx(ItemEntry, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItemIndex: index, people: people, setPeople: setPeople }) }), _jsxs("div", { className: "table-price", children: ["$", _jsx(PriceBox, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItem: groceryItem, priceRef: function (el) {
                                            priceRefs.current[index] = el;
                                        }, priceRefs: priceRefs, people: people, setPeople: setPeople })] }), people.map(function (person, i) { return (_jsx("div", { className: "table-choice", children: _jsx(CreateChoiceBoxes, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItemIndex: index, people: people, setPeople: setPeople, index: i }) }, i)); })] }, groceryItem.name)); }), _jsxs("div", { className: "table-footer", children: [_jsx("div", { className: "footer-label", children: "Totals:" }), _jsx("div", { className: "footer-total-price", children: groceryList
                                    .reduce(function (sum, item) { return sum + (item.price || 0); }, 0)
                                    .toFixed(2) }), people.map(function (person, i) { return (_jsx("div", { className: "footer-person", children: people[i].total.toFixed(2) }, i)); })] })] }), _jsx(UploadReciept, { groceryList: groceryList, setGroceryList: setGroceryList })] }));
}
export default App;
