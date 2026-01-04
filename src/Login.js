import React, { useState } from 'react';
import { signInWithEmailLink, isSignInWithEmailLink, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from './firebase';

const actionCodeSettings = {
  url: 'http://localhost:3000/finish-sign-in', // Change to your production URL later
  handleCodeInApp: true,
};

function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Check if this is a sign-in link callback
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let storedEmail = window.localStorage.getItem('emailForSignIn');
    if (!storedEmail) {
      storedEmail = window.prompt('Please provide your email for confirmation');
    }
    signInWithEmailLink(auth, storedEmail, window.location.href)
      .then((result) => {
        window.localStorage.removeItem('emailForSignIn');
        setMessage('Logged in successfully!');
        // Redirect or update UI
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
      });
  }

  const handleLogin = () => {
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem('emailForSignIn', email);
        setMessage('Check your email for the login link!');
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
      });
  };

  return (
    <div>
      <h2>Passwordless Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleLogin}>Send Login Link</button>
      <p>{message}</p>
    </div>
  );
}

export default Login;