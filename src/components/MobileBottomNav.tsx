// src/components/MobileBottomNav.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import styled from 'styled-components';

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #dbdbdb;
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  z-index: 100;

  @media (min-width: 1001px) {
    display: none;
  }
`;

const Icon = styled.button`
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  &.active {
    color: #0095f6;
  }
`;

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <Nav>
      <Icon className={isHome ? 'active' : ''} onClick={() => navigate('/')}>
        🏠
      </Icon>
      <Icon>🔍</Icon>
      <Icon onClick={() => navigate('/')} style={{ fontSize: '32px' }}>
        +
      </Icon>
      <Icon>❤️</Icon>
      <Icon onClick={() => auth.currentUser && navigate(`/profile/${auth.currentUser.uid}`)}>
        👤
      </Icon>
      <Icon onClick={handleLogout} style={{ color: '#ed4956' }}>
        🚪
      </Icon>
    </Nav>
  );
}