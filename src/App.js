import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Import your Firebase configuration and auth
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null); // To store the logged-in user
  const [dreams, setDreams] = useState([]);
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDescription, setDreamDescription] = useState('');
  const [nickname, setNickname] = useState('');
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add a function to handle user login with Google
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  // Add a function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchDreams = async () => {
    try {
      const dreamsSnapshot = await getDocs(collection(db, 'Dreams'));
      const dreamList = [];

      for (const doc of dreamsSnapshot.docs) {
        const data = doc.data();

        // Fetch comments for each dream
        const commentsSnapshot = await getDocs(collection(doc.ref, 'Comments'));
        const comments = commentsSnapshot.docs.map((comment) => ({
          id: comment.id,
          ...comment.data(),
        }));

        dreamList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp.toDate(),
          nickname: data.nickname,
          comments: comments,
        });
      }

      setDreams(dreamList);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  };

  const addDream = async () => {
    if (!dreamTitle || !dreamDescription) {
      setErrorMessage('Please fill in both fields to add a dream.');
      return;
    }
  
    try {
      const timestamp = serverTimestamp();
      const docRef = await addDoc(collection(db, 'Dreams'), {
        title: dreamTitle,
        description: dreamDescription,
        timestamp: timestamp,
        nickname: nickname,
      });
  
      // Fetch updated dream list after adding the dream
      fetchDreams();
  
      setDreamTitle('');
      setDreamDescription('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding dream:', error);
      setErrorMessage('Failed to add a dream. Please try again.');
    }
  };
  
  const addComment = async (dreamId) => {
    if (!commentText) {
      setErrorMessage('Please enter a comment.');
      return;
    }

    try {
      const dreamRef = doc(db, 'Dreams', dreamId);
      const commentRef = collection(dreamRef, 'Comments');

      await addDoc(commentRef, {
        text: commentText,
        timestamp: serverTimestamp(),
        nickname: nickname,
      });

      const updatedDreams = dreams.map((dream) =>
        dream.id === dreamId
          ? {
              ...dream,
              comments: [
                ...dream.comments,
                {
                  text: commentText,
                  timestamp: new Date(),
                  nickname: nickname,
                },
              ],
            }
          : dream
      );

      setDreams(updatedDreams);
      setCommentText('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setErrorMessage('Failed to add a comment. Please try again.');
    }
  };

  const deleteComment = async (dreamId, commentId) => {
    try {
      const dreamRef = doc(db, 'Dreams', dreamId);
      const commentRef = doc(collection(dreamRef, 'Comments'), commentId);
      await deleteDoc(commentRef);

      const updatedDreams = dreams.map((dream) =>
        dream.id === dreamId
          ? {
              ...dream,
              comments: dream.comments.filter((comment) => comment.id !== commentId),
            }
          : dream
      );

      setDreams(updatedDreams);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setErrorMessage('Failed to delete the comment. Please try again.');
    }
  };

  const deleteDream = async (dreamId) => {
    try {
      await deleteDoc(doc(db, 'Dreams', dreamId));
      setDreams(dreams.filter((dream) => dream.id !== dreamId));
    } catch (error) {
      console.error('Error deleting dream:', error);
      setErrorMessage('Failed to delete the dream. Please try again.');
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      fetchDreams();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-pink-500">
      <div className="container mx-auto p-4 animate-fade-in">
        <h1 className="text-3xl font-semibold text-white mb-4">My Dream Journal</h1>
        <div className="mb-4">
          {user ? (
            // Show user info and logout button if a user is logged in
            <div>
              <p className="text-white">Welcome, {user.displayName}</p>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-full mt-2 hover:bg-red-800 transition-all duration-300"
              >
                Log Out
              </button>
            </div>
          ) : (
            // Show login button if no user is logged in
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-800 transition-all duration-300"
            >
              Log In with Google
            </button>
          )}
        </div>

        {/* User's nickname input field */}
       {/* User's nickname input field */}
       <input
          type="text"
          placeholder="Your Nickname"
          className="border-2 p-3 rounded w-full mb-4 animate-pulse"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={!user} // Disable the input field if no user is logged in
        />
{/* Dream entry form */}
<div className="bg-white p-6 rounded-lg shadow-lg mb-4 animate-fade-in">
  <input
    type="text"
    placeholder="Dream Title"
    className="border p-3 rounded w-full"
    value={dreamTitle}
    onChange={(e) => setDreamTitle(e.target.value)}
    disabled={!user} // Disable the input field if no user is logged in
  />
  <textarea
    placeholder="Dream Description"
    className="border p-3 rounded w-full mt-3"
    value={dreamDescription}
    onChange={(e) => setDreamDescription(e.target.value)}
    disabled={!user} // Disable the input field if no user is logged in
  />
  <button
    className="bg-blue-500 text-white py-3 px-6 rounded-full w-full mt-3 hover-bg-blue-600 transition-all duration-300"
    onClick={addDream}
    disabled={!user} // Disable the button if no user is logged in
  >
    Share Dream
  </button>
  {errorMessage && (
    <p className="text-red-600 mt-2">{errorMessage}</p>
  )}
</div>
        {/* List of dream entries with comments */}
        <div className="space-y-4">
          {dreams.map((dream) => (
            <div key={dream.id} className="bg-white p-4 rounded-lg shadow-md animation-fade-in">
              <div>
                <h2 className="text-xl font-semibold text-blue-500">{dream.title}</h2>
                <p className="mt-2 text-gray-600">{dream.description}</p>
                <p className="mt-2 text-gray-500">By: {dream.nickname}</p>
                <p className="mt-2 text-gray-500">Date: {dream.timestamp.toLocaleString('en-PH')}</p>
              </div>
              {dream.comments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mt-4">Comments:</h3>
                  {dream.comments.map((comment) => (
                    <div key={comment.id} className="mt-2">
                      <p className="text-gray-600">{comment.text}</p>
                      <p className="mt-1 text-gray-500">
                        By: {comment.nickname} | Date: {comment.timestamp.toLocaleString('en-PH')}
                      </p>
                      <button
                        className="text-red-600 hover:text-red-800 cursor-pointer mt-2"
                        onClick={() => deleteComment(dream.id, comment.id)}
                      >
                        Delete Comment
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <textarea
                  placeholder="Add a comment"
                  className="border p-3 rounded w-full"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-full mt-2 hover-bg-blue-600 transition-all duration-300"
                  onClick={() => addComment(dream.id)}
                >
                  Add Comment
                </button>
                {errorMessage && (
                  <p className="text-red-600 mt-2">{errorMessage}</p>
                )}
              </div>
              <button
                className="text-red-600 hover:text-red-800 cursor-pointer mt-4"
                onClick={() => deleteDream(dream.id)}
              >
                Delete Dream
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
