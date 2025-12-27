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
import { useEffect, useState } from "react";
import "./App.css";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { initializeApp } from "firebase/app";
import * as rtdb from "firebase/database";
import * as fbauth from "firebase/auth";
import { ReceiptSplitter } from "./Components/ReceiptSplitter";
import { Dashboard } from "./Components/Dashboard";
import { getFunctions, httpsCallable } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBy_J0AN04p13c_WBLzS_s1a1sbEP-eqWM",
    authDomain: "grocery-list-splitter-e22fb.firebaseapp.com",
    databaseURL: "https://grocery-list-splitter-e22fb-default-rtdb.firebaseio.com",
    projectId: "grocery-list-splitter-e22fb",
    storageBucket: "grocery-list-splitter-e22fb.firebasestorage.app",
    messagingSenderId: "811064887690",
    appId: "1:811064887690:web:9b4a8dcccf37f648c96073",
    measurementId: "G-S4BEG98357",
};
// Initialize Firebase
export var app = initializeApp(firebaseConfig);
export var db = rtdb.getDatabase(app);
export var auth = fbauth.getAuth(app);
var provider = new fbauth.GoogleAuthProvider();
function App() {
    var _this = this;
    var _a = useState(null), user = _a[0], setUser = _a[1];
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, functions, registerEmailFn, sanitizedEmail, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Sign in
                    return [4 /*yield*/, fbauth.signInWithPopup(auth, provider)];
                case 1:
                    // Sign in
                    _a.sent();
                    currentUser = auth.currentUser;
                    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || !(currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid))
                        return [2 /*return*/];
                    functions = getFunctions(app);
                    registerEmailFn = httpsCallable(functions, "registerEmail");
                    return [4 /*yield*/, registerEmailFn({ email: currentUser.email })];
                case 2:
                    _a.sent();
                    sanitizedEmail = currentUser.email
                        .toLowerCase()
                        .replace(/\./g, ",");
                    console.log("Logged in as:", currentUser.displayName);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1.code, err_1.message);
                    alert(err_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        var unsubscribe = fbauth.onAuthStateChanged(auth, function (u) {
            setUser(u);
        });
        return function () { return unsubscribe(); };
    }, []);
    if (!user) {
        return (_jsxs("div", { id: "login", style: { justifySelf: "center", marginTop: "20%" }, children: [_jsx("h1", { style: { justifySelf: "center" }, children: "Welcome back!" }), _jsxs("button", { onClick: handleGoogleLogin, style: {
                        width: "200px",
                        height: "50px",
                        marginLeft: "6%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "17px",
                        borderRadius: "15px",
                    }, children: [_jsx("img", { src: "/google-logo.png", alt: "Google", style: {
                                width: "10%",
                                height: "40%",
                                marginRight: "10px",
                            } }), "Login With Google"] })] }));
    }
    else {
        return (_jsx(HashRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/grocery-lists", replace: true }) }), _jsx(Route, { path: "/grocery-lists", element: _jsx(Dashboard, { user: user }) }), _jsx(Route, { path: "/grocery-lists/:listId", element: _jsx(ReceiptSplitter, { user: user }) })] }) }));
    }
}
export default App;
