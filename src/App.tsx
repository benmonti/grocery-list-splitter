import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initializeApp } from "firebase/app";
import * as rtdb from "firebase/database";
import * as fbauth from "firebase/auth";
import { ReceiptSplitter } from "./Components/ReceiptSplitter";
import { Dashboard } from "./Components/Dashboard";
import googleLogo from "/Users/benmonti/grocery-list-splitter/Images/google-logo.png";

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
const app = initializeApp(firebaseConfig);
export const db = rtdb.getDatabase(app);
export const auth = fbauth.getAuth(app);
const provider = new fbauth.GoogleAuthProvider();

function App(): React.JSX.Element {
    const [user, setUser] = useState<fbauth.User | null>(null);

    const handleGoogleLogin = async () => {
        try {
            const result = await fbauth.signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Logged in as:", user.displayName);
            // You can write user data to the database if needed
            const uid = user.uid;
            await rtdb.set(rtdb.ref(db, `/users/${uid}/roles/user`), true);
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
            <div id="login" style={{ justifySelf: "center", marginTop: "20%" }}>
                <h1 style={{ justifySelf: "center" }}>Welcome back!</h1>
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: "200px",
                        height: "50px",
                        marginLeft: "6%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "17px",
                        borderRadius: "15px",
                    }}
                >
                    <img
                        src={googleLogo}
                        alt="Google"
                        style={{
                            width: "10%",
                            height: "40%",
                            marginRight: "10px",
                        }}
                    ></img>
                    Login With Google
                </button>
            </div>
        );
    } else {
        return (
            <BrowserRouter basename="gocery-list-splitter">
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/grocery-lists" replace />}
                    ></Route>
                    <Route
                        path="/grocery-lists"
                        element={<Dashboard user={user} />}
                    />
                    <Route
                        path="/grocery-lists/:listId"
                        element={<ReceiptSplitter user={user} />}
                    />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
