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
import { useRef } from "react";
import { BACKEND_URL } from "../url";
export function UploadReciept(_a) {
    var groceryList = _a.groceryList, setGroceryList = _a.setGroceryList;
    var fileInputRef = useRef(null);
    function handleButtonClick() {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); // trigger the hidden file input
    }
    function toBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.readAsDataURL(file); // converts to base64
            reader.onload = function () { return resolve(reader.result); };
            reader.onerror = function (error) { return reject(error); };
        });
    }
    function extractJsonArray(text) {
        // look for the first `[` and the last `]`
        var start = text.indexOf("[");
        var end = text.lastIndexOf("]");
        if (start === -1 || end === -1) {
            return null;
        }
        return text.slice(start, end + 1);
    }
    function uploadRecieptToGemini(event) {
        return __awaiter(this, void 0, void 0, function () {
            var file, base64Image, res, data, aiText, jsonString, newGroceryList;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                        if (!file)
                            return [2 /*return*/];
                        return [4 /*yield*/, toBase64(file)];
                    case 1:
                        base64Image = _b.sent();
                        return [4 /*yield*/, fetch("".concat(BACKEND_URL, "/api/proxy-generate"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ image: base64Image }),
                            })];
                    case 2:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 3:
                        data = _b.sent();
                        // 🔍 LOG THE FULL BACKEND RESPONSE
                        console.log("FULL BACKEND RESPONSE:", data);
                        aiText = (data === null || data === void 0 ? void 0 : data.message) || "No AI Response";
                        jsonString = extractJsonArray(aiText);
                        if (!jsonString) {
                            alert("AI response did not contain a JSON array");
                            return [2 /*return*/];
                        }
                        // 🔍 LOG EXACTLY WHAT YOU PARSE
                        console.log("AI TEXT (raw):", aiText);
                        newGroceryList = [];
                        try {
                            newGroceryList = JSON.parse(jsonString);
                        }
                        catch (err) {
                            console.error("AI returned invalid JSON:", jsonString);
                            alert("Failed to parse AI response. Response: " + jsonString);
                            return [2 /*return*/];
                        }
                        setGroceryList(newGroceryList);
                        return [2 /*return*/];
                }
            });
        });
    }
    return (_jsxs("div", { children: [_jsx("button", { type: "button", onClick: handleButtonClick, className: "upload-receipt-button", children: "Upload Reciept" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: uploadRecieptToGemini, style: { display: "none" } })] }));
}
