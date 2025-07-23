import React, {useEffect} from 'react';
import { useParams } from 'react-router-dom';

import {db} from "./firebase";
import {doc, setDoc} from "firebase/firestore";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Add = (props) => {
    const urlParams = useParams();

    useEffect(() => {
        if (urlParams) {
            // console.log(urlParams);
            const auth = getAuth();
            // The password only comes from the API client and is passed through to Firestore to be checked
            signInWithEmailAndPassword(auth, process.env.REACT_APP_authEmail, urlParams.apiKey)
              .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // console.log(user);
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
              });

            const thisYear = urlParams.year;
            const collRef = `years/${thisYear}/players`;
            const docID = urlParams.nameLast + urlParams.nameFirst + urlParams.position + urlParams.team + thisYear;
            // console.log(collRef);
            setDoc(doc(db, collRef, docID), {
                franchise: urlParams.franchise,
                nameLast: urlParams.nameLast,
                nameFirst: urlParams.nameFirst,
                position: urlParams.position,
                combined_position: (urlParams.position === "WR" || urlParams.position === "TE") ? 
                                    "WRTE" : urlParams.position,
                team: urlParams.team,
                salary: Number(urlParams.salary),
                rating: Number(urlParams.rating),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString('en-US'),   
                year: thisYear    
                })
            }
      }, [urlParams])

    return (
        <div id="Add">
            <h1>Adding Player</h1>
            <p>the parameters are:
            <ul>
            <li>{urlParams.year}</li>
            <li>{urlParams.franchise}</li>
            <li>{urlParams.nameLast}</li>
            <li>{urlParams.nameFirst}</li>
            <li>{urlParams.position}</li>
            <li>{urlParams.team}</li>
            <li>{urlParams.salary}</li>
            <li>{urlParams.rating}</li>
            </ul>
        </p>
        </div>
    
    )
}

export default Add;