// src/components/Signup.tsx
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Same beautiful family background
const FAMILY_BG = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80';

const SignupWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), 
              url('${FAMILY_BG}') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SignupContainer = styled.div`
  max-width: 450px;
  width: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #555;
  font-size: 16px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border: 1px solid #dbdbdb;
  border-radius: 10px;
  font-size: 15px;
  background-color: #fff;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #a0a0a0;
    box-shadow: 0 0 0 3px rgba(0, 149, 246, 0.1);
  }
`;

const FileInputLabel = styled.label`
  display: block;
  margin: 20px 0;
  padding: 14px;
  background: #fafafa;
  border: 2px dashed #dbdbdb;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  color: #262626;
  transition: all 0.3s;

  &:hover {
    background: #f0f0f0;
    border-color: #a8a8a8;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #0095f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;

  &:hover {
    background: #007bb5;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AvatarPreview = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  margin: 20px 0;
  border: 5px solid #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
`;

const PlaceholderAvatar = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #ddd;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 45px;
  color: #999;
  border: 5px solid #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
`;

const ErrorText = styled.p`
  color: #ed4956;
  margin: 15px 0;
  font-size: 14px;
`;

const LoginLink = styled.p`
  margin-top: 30px;
  font-size: 15px;
  color: #666;

  a {
    color: #0095f6;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !firstName || !lastName || !photo) {
      setError('All fields are required, including a profile picture');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, photo);
      const photoURL = await getDownloadURL(storageRef);

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: fullName,
        photoURL,
        createdAt: new Date(),
      });

      alert('Welcome to the family! Please log in.');
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password too weak');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupWrapper>
      <SignupContainer>
        <Title>Join FamilyGram</Title>
        <Subtitle>Create your family account</Subtitle>

        {preview ? (
          <AvatarPreview src={preview} alt="Profile preview" />
        ) : (
          <PlaceholderAvatar>?</PlaceholderAvatar>
        )}

        <form onSubmit={handleSignup}>
          <FileInputLabel>
            Upload Profile Picture <strong>(Required)</strong>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              required
            />
          </FileInputLabel>

          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <ErrorText>{error}</ErrorText>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <LoginLink>
          Already have an account? <a href="/login">Log in</a>
        </LoginLink>
      </SignupContainer>
    </SignupWrapper>
  );
}