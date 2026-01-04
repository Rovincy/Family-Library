// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styled from 'styled-components';
import { FiHome, FiSearch, FiPlusSquare, FiBell } from 'react-icons/fi';
import { signOut } from 'firebase/auth';

const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 100px; /* Space for mobile bottom nav */

  @media (min-width: 1001px) {
    padding-bottom: 0;
  }
`;

const TopHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const Logo = styled(Link)`
  font-size: 28px;
  font-weight: 700;
  color: #262626;
  text-decoration: none;
  letter-spacing: -1px;
`;

const NavCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 26px;
  color: #262626;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`;

const ProfileBtn = styled(NavButton)`
  width: 40px;
  height: 40px;
  padding: 0;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid transparent;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    background: #ddd;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #666;
    font-weight: 600;
  }

  &:hover {
    border-color: #dbdbdb;
  }
`;

const LogoutBtn = styled.button`
  background: #0095f6;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #007bb5;
  }

  @media (max-width: 1000px) {
    display: none;
  }
`;

const ProfileContent = styled.div`
  max-width: 935px;
  margin: 80px auto 40px;
  padding: 0 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 44px;
  gap: 80px;

  @media (max-width: 735px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const ProfilePictureWrapper = styled.div`
  flex-shrink: 0;
`;

const AvatarLarge = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const PlaceholderLarge = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #999;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const InfoSection = styled.div`
  flex: 1;
`;

const UsernameHeader = styled.h1`
  font-size: 28px;
  font-weight: 300;
  margin: 0 0 20px 0;
  color: #262626;
`;

const Stats = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
  font-size: 16px;

  strong {
    font-weight: 600;
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 40px;
`;

const PostThumb = styled.div`
  aspect-ratio: 1;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.03);
  }

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MobileNav = styled.nav`
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

const MobileIcon = styled.button`
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
`;

export default function Profile() {
  const { uid } = useParams<{ uid: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }
      setLoading(false);
    };

    fetchUser();

    const q = query(
      collection(db, 'posts'),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setUserPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [uid]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const goToProfile = () => {
    if (auth.currentUser) {
      navigate(`/profile/${auth.currentUser.uid}`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading profile...</div>;

  if (!userData) return <div style={{ textAlign: 'center', padding: '100px' }}>User not found</div>;

  return (
    <Container>
      <TopHeader>
        <Logo to="/">FamilyGram</Logo>

        <NavCenter>
          <NavButton onClick={() => navigate('/')}>
            <FiHome />
          </NavButton>
          <NavButton>
            <FiSearch />
          </NavButton>
          <NavButton>
            <FiPlusSquare />
          </NavButton>
          <NavButton>
            <FiBell />
          </NavButton>
          <ProfileBtn onClick={goToProfile}>
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="Profile" />
            ) : (
              <div className="placeholder">
                {auth.currentUser?.displayName?.[0]?.toUpperCase() || auth.currentUser?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </ProfileBtn>
        </NavCenter>

        <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
      </TopHeader>

      <ProfileContent>
        <Header>
          <ProfilePictureWrapper>
            {userData.photoURL ? (
              <AvatarLarge src={userData.photoURL} alt={userData.displayName} />
            ) : (
              <PlaceholderLarge>?</PlaceholderLarge>
            )}
          </ProfilePictureWrapper>

          <InfoSection>
            <UsernameHeader>{userData.displayName}</UsernameHeader>

            <Stats>
              <div><strong>{userPosts.length}</strong> posts</div>
            </Stats>
          </InfoSection>
        </Header>

        <PostsGrid>
          {userPosts.map((post) => (
            <PostThumb key={post.id}>
              {post.mediaTypes[0] === 'video' ? (
                <video src={post.mediaUrls[0]} muted />
              ) : (
                <img src={post.mediaUrls[0]} alt="post" />
              )}
            </PostThumb>
          ))}
        </PostsGrid>

        {userPosts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '60px', fontSize: '18px' }}>
            No posts yet
          </p>
        )}
      </ProfileContent>

      {/* Mobile Bottom Navigation */}
      <MobileNav>
        <MobileIcon onClick={() => navigate('/')}>🏠</MobileIcon>
        <MobileIcon>🔍</MobileIcon>
        <MobileIcon style={{ fontSize: '32px' }}>+</MobileIcon>
        <MobileIcon>❤️</MobileIcon>
        <MobileIcon onClick={goToProfile}>👤</MobileIcon>
            <MobileIcon onClick={handleLogout} style={{ color: '#ed4956' }}>
              🚪
            </MobileIcon>
      </MobileNav>
    </Container>
  );
}