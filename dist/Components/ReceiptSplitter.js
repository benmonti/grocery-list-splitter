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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { createNewPerson } from "../interfaces/people";
import { CreateChoiceBoxes } from "./CreateChoiceBoxes";
import { ItemEntry } from "./ItemEntry";
import { PriceBox } from "./PriceBox";
import { TextInputAndButton } from "./TextInputAndButton";
import { UploadReciept } from "./UploadReciept";
import { app, db } from "../App";
import { get, onValue, ref, set } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getTotals } from "../interfaces/useCalculateSplits";
export function ReceiptSplitter(_a) {
    var _this = this;
    var user = _a.user;
    var _b = useState([]), groceryList = _b[0], setGroceryList = _b[1];
    var _c = useState(""), title = _c[0], setTitle = _c[1];
    // const { state } = useLocation();
    // const initialList: List = state?.list;
    var _d = useState([]), people = _d[0], setPeople = _d[1];
    var _e = useState(false), showShareForm = _e[0], setShowShareForm = _e[1];
    var _f = useState(""), shareEmail = _f[0], setShareEmail = _f[1];
    var _g = useState(false), isEditingTitle = _g[0], setIsEditingTitle = _g[1];
    var listId = useParams().listId;
    var hasLoaded = useRef(false);
    var navigate = useNavigate();
    var profileCache = useRef({});
    useEffect(function () {
        if (!user || !listId)
            return;
        var listRef = ref(db, "lists/".concat(listId));
        // Live updates
        var unsubscribe = onValue(listRef, function (snap) { return __awaiter(_this, void 0, void 0, function () {
            var data, listName, newList, editorsObj, editorUids, peoplePromises, newPeople;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = snap.val();
                        listName = "List-".concat(Date.now());
                        if (!!data) return [3 /*break*/, 1];
                        newList = {
                            name: listName,
                            groceryList: [],
                            editors: (_a = {},
                                _a[user.uid] = {
                                    name: user.displayName ? user.displayName : "_",
                                },
                                _a),
                            createdBy: user.uid,
                            people: [createNewPerson((user === null || user === void 0 ? void 0 : user.displayName) || "_")],
                            id: listId,
                        };
                        set(listRef, newList);
                        setGroceryList([]);
                        setPeople([
                            {
                                name: user.displayName || "",
                                total: 0,
                            },
                        ]);
                        return [3 /*break*/, 3];
                    case 1:
                        setGroceryList(Array.isArray(data.groceryList) ? data.groceryList : []);
                        listName = data.name;
                        editorsObj = data.editors || {};
                        editorUids = Object.keys(editorsObj);
                        peoplePromises = editorUids.map(function (uid, idx) { return __awaiter(_this, void 0, void 0, function () {
                            var userName, cached, nameArr, profileData, nameArr, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        userName = "_";
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 5, , 6]);
                                        if (!profileCache.current[uid]) return [3 /*break*/, 2];
                                        cached = profileCache.current[uid];
                                        if (cached.name) {
                                            nameArr = cached.name.split(" ");
                                            userName = "".concat(nameArr[0]).concat(nameArr[1] ? " " + nameArr[1][0] + "." : "");
                                        }
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, getUserProfile(uid)];
                                    case 3:
                                        profileData = _a.sent();
                                        if (profileData) {
                                            profileCache.current[uid] = profileData; // cache it
                                            if (profileData.name) {
                                                nameArr = profileData.name.split(" ");
                                                userName = "".concat(nameArr[0]).concat(nameArr[1] ? " " + nameArr[1][0] + "." : "");
                                            }
                                        }
                                        _a.label = 4;
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        err_1 = _a.sent();
                                        console.error("Profile fetch failed for uid", uid, err_1);
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/, {
                                            name: userName,
                                            total: 0,
                                        }];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(peoplePromises)];
                    case 2:
                        newPeople = _b.sent();
                        newPeople = getTotals(newPeople, data.groceryList);
                        setPeople(newPeople);
                        _b.label = 3;
                    case 3:
                        if (!isEditingTitle)
                            setTitle(listName);
                        hasLoaded.current = true; // mark loaded AFTER onValue fires
                        return [2 /*return*/];
                }
            });
        }); });
        return function () { return unsubscribe(); };
    }, [user, listId, isEditingTitle]);
    function getUserProfile(uid) {
        return __awaiter(this, void 0, void 0, function () {
            var idToken, response, profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (user === null || user === void 0 ? void 0 : user.getIdToken())];
                    case 1:
                        idToken = _a.sent();
                        return [4 /*yield*/, fetch("https://us-central1-grocery-list-splitter-e22fb.cloudfunctions.net/getUserProfile?uid=".concat(uid, "&listId=").concat(listId), {
                                method: "GET",
                                headers: {
                                    Authorization: "Bearer ".concat(idToken),
                                    "Content-Type": "application/json",
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Unauthorized or error");
                        return [4 /*yield*/, response.json()];
                    case 3:
                        profile = _a.sent();
                        return [2 /*return*/, profile];
                }
            });
        });
    }
    // Writing local edits
    useEffect(function () {
        if (!user || !listId)
            return;
        if (!hasLoaded.current)
            return;
        var groceryRef = ref(db, "lists/".concat(listId, "/groceryList"));
        var peopleRef = ref(db, "lists/".concat(listId, "/people"));
        set(groceryRef, groceryList).catch(console.error);
        set(peopleRef, people);
    }, [groceryList, user, listId, people]);
    function handleShare() {
        return __awaiter(this, void 0, void 0, function () {
            var sanitizedEmail, emailSnap, invitedUid, functions, shareListFn, profile, nameArr, userName, newPeople, peopleRef, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!shareEmail.includes("@")) {
                            alert("Please enter a valid email");
                            return [2 /*return*/];
                        }
                        console.log("Invite:", shareEmail);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        sanitizedEmail = shareEmail.replace(/\./g, ",");
                        return [4 /*yield*/, get(ref(db, "userEmails/".concat(sanitizedEmail)))];
                    case 2:
                        emailSnap = _a.sent();
                        if (!emailSnap.exists()) {
                            alert("No user found with this email");
                            return [2 /*return*/];
                        }
                        invitedUid = emailSnap.val();
                        functions = getFunctions(app);
                        shareListFn = httpsCallable(functions, "shareList");
                        return [4 /*yield*/, shareListFn({
                                listId: listId,
                                invitedUid: invitedUid,
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, getUserProfile(invitedUid)];
                    case 4:
                        profile = _a.sent();
                        nameArr = profile.name.split(" ");
                        userName = "".concat(nameArr[0]).concat(nameArr[1] ? " " + nameArr[1][0] + "." : "");
                        return [4 /*yield*/, alert("List shared successfully")];
                    case 5:
                        _a.sent();
                        setShareEmail("");
                        setShowShareForm(false);
                        newPeople = people.map(function (person) {
                            return __assign({}, person);
                        });
                        newPeople.push({
                            name: userName ? userName : "_",
                            total: 0,
                        });
                        setPeople(newPeople);
                        peopleRef = ref(db, "lists/".concat(listId, "/people"));
                        set(peopleRef, newPeople);
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        alert("Failed to share list");
                        console.error("Error sharing list:", err_2);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    var priceRefs = useRef([]);
    return (_jsxs("div", { className: "App", children: [_jsx("header", { className: "App-input-box", children: _jsx(TextInputAndButton, { groceryList: groceryList, setGroceryList: setGroceryList, people: people }) }), _jsxs("h1", { className: "list-title", style: { paddingLeft: "170px", cursor: "pointer" }, children: [_jsx("span", { children: "Title: " }), isEditingTitle ?
                        _jsx("input", { type: "text", value: title, autoFocus: true, onChange: function (e) { return setTitle(e.target.value); }, onBlur: function () {
                                setIsEditingTitle(false);
                                if (user && listId) {
                                    var nameRef = ref(db, "lists/".concat(listId, "/name"));
                                    set(nameRef, title);
                                }
                            }, onKeyDown: function (e) {
                                if (e.key === "Enter") {
                                    setIsEditingTitle(false);
                                    if (user && listId) {
                                        var nameRef = ref(db, "lists/".concat(listId, "/name"));
                                        set(nameRef, title);
                                    }
                                }
                            }, className: "title-input" })
                        : _jsx("span", { onClick: function () { return setIsEditingTitle(true); }, className: "title-text", children: title || "Untitled" })] }), _jsxs("div", { className: "App-table", style: { "--num-people": people.length }, children: [_jsxs("div", { className: "table-header", children: [_jsx("div", { className: "header-item", children: "Items" }), _jsx("div", { className: "header-price", children: "Prices" }), people.map(function (person, i) { return (_jsx("div", { className: "header-person", style: {
                                    borderBottom: person.name !== "" ?
                                        "2px solid black"
                                        : "none",
                                }, children: person.name }, i)); })] }), groceryList.map(function (groceryItem, index) { return (_jsxs("div", { className: "table-row", children: [_jsx("div", { className: "table-item", children: _jsx(ItemEntry, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItemIndex: index, people: people, setPeople: setPeople }) }), _jsxs("div", { className: "table-price", children: ["$", _jsx(PriceBox, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItem: groceryItem, priceRef: function (el) {
                                            priceRefs.current[index] = el;
                                        }, priceRefs: priceRefs, people: people, setPeople: setPeople })] }), people.map(function (person, i) { return (_jsx("div", { className: "table-choice", "data-person": person.name || "Person ".concat(i + 1), children: _jsx(CreateChoiceBoxes, { groceryList: groceryList, setGroceryList: setGroceryList, groceryItemIndex: index, people: people, setPeople: setPeople, index: i, user: user, listId: listId }) }, i)); })] }, groceryItem.name)); }), _jsxs("div", { className: "table-footer", children: [_jsx("div", { className: "footer-label", children: "Totals:" }), _jsx("div", { className: "footer-total-price", children: groceryList
                                    .reduce(function (sum, item) { return sum + (item.price || 0); }, 0)
                                    .toFixed(2) }), people.map(function (person, i) { return (_jsx("div", { className: "footer-person", "data-person": person.name || "Person ".concat(i + 1), children: people[i].total.toFixed(2) }, i)); })] })] }), _jsx("button", { className: "share-list-button", onClick: function () { return setShowShareForm(true); }, children: "Share" }), showShareForm && (_jsxs("div", { className: "share-form share-form-fixed", children: [_jsx("input", { type: "email", placeholder: "Enter Email", value: shareEmail, onChange: function (e) { return setShareEmail(e.target.value); }, onKeyDown: function (e) {
                            if (e.key === "Enter") {
                                handleShare();
                                setShareEmail("");
                            }
                        } }), _jsx("button", { onClick: handleShare, children: "Invite" }), _jsx("button", { onClick: function () {
                            setShowShareForm(false);
                            setShareEmail("");
                        }, children: "Cancel" })] })), _jsx(UploadReciept, { groceryList: groceryList, setGroceryList: setGroceryList }), _jsx("span", { className: "dashboard-button", onClick: function () {
                    navigate("/grocery-lists/");
                }, children: "Dashboard" })] }));
}
