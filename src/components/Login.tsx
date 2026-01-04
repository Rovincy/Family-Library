// src/components/Login.tsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Beautiful family background image (free to use from Unsplash)
const FAMILY_BG = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80';

const LoginWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), 
              url('${FAMILY_BG}') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginContainer = styled.div`
  max-width: 400px;
  width: 100%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 38px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 8px;
  letter-spacing: -1px;
`;

const Tagline = styled.p`
  color: #555;
  font-size: 17px;
  margin-bottom: 40px;
  font-weight: 500;
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

const ErrorText = styled.p`
  color: #ed4956;
  margin: 15px 0 0;
  font-size: 14px;
`;

const SignupLink = styled.p`
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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Go to homepage on success
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <LoginContainer>
        <Logo>FamilyGram</Logo>
        <Tagline>Share moments with the ones you love</Tagline>

        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <ErrorText>{error}</ErrorText>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <SignupLink>
          Don't have an account? <a href="/signup">Sign up</a>
        </SignupLink>
      </LoginContainer>
    </LoginWrapper>
  );
}