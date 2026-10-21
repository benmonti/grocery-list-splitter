import React, { useEffect, useRef, useState } from "react";
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
const firebaseConfig = {
    apiKey: "AIzaSyBy_J0AN04p13c_WBLzS_s1a1sbEP-eqWM",
    authDomain: "grocery-list-splitter-e22fb.firebaseapp.com",
    databaseURL:
        "https://grocery-list-splitter-e22fb-default-rtdb.firebaseio.com",
    projectId: "grocery-list-splitter-e22fb",
    storageBucket: "grocery-list-splitter-e22fb.firebasestorage.app",
    messagingSenderId: "811064887690",
    appId: "1:811064887690:web:9b4a8dcccf37f648c96073",
    measurementId: "G-S4BEG98357",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = rtdb.getDatabase(app);
export const auth = fbauth.getAuth(app);
const provider = new fbauth.GoogleAuthProvider();

function App(): React.JSX.Element {
    const [user, setUser] = useState<fbauth.User | null>(null);

    const handleGoogleLogin = async () => {
        try {
            // Sign in
            await fbauth.signInWithPopup(auth, provider);

            // Use auth.currentUser (guaranteed by Firebase)
            const currentUser = auth.currentUser;

            if (!currentUser?.email || !currentUser?.uid) return;

            const functions = getFunctions(app);
            const registerEmailFn = httpsCallable(functions, "registerEmail");
            await registerEmailFn({ email: currentUser.email });

            const sanitizedEmail = currentUser.email
                .toLowerCase()
                .replace(/\./g, ",");

            console.log("Logged in as:", currentUser.displayName);
        } catch (err: any) {
            console.error(err.code, err.message);
            alert(err.message);
        }
    };

    useEffect(() => {
        const unsubscribe = fbauth.onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    if (!user) {
        return (
            <main className="login-page">
                <div className="login-card" id="login">
                    <div className="brand-mark" aria-hidden="true">
                        GS
                    </div>
                    <p className="eyebrow">Grocery List Splitter</p>
                    <h1>Make every shared shop simpler.</h1>
                    <p className="login-description">
                        Keep items, prices, and everyone&apos;s share in one
                        calm, easy-to-use place.
                    </p>
                    <button className="google-login-button" onClick={handleGoogleLogin}>
                        <img
                            src={`${import.meta.env.BASE_URL}google-logo.png`}
                            alt=""
                        />
                        Continue with Google
                    </button>
                    <p className="login-note">Simple splitting for shared lists.</p>
                </div>
            </main>
        );
    } else {
        return (
            <HashRouter>
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/grocery-lists" replace />}
                    />
                    <Route
                        path="/grocery-lists"
                        element={<Dashboard user={user} />}
                    />
                    <Route
                        path="/grocery-lists/:listId"
                        element={<ReceiptSplitter user={user} />}
                    />
                </Routes>
            </HashRouter>
        );
    }
}

export default App;
