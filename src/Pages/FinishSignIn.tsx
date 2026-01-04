import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';

export default function FinishSignIn() {
  const [status, setStatus] = useState('Verifying link...');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setStatus('Invalid or expired link.');
      return;
    }

    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please confirm your email address:');
    }

    if (!email) {
      setStatus('No email provided.');
      return;
    }

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        window.localStorage.removeItem('emailForSignIn');
        setStatus('Signed in successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch((err) => {
        setStatus('Error: ' + err.message);
      });
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-32 text-center">
      <h1 className="text-2xl font-bold mb-6">Completing Sign In</h1>
      <p className="text-lg">{status}</p>
    </div>
  );
}