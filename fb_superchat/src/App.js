import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBEoGDDBIOF5ymIy1t1M1x8Km2i0Z5Zwik",
  authDomain: "fir-chat-app-62328.firebaseapp.com",
  databaseURL: "https://console.firebase.google.com/project/fir-chat-app-62328/firestore/data/",
  // databaseURL: "https://fireship-demos.firebaseio.com",
  projectId: "fir-chat-app-62328",
  storageBucket: "fir-chat-app-62328.appspot.com",
  messagingSenderId: "593538237888",
  appId: "1:593538237888:web:d24e4d98b1d14a444e7425",
  measurementId: "G-X3NR5Y4KDH"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
//useAuthState hook returns a user object if user is signed in, else returns null
const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      {/* ternary operator shows chatroom if user is logged in, or sign in if not */}
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
//instantiates a provider and pass it to the method signInWithPopup which triggers popup window when user clicks button 
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  //listens to click event and runs a function called sign in with google
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}
//checks to see if user is a current user & button is clicked to trigger sign out function
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
function ChatRoom() {
//  useRef hook to reference the dummy element to enable autoscroll
  const dummy = useRef();

  //makes a reference to a point where a message is created in the database by calling firestore.collection
  const messagesRef = firestore.collection('messages');
 
  //query for a subset of documents in order of timestamps for message creation for last 25 messages
  const query = messagesRef.orderBy('createdAt').limitToLast(25);

  //listen to updates to data in realtime with useCollectionData hook, returns an array of objects which each object is a chat message in the dastabase and reacts in real time to new messages
  const [messages] = useCollectionData(query, { idField: 'id' });

  //add a stateful value in component called form value with a useState hook to bind 
  const [formValue, setFormValue] = useState('');

  // event handler defined as an async function in the component that takes the event as its argument
  const sendMessage = async (e) => {
   
    // prevents the page from refreshing every time there is a new submission
    e.preventDefault();

    // takes user ID from current user
    const { uid, photoURL } = auth.currentUser;

// creates new document in firestore database that takes a JS object as its argument
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    // resets form value to empty string
    setFormValue('');
    }

    // called when user sends a message to scroll page to newest message
    useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });}, [messages]
    )

  return (<>
  <main>
    {/* loop over each document, for each use a dedicated chat message component with a key prop for msg id and passes the document data as the message prop  */}
    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

{/* enables autoscrolling to the most recent messages with dummy prop*/}
    <div ref={dummy}></div>

    </main>)

{/* way for user to send a message in the UI, listener*/}
<form onSubmit={sendMessage}>

{/* binds state to the form input value, listens for input of user to set change to form value state*/}
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

{/* writes value to firestore */}
      <button type="submit" disabled={!formValue}>🕊️</button>

</form>
    </>)
}
//chatMessage child component, shows actual text by accessing it from the props.message 
function ChatMessage(props) {
  
  const { text, uid, photoURL } = props.message;

  //compares whether message is sent or received by checking user id on firestore document
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  //apply different styling depending on whether message was sent or received
  return (<>
  <div className={`message ${messageClass}`}>
    <img src={photoURL} />
    <p>{text}</p>
    </div>
    </>)
}

export default App;
