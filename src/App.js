import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import your Firebase configuration
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'; // Import Firestore functions

function App() {
  const [dreams, setDreams] = useState([]);
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDescription, setDreamDescription] = useState('');
  const [nickname, setNickname] = useState(''); // Added state for the user's nickname
  const [errorMessage, setErrorMessage] = useState('');

  // Function to fetch dream entries from Firestore
  const fetchDreams = async () => {
    try {
      const dreamsSnapshot = await getDocs(collection(db, 'Journal'));
      const dreamList = [];
      dreamsSnapshot.forEach((doc) => {
        dreamList.push({ id: doc.id, ...doc.data() });
      });
      setDreams(dreamList);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  };

  // Function to add a new dream entry to Firestore
  const addDream = async () => {
    if (!dreamTitle || !dreamDescription) {
      setErrorMessage('Please fill in both fields to add a dream.');
      return;
    }

    try {
      const timestamp = new Date(); // Get the current date and time
      const docRef = await addDoc(collection(db, 'Journal'), {
        title: dreamTitle,
        description: dreamDescription,
        timestamp: timestamp, // Include the timestamp in the entry
        nickname: nickname, // Store the user's nickname with the dream entry
      });

      setDreams([
        ...dreams,
        {
          id: docRef.id,
          title: dreamTitle,
          description: dreamDescription,
          nickname: nickname,
          timestamp: timestamp, // Add the timestamp to the new dream entry
        },
      ]);
      setDreamTitle('');
      setDreamDescription('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding dream:', error);
    }
  };

  // Function to delete a dream entry from Firestore
  const deleteDream = async (dreamId) => {
    try {
      await deleteDoc(doc(db, 'Journal', dreamId));
      setDreams(dreams.filter((dream) => dream.id !== dreamId));
    } catch (error) {
      console.error('Error deleting dream:', error);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-pink-500">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold text-white mb-4">My Dream Journal</h1>

        {/* User's nickname input field */}
        <input
          type="text"
          placeholder="Your Nickname"
          className="border p-3 rounded w-full mb-4"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {/* Dream entry form */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
          <input
            type="text"
            placeholder="Dream Title"
            className="border p-3 rounded w-full"
            value={dreamTitle}
            onChange={(e) => setDreamTitle(e.target.value)}
          />
          <textarea
            placeholder="Dream Description"
            className="border p-3 rounded w-full mt-3"
            value={dreamDescription}
            onChange={(e) => setDreamDescription(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white py-3 px-6 rounded-full w-full mt-3 hover:bg-blue-600 transition-all duration-300"
            onClick={addDream}
          >
            Share Dream
          </button>
          {errorMessage && (
            <p className="text-red-600 mt-2">{errorMessage}</p>
          )}
        </div>

        {/* List of dream entries */}
        <div className="space-y-4">
          {dreams.map((dream) => (
            <div key={dream.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-500">{dream.title}</h2>
                <p className="mt-2 text-gray-600">{dream.description}</p>
                <p className="mt-2 text-gray-500">By: {dream.nickname}</p> {/* Display the user's nickname */}
                <p className="mt-2 text-gray-500"><p className="mt-2 text-gray-500">
  Date: {dream.timestamp.toLocaleString('en-PH')}
</p>
</p> {/* Display the timestamp */}
              </div>
              <button
                className="text-red-600 hover:text-red-800 cursor-pointer"
                onClick={() => deleteDream(dream.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
