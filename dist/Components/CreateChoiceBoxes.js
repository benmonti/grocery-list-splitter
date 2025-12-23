import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { copyGroceryList } from "../interfaces/groceryList";
import { getTotals } from "../interfaces/useCalculateSplits";
export function CreateChoiceBoxes(_a) {
    var groceryList = _a.groceryList, setGroceryList = _a.setGroceryList, groceryItemIndex = _a.groceryItemIndex, people = _a.people, setPeople = _a.setPeople, index = _a.index;
    function handleClick(e) {
        var newGroceryList = copyGroceryList(groceryList);
        var personIndex = parseInt(e.target.value);
        var groceryItemCopy = newGroceryList[groceryItemIndex];
        groceryItemCopy.people[personIndex] =
            !groceryItemCopy.people[personIndex];
        setGroceryList(newGroceryList);
        setPeople(getTotals(people, newGroceryList));
    }
    return (_jsx(_Fragment, { children: _jsx("input", { className: "table-choice", type: "checkbox", onChange: handleClick, checked: groceryList[groceryItemIndex].people[index], value: index, style: { width: "25px", height: "25px" } }) }));
}
