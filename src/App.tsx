import React, { useRef, useState } from "react";
import "./App.css";
import { ChoosePeopleSlider } from "./Components/ChoosePeopleSlider";
import { TextInputAndButton } from "./Components/TextInputAndButton";
import { ItemEntry } from "./Components/ItemEntry";
import { CreateChoiceBoxes } from "./Components/CreateChoiceBoxes";
import { PriceBox } from "./Components/PriceBox";
import { Item } from "./interfaces/item";
import { Person } from "./interfaces/people";
import { UploadReciept } from "./Components/UploadReciept";

import { initializeApp } from "firebase/app";
import * as rtdb from "firebase/database";
import * as fbauth from "firebase/auth";
import { Dashboard } from "./Components/Dashboard";

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

    return <Dashboard></Dashboard>;
}

export default App;
