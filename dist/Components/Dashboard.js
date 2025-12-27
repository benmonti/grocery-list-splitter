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
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as fbauth from "firebase/auth";
import { db, auth } from "../App";
import { useNavigate } from "react-router-dom";
import { get, onValue, push, ref, set } from "firebase/database";
import { useEffect } from "react";
import { createNewPerson } from "../interfaces/people";
export function Dashboard(_a) {
    var _this = this;
    var user = _a.user;
    var _b = useState([]), lists = _b[0], setLists = _b[1];
    var navigate = useNavigate();
    useEffect(function () {
        if (!user)
            return;
        var userListsRef = ref(db, "users/".concat(user.uid, "/lists"));
        var unsubscribe = onValue(userListsRef, function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
            var data, listIds, loadedLists, _i, listIds_1, listId, listSnap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = snapshot.val() || {};
                        listIds = Object.keys(data);
                        if (listIds.length === 0) {
                            setLists([]);
                            return [2 /*return*/];
                        }
                        loadedLists = [];
                        _i = 0, listIds_1 = listIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < listIds_1.length)) return [3 /*break*/, 4];
                        listId = listIds_1[_i];
                        return [4 /*yield*/, get(ref(db, "lists/".concat(listId)))];
                    case 2:
                        listSnap = _a.sent();
                        if (listSnap.exists()) {
                            loadedLists.push(__assign({ id: listId }, listSnap.val()));
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        setLists(loadedLists);
                        return [2 /*return*/];
                }
            });
        }); });
        // Cleanup the listener when the component unmounts
        return function () { return unsubscribe(); };
    }, [user]);
    var handleSignOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fbauth.signOut(auth)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    function addList() {
        return __awaiter(this, void 0, void 0, function () {
            var newName, listRef, listId, newGroceryList_1, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!user)
                            return [2 /*return*/];
                        newName = "List-".concat(lists.length + 1);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        listRef = push(ref(db, "lists"));
                        listId = listRef.key;
                        newGroceryList_1 = {
                            name: newName,
                            groceryList: [],
                            editors: (_a = {},
                                _a[user.uid] = { name: user.displayName || "" },
                                _a),
                            createdBy: user.uid,
                            people: [
                                createNewPerson(user.displayName ? user.displayName : ""),
                            ],
                            id: listId,
                        };
                        return [4 /*yield*/, set(listRef, newGroceryList_1)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, set(ref(db, "users/".concat(user.uid, "/lists/").concat(listId)), true)];
                    case 3:
                        _b.sent();
                        setLists(function (prev) { return __spreadArray(__spreadArray([], prev, true), [__assign({}, newGroceryList_1)], false); });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Failed to write list:", error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function deleteList(listId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Remove the list from Firebase
                        return [4 /*yield*/, Promise.all([
                                set(ref(db, "lists/".concat(listId)), null),
                                set(ref(db, "users/".concat(user.uid, "/lists/").concat(listId)), null),
                            ])];
                    case 2:
                        // Remove the list from Firebase
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Failed to delete list:", err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function clearLists() {
        return __awaiter(this, void 0, void 0, function () {
            var userListsRef, unsubscribe_1;
            var _this = this;
            return __generator(this, function (_a) {
                if (!user)
                    return [2 /*return*/];
                try {
                    userListsRef = ref(db, "users/".concat(user.uid, "/lists"));
                    unsubscribe_1 = onValue(userListsRef, function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
                        var data, listIds, _a, _b, _c, _i, listId;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    data = snapshot.val() || {};
                                    listIds = Object.keys(data);
                                    _a = listIds;
                                    _b = [];
                                    for (_c in _a)
                                        _b.push(_c);
                                    _i = 0;
                                    _d.label = 1;
                                case 1:
                                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                                    _c = _b[_i];
                                    if (!(_c in _a)) return [3 /*break*/, 3];
                                    listId = _c;
                                    return [4 /*yield*/, Promise.all([
                                            set(ref(db, "lists/".concat(listId)), null),
                                            set(ref(db, "users/".concat(user.uid, "/lists/").concat(listId)), null),
                                        ])];
                                case 2:
                                    _d.sent();
                                    _d.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/, function () { return unsubscribe_1(); }];
                            }
                        });
                    }); });
                }
                catch (err) {
                    console.error("Failed to clear lists:", err);
                }
                return [2 /*return*/];
            });
        });
    }
    return (_jsxs("div", { className: "dashboard-container", children: [_jsx("div", { className: "dashboard-signout-container", children: _jsx("button", { className: "dashboard-signout-btn", onClick: handleSignOut, children: "Sign Out" }) }), _jsxs("div", { className: "dashboard-buttons-container", style: {
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                }, children: [_jsx("div", { className: "dashboard-new-list-btn", onClick: addList, children: "New List" }), _jsx("div", { className: "dashboard-clear-lists-btn", onClick: clearLists, children: "Clear Lists" })] }), _jsx("div", { className: "list-wrapper", children: _jsx(DragDropContext, { onDragEnd: function (result) {
                        if (!result.destination)
                            return;
                        var reordered = Array.from(lists);
                        var moved = reordered.splice(result.source.index, 1)[0];
                        reordered.splice(result.destination.index, 0, moved);
                        setLists(reordered);
                    }, children: _jsx(Droppable, { droppableId: "lists", children: function (provided) { return (_jsxs("div", __assign({}, provided.droppableProps, { ref: provided.innerRef, children: [lists.map(function (list, index) { return (_jsx(Draggable, { draggableId: list.id, index: index, children: function (provided) { return (_jsx("div", __assign({ ref: provided.innerRef }, provided.draggableProps, provided.dragHandleProps, { children: _jsxs("div", { role: "button", className: "list-card", onClick: function () {
                                                return navigate("/grocery-lists/".concat(list.id));
                                            }, children: [_jsx("h3", { children: list.name }), _jsx("hr", {}), _jsx("button", { className: "list-delete-btn", onClick: function (e) {
                                                        deleteList(lists[index].id);
                                                        e.stopPropagation();
                                                    }, children: "Delete List" })] }) }))); } }, list.id)); }), provided.placeholder] }))); } }) }) })] }));
}
