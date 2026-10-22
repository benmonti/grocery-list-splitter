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
import { useState, useRef, useEffect } from "react";
import { createNewPerson } from "../interfaces/people";
import { CreateChoiceBoxes } from "./CreateChoiceBoxes";
import { ItemEntry } from "./ItemEntry";
import { PriceBox } from "./PriceBox";
import { TextInputAndButton } from "./TextInputAndButton";
import { UploadReciept } from "./UploadReciept";
import { app, db } from "../App";
import { onValue, ref, set } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getTotals } from "../interfaces/useCalculateSplits";
function formatDistinctNames(profiles) {
    var parsedProfiles = profiles.map(function (profile) {
        var nameParts = profile.name.trim().split(/\s+/).filter(Boolean);
        var firstName = nameParts[0] || "Person";
        var lastName = nameParts.length > 1 ? nameParts.at(-1) : "";
        return {
            firstName: firstName,
            lastName: lastName,
            email: profile.email,
        };
    });
    var prefixLengths = parsedProfiles.map(function (profile) {
        return profile.lastName ? 1 : 0;
    });
    var hasDuplicate = true;
    var _loop_1 = function () {
        var labels = parsedProfiles.map(function (profile, index) {
            var prefixLength = prefixLengths[index];
            return profile.lastName ?
                "".concat(profile.firstName, " ").concat(profile.lastName.slice(0, prefixLength))
                : profile.firstName;
        });
        var duplicateLabels = new Set(labels.filter(function (label, index) { return labels.indexOf(label) !== index; }));
        hasDuplicate = duplicateLabels.size > 0;
        var increasedPrefix = false;
        duplicateLabels.forEach(function (label) {
            labels.forEach(function (currentLabel, index) {
                if (currentLabel === label &&
                    prefixLengths[index] < parsedProfiles[index].lastName.length) {
                    prefixLengths[index] += 1;
                    increasedPrefix = true;
                }
            });
        });
        if (hasDuplicate && !increasedPrefix) {
            return "break";
        }
    };
    while (hasDuplicate) {
        var state_1 = _loop_1();
        if (state_1 === "break")
            break;
    }
    return parsedProfiles.map(function (profile, index) {
        var prefixLength = prefixLengths[index];
        var name = profile.lastName ?
            "".concat(profile.firstName, " ").concat(profile.lastName.slice(0, prefixLength))
            : profile.firstName;
        var duplicateName = parsedProfiles.filter(function (other) {
            return other.firstName === profile.firstName &&
                other.lastName === profile.lastName;
        }).length > 1;
        if (duplicateName && profile.email) {
            return "".concat(name, " (").concat(profile.email.split("@")[0], ")");
        }
        return name;
    });
}
export function ReceiptSplitter(_a) {
    var _this = this;
    var user = _a.user;
    var _b = useState([]), groceryList = _b[0], setGroceryList = _b[1];
    var _c = useState(""), title = _c[0], setTitle = _c[1];
    // const { state } = useLocation();
    // const initialList: List = state?.list;
    var _d = useState([]), people = _d[0], setPeople = _d[1];
    var _e = useState(false), showShareForm = _e[0], setShowShareForm = _e[1];
    var _f = useState(""), shareSearch = _f[0], setShareSearch = _f[1];
    var _g = useState([]), shareSuggestions = _g[0], setShareSuggestions = _g[1];
    var _h = useState([]), selectedPeople = _h[0], setSelectedPeople = _h[1];
    var _j = useState([]), listMembers = _j[0], setListMembers = _j[1];
    var _k = useState(false), isSearchingPeople = _k[0], setIsSearchingPeople = _k[1];
    var _l = useState(null), shareStatus = _l[0], setShareStatus = _l[1];
    var _m = useState(false), isEditingTitle = _m[0], setIsEditingTitle = _m[1];
    var _o = useState(true), isLoadingList = _o[0], setIsLoadingList = _o[1];
    var listId = useParams().listId;
    var hasLoaded = useRef(false);
    var loadingListId = useRef(undefined);
    var navigate = useNavigate();
    var profileCache = useRef({});
    useEffect(function () {
        if (!user || !listId) {
            setIsLoadingList(false);
            return;
        }
        if (loadingListId.current !== listId) {
            loadingListId.current = listId;
            hasLoaded.current = false;
            setIsLoadingList(true);
        }
        var listRef = ref(db, "lists/".concat(listId));
        var isActive = true;
        // Live updates
        var unsubscribe = onValue(listRef, function (snap) { return __awaiter(_this, void 0, void 0, function () {
            var data, listName, newList, editorsObj_1, editorUids, peoplePromises, profiles, displayNames_1, newPeople, error_1;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        data = snap.val();
                        listName = "List-".concat(Date.now());
                        if (!!data) return [3 /*break*/, 2];
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
                        return [4 /*yield*/, set(listRef, newList)];
                    case 1:
                        _b.sent();
                        setGroceryList([]);
                        setPeople([
                            {
                                name: user.displayName || "",
                                total: 0,
                            },
                        ]);
                        setListMembers([
                            {
                                uid: user.uid,
                                name: user.displayName || "",
                                email: user.email || "",
                            },
                        ]);
                        return [3 /*break*/, 4];
                    case 2:
                        setGroceryList(Array.isArray(data.groceryList) ? data.groceryList : []);
                        listName = data.name;
                        editorsObj_1 = data.editors || {};
                        editorUids = Object.keys(editorsObj_1);
                        peoplePromises = editorUids.map(function (uid) { return __awaiter(_this, void 0, void 0, function () {
                            var profile, profileData, err_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        profile = {
                                            name: ((_a = editorsObj_1[uid]) === null || _a === void 0 ? void 0 : _a.name) || "",
                                            email: "",
                                        };
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 5, , 6]);
                                        if (!profileCache.current[uid]) return [3 /*break*/, 2];
                                        profile = profileCache.current[uid];
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, getUserProfile(uid)];
                                    case 3:
                                        profileData = _b.sent();
                                        if (profileData) {
                                            profileCache.current[uid] = profileData; // cache it
                                            profile = profileData;
                                        }
                                        _b.label = 4;
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        err_1 = _b.sent();
                                        console.error("Profile fetch failed for uid", uid, err_1);
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/, __assign({ uid: uid }, profile)];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(peoplePromises)];
                    case 3:
                        profiles = _b.sent();
                        displayNames_1 = formatDistinctNames(profiles);
                        setListMembers(profiles.map(function (profile, index) { return (__assign(__assign({}, profile), { name: displayNames_1[index] })); }));
                        newPeople = profiles.map(function (profile, index) { return ({
                            name: displayNames_1[index],
                            total: 0,
                        }); });
                        newPeople = getTotals(newPeople, data.groceryList);
                        setPeople(newPeople);
                        _b.label = 4;
                    case 4:
                        if (!isEditingTitle)
                            setTitle(listName);
                        hasLoaded.current = true; // mark loaded AFTER onValue fires
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _b.sent();
                        console.error("Failed to load grocery list:", error_1);
                        return [3 /*break*/, 7];
                    case 6:
                        if (isActive)
                            setIsLoadingList(false);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        return function () {
            isActive = false;
            unsubscribe();
        };
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
            var functions, shareListFn, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (selectedPeople.length === 0) {
                            alert("Choose at least one person to share with");
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setShareStatus("Sharing the list…");
                        functions = getFunctions(app);
                        shareListFn = httpsCallable(functions, "shareList");
                        return [4 /*yield*/, shareListFn({
                                listId: listId,
                                invitedUids: selectedPeople.map(function (person) { return person.uid; }),
                            })];
                    case 2:
                        _a.sent();
                        alert("List shared successfully");
                        setShareSearch("");
                        setShareSuggestions([]);
                        setSelectedPeople([]);
                        setShowShareForm(false);
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _a.sent();
                        alert("Failed to share list");
                        console.error("Error sharing list:", err_2);
                        return [3 /*break*/, 5];
                    case 4:
                        setShareStatus(null);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function handleRemoveMember(member) {
        return __awaiter(this, void 0, void 0, function () {
            var functions, removeMemberFn, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!listId || member.uid === (user === null || user === void 0 ? void 0 : user.uid))
                            return [2 /*return*/];
                        if (!window.confirm("Remove ".concat(member.name || member.email, " from this list?"))) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setShareStatus("Removing ".concat(member.name || "person", "\u2026"));
                        functions = getFunctions(app);
                        removeMemberFn = httpsCallable(functions, "removeListMember");
                        return [4 /*yield*/, removeMemberFn({
                                listId: listId,
                                memberUid: member.uid,
                            })];
                    case 2:
                        _a.sent();
                        setListMembers(function (current) {
                            return current.filter(function (currentMember) { return currentMember.uid !== member.uid; });
                        });
                        alert("Person removed from the list");
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to remove list member:", error_2);
                        alert("Failed to remove person from the list");
                        return [3 /*break*/, 5];
                    case 4:
                        setShareStatus(null);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    useEffect(function () {
        var query = shareSearch.trim();
        if (query.length < 2) {
            setShareSuggestions([]);
            return;
        }
        var timer = window.setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var functions, searchUsersFn, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsSearchingPeople(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        functions = getFunctions(app);
                        searchUsersFn = httpsCallable(functions, "searchUsers");
                        return [4 /*yield*/, searchUsersFn({ query: query })];
                    case 2:
                        result = _a.sent();
                        setShareSuggestions(result.data.users.filter(function (person) {
                            return !selectedPeople.some(function (selected) { return selected.uid === person.uid; }) && person.uid !== (user === null || user === void 0 ? void 0 : user.uid);
                        }));
                        return [3 /*break*/, 5];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Failed to search users:", error_3);
                        setShareSuggestions([]);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsSearchingPeople(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 250);
        return function () { return window.clearTimeout(timer); };
    }, [shareSearch, selectedPeople, user]);
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
                                    .toFixed(2) }), people.map(function (person, i) { return (_jsx("div", { className: "footer-person", "data-person": person.name || "Person ".concat(i + 1), children: people[i].total.toFixed(2) }, i)); })] })] }), _jsx("button", { className: "share-list-button", onClick: function () { return setShowShareForm(true); }, children: "Share" }), showShareForm && (_jsxs("div", { className: "share-form share-form-fixed", children: [shareStatus && (_jsxs("div", { className: "share-operation-status", role: "status", children: [_jsx("span", { className: "loading-spinner small", "aria-hidden": "true" }), shareStatus] })), _jsxs("div", { className: "list-members", children: [_jsx("p", { className: "share-section-label", children: "People with access" }), listMembers.map(function (member) { return (_jsxs("div", { className: "list-member", children: [_jsx("span", { className: "suggestion-avatar", children: (member.name || member.email)
                                            .charAt(0)
                                            .toUpperCase() }), _jsxs("span", { className: "list-member-details", children: [_jsx("strong", { children: member.name || "Unnamed user" }), _jsx("small", { children: member.email })] }), member.uid !== (user === null || user === void 0 ? void 0 : user.uid) && (_jsx("button", { type: "button", className: "remove-member-button", onClick: function () {
                                            return handleRemoveMember(member);
                                        }, disabled: Boolean(shareStatus), children: "Remove" }))] }, member.uid)); })] }), _jsxs("div", { className: "share-picker", children: [_jsxs("div", { className: "share-selected", children: [selectedPeople.map(function (person) { return (_jsxs("span", { className: "person-chip", children: [person.name || person.email, _jsx("button", { type: "button", "aria-label": "Remove ".concat(person.name || person.email), onClick: function () {
                                                    return setSelectedPeople(function (current) {
                                                        return current.filter(function (selected) {
                                                            return selected.uid !== person.uid;
                                                        });
                                                    });
                                                }, children: "\u00D7" })] }, person.uid)); }), _jsx("input", { type: "text", placeholder: "Add people by name or email", value: shareSearch, onChange: function (e) { return setShareSearch(e.target.value); } })] }), (isSearchingPeople || shareSuggestions.length > 0) && (_jsxs("div", { className: "share-suggestions", children: [isSearchingPeople && (_jsx("div", { className: "share-suggestion-status", children: "Searching people\u2026" })), shareSuggestions.map(function (person) { return (_jsxs("button", { type: "button", className: "share-suggestion", onClick: function () {
                                            setSelectedPeople(function (current) { return __spreadArray(__spreadArray([], current, true), [
                                                person,
                                            ], false); });
                                            setShareSearch("");
                                            setShareSuggestions([]);
                                        }, children: [_jsx("span", { className: "suggestion-avatar", children: (person.name || person.email)
                                                    .charAt(0)
                                                    .toUpperCase() }), _jsxs("span", { children: [_jsx("strong", { children: person.name || "Unnamed user" }), _jsx("small", { children: person.email })] })] }, person.uid)); })] }))] }), _jsx("button", { onClick: handleShare, disabled: selectedPeople.length === 0 || Boolean(shareStatus), children: "Share" }), _jsx("button", { disabled: Boolean(shareStatus), onClick: function () {
                            setShowShareForm(false);
                            setShareSearch("");
                            setShareSuggestions([]);
                            setSelectedPeople([]);
                        }, children: "Cancel" })] })), _jsx(UploadReciept, { groceryList: groceryList, setGroceryList: setGroceryList }), isLoadingList && (_jsx("div", { className: "loading-overlay", role: "status", "aria-live": "polite", children: _jsxs("div", { className: "loading-card", children: [_jsx("span", { className: "loading-spinner", "aria-hidden": "true" }), _jsx("h2", { children: "Opening your list" }), _jsx("p", { children: "Fetching your items and people so everything is ready to edit." })] }) })), _jsx("span", { className: "dashboard-button", onClick: function () {
                    navigate("/grocery-lists/");
                }, children: "Dashboard" })] }));
}
