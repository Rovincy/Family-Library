import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import Login from '../components/Login';
import Upload from '../components/Upload';
import Slider from 'react-slick';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiBookmark,
  // FaHeart,
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiBell,
} from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaHeart } from 'react-icons/fa';

interface CommentType {
  id: string;
  username: string;
  text: string;
  timestamp: any;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  uid?: string;
}

interface PostType {
  id: string;
  uid: string;
  username: string;
  caption: string;
  mediaUrls: string[];
  mediaTypes: string[];
  likes: number;
  likedBy: string[];
  timestamp: any;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
}

interface UserType {
  id: string;
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
}

const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 100px; /* Prevent mobile nav from covering content */

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

  &.active {
    color: #0095f6;
  }
`;

const ProfileBtn = styled(NavButton)`
  width: 40px;
  height: 40px;
  padding: 0;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border 0.2s;

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

const MainLayout = styled.div`
  display: flex;
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 0 20px;

  @media (max-width: 1000px) {
    display: block;
    margin-top: 60px;
  }
`;

const FeedSection = styled.main`
  flex: 1;
  max-width: 680px;
  margin: 0 auto;
`;

const Post = styled.article`
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  margin-bottom: 40px;
  overflow: hidden;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const UserAvatar = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(props) => (props.src ? 'transparent' : '#ddd')};
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    font-weight: 600;
    background: #ddd;
  }
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const MoreBtn = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: black;
  overflow: hidden;

  .slick-slider,
  .slick-list,
  .slick-track,
  .slick-slide > div {
    height: 100%;
  }

  .slick-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    z-index: 10;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .slick-prev {
    left: 12px;
  }

  .slick-next {
    right: 12px;
  }

  .slick-dots {
    bottom: 16px;
  }

  .slick-dots li button:before {
    color: white;
    opacity: 0.75;
    font-size: 10px;
  }

  .slick-dots li.slick-active button:before {
    opacity: 1;
  }
`;

const MediaItem = styled.div`
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PostActions = styled.div`
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 18px;
  font-size: 26px;

  button {
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;

    &:active {
      transform: scale(1.2);
    }
  }

  .liked {
    color: #ed4956;
  }
`;

const BookmarkBtn = styled.button`
  font-size: 26px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Likes = styled.div`
  padding: 4px 14px 0;
  font-weight: 600;
  font-size: 14px;
`;

const Caption = styled.div`
  padding: 0 14px 8px;
  font-size: 14px;
  line-height: 1.4;

  strong {
    font-weight: 600;
    margin-right: 4px;
  }
`;

const CommentsSection = styled.div`
  padding: 0 14px 8px;
`;

const Comment = styled.div`
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 18px;
  margin-bottom: 8px;
  word-wrap: break-word;
  cursor: pointer;
`;

const CommentContent = styled.div`
  strong {
    font-weight: 600;
    margin-right: 6px;
  }

  span {
    color: #262626;
  }
`;

const ViewMoreComments = styled.button`
  background: none;
  border: none;
  color: #8e8e8e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 8px;

  &:hover {
    color: #262626;
  }
`;

const CommentInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid #efefef;
  background: white;
`;

const CommentInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 0;

  &::placeholder {
    color: #8e8e8e;
  }
`;

const PostCommentBtn = styled.button`
  background: none;
  border: none;
  color: #0095f6;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  min-width: 50px;
  text-align: right;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CommentLoading = styled.span`
  color: #0095f6;
  font-size: 14px;
  font-weight: 600;
  margin-left: 12px;
`;

const OwnerControls = styled.div`
  padding: 8px 14px 12px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #efefef;
  margin-top: 8px;
`;

const EditButton = styled.button`
  background: none;
  border: 1px solid #dbdbdb;
  color: #262626;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background: none;
  border: 1px solid #ed4956;
  color: #ed4956;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const RightSidebar = styled.aside`
  width: 320px;
  margin-left: 60px;
  padding-top: 20px;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const SuggestionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #8e8e8e;
  font-weight: 600;
`;

const SuggestionList = styled.div``;

const Suggestion = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SugUser = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const SugAvatar = styled.img.attrs({ loading: 'lazy' })`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const SugPlaceholder = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ddd;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #999;
`;

const SugInfo = styled.div`
  font-size: 14px;

  div:first-child {
    font-weight: 600;
  }

  div:last-child {
    color: #8e8e8e;
    font-size: 12px;
  }
`;

const FollowBtn = styled.button`
  background: none;
  border: none;
  color: #0095f6;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
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

const Toast = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${(props) => (props.type === 'success' ? '#00a676' : '#ed4956')};
  color: white;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeInOut 4s forwards;

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 400,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  lazyLoad: 'ondemand' as const,
  adaptiveHeight: false,
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: CommentType[] }>({});
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [postId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, 'users'));
    const unsub = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as UserType))
        .filter((u) => u.id !== user.uid);

      setSuggestedUsers(usersList.slice(0, 4));
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          likedBy: data.likedBy || [],
        } as PostType;
      });
      setPosts(postData);
    });

    return () => unsubPosts();
  }, [user]);

  useEffect(() => {
    if (!user || posts.length === 0) return;

    const unsubs: Unsubscribe[] = [];

    posts.forEach((post) => {
      const commentsQuery = query(
        collection(db, `posts/${post.id}/comments`),
        orderBy('timestamp', 'asc')
      );

      const unsub = onSnapshot(commentsQuery, (snap) => {
        const commentList = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CommentType[];
        setComments((prev) => ({ ...prev, [post.id]: commentList }));
      });

      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [posts, user]);

  const toggleUpload = () => {
    setShowUpload((prev) => !prev);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLike = async (postId: string, currentLikes: number, likedBy: string[]) => {
    if (!user) return;

    const postRef = doc(db, 'posts', postId);
    const hasLiked = likedBy.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: currentLikes - 1,
          likedBy: arrayRemove(user.uid),
        });
        showToast('Like removed', 'success');
      } else {
        await updateDoc(postRef, {
          likes: currentLikes + 1,
          likedBy: arrayUnion(user.uid),
        });
        showToast('Post liked!', 'success');
      }
    } catch (error) {
      console.error('Like failed:', error);
      showToast('Failed to like post', 'error');
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text || !user) return;

    setCommentLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      const commentData: any = {
        username: `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.email?.split('@')[0] || 'user',
        text,
        timestamp: serverTimestamp(),
      };

      if (user.photoURL) commentData.photoURL = user.photoURL;
      if (user.firstName) commentData.firstName = user.firstName;
      if (user.lastName) commentData.lastName = user.lastName;

      await addDoc(collection(db, `posts/${postId}/comments`), commentData);

      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      showToast('Comment posted!', 'success');
    } catch (error) {
      console.error('Comment failed:', error);
      showToast('Failed to post comment', 'error');
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this post permanently?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('Post deleted', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete post', 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const goToProfile = (uid: string) => {
    navigate(`/profile/${uid}`);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        Loading...
      </div>
    );
  }

  return (
    <Container>
      {user ? (
        <>
          <TopHeader>
            <Logo to="/">FamilyGram</Logo>

            <NavCenter>
              <NavButton className="active">
                <FiHome />
              </NavButton>
              <NavButton>
                <FiSearch />
              </NavButton>
              <NavButton onClick={toggleUpload}>
                <FiPlusSquare />
              </NavButton>
              <NavButton>
                <FiBell />
              </NavButton>
              <ProfileBtn onClick={() => goToProfile(user.uid)}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="My profile" />
                ) : (
                  <div className="placeholder">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </ProfileBtn>
            </NavCenter>

            <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
          </TopHeader>

          <MainLayout>
            <FeedSection>
              {showUpload && (
                <div style={{ marginBottom: '40px' }}>
                  <Upload onClose={() => setShowUpload(false)} />
                </div>
              )}

              {posts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '40px' }}>
                  No posts yet. Tap the + button to share your first family moment!
                </p>
              ) : (
                posts.map((post) => {
                  const isLiked = post.likedBy.includes(user.uid);
                  const currentComment = commentText[post.id] || '';
                  const isCommentLoading = commentLoading[post.id] || false;
                  const isOwner = post.uid === user.uid;
                  const postComments = comments[post.id] || [];
                  const showViewMore = postComments.length > 5;
                  const isExpanded = expandedComments[post.id] || false;
                  const displayedComments = isExpanded ? postComments : postComments.slice(0, 5);

                  const displayName = post.lastName && post.firstName
                    ? `${post.lastName} ${post.firstName}`
                    : post.username || 'user';

                  return (
                    <Post key={post.id}>
                      <PostHeader>
                        <UserInfo onClick={() => goToProfile(post.uid)}>
                          <UserAvatar src={post.photoURL}>
                            {post.photoURL ? (
                              <img src={post.photoURL} alt={displayName} />
                            ) : (
                              <div className="placeholder">
                                {displayName[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </UserAvatar>
                          <Username>{displayName}</Username>
                        </UserInfo>
                        <MoreBtn>⋯</MoreBtn>
                      </PostHeader>

                      <CarouselWrapper>
                        <Slider {...carouselSettings}>
                          {post.mediaUrls.map((url, i) => (
                            <MediaItem key={i}>
                              {post.mediaTypes[i] === 'video' ? (
                                <video controls preload="metadata">
                                  <source src={url} />
                                  Your browser does not support video.
                                </video>
                              ) : (
                                <img src={url} alt="post media" loading="lazy" />
                              )}
                            </MediaItem>
                          ))}
                        </Slider>
                      </CarouselWrapper>

                      <PostActions>
                        <ActionGroup>
                          <button
                            onClick={() => handleLike(post.id, post.likes, post.likedBy)}
                            className={isLiked ? 'liked' : ''}
                          >
                            {isLiked ? <FaHeart /> : <FiHeart />}
                          </button>
                          <button>
                            <FiMessageCircle />
                          </button>
                          <button>
                            <FiSend />
                          </button>
                        </ActionGroup>
                        <BookmarkBtn>
                          <FiBookmark />
                        </BookmarkBtn>
                      </PostActions>

                      <Likes>{post.likes} likes</Likes>

                      <Caption>
                        <strong>{displayName}</strong>
                        {post.caption || '(no caption)'}
                      </Caption>

                      <CommentsSection>
                        {displayedComments.map((c) => {
                          const commentDisplayName = c.lastName && c.firstName
                            ? `${c.lastName} ${c.firstName}`
                            : c.username || 'user';

                          return (
                            <Comment key={c.id} onClick={() => goToProfile(post.uid)}>
                              <UserAvatar src={c.photoURL}>
                                {c.photoURL ? (
                                  <img src={c.photoURL} alt={commentDisplayName} />
                                ) : (
                                  <div className="placeholder">
                                    {commentDisplayName[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                              </UserAvatar>
                              <CommentContent>
                                <strong>{commentDisplayName}</strong>
                                <span>{c.text}</span>
                              </CommentContent>
                            </Comment>
                          );
                        })}

                        {showViewMore && (
                          <ViewMoreComments onClick={() => toggleComments(post.id)}>
                            {isExpanded ? 'Show less' : `View all ${postComments.length} comments`}
                          </ViewMoreComments>
                        )}
                      </CommentsSection>

                      <CommentInputWrapper>
                        <CommentInput
                          type="text"
                          placeholder="Add a comment..."
                          value={currentComment}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          disabled={isCommentLoading}
                        />
                        {isCommentLoading ? (
                          <CommentLoading>Posting...</CommentLoading>
                        ) : (
                          <PostCommentBtn
                            onClick={() => handleAddComment(post.id)}
                            disabled={!currentComment.trim() || isCommentLoading}
                          >
                            Post
                          </PostCommentBtn>
                        )}
                      </CommentInputWrapper>

                      {isOwner && (
                        <OwnerControls>
                          <EditButton onClick={() => alert('Edit caption coming soon!')}>
                            Edit Caption
                          </EditButton>
                          <DeleteButton onClick={() => handleDelete(post.id)}>
                            Delete Post
                          </DeleteButton>
                        </OwnerControls>
                      )}
                    </Post>
                  );
                })
              )}
            </FeedSection>

            <RightSidebar>
              <SuggestionsHeader>
                <span>Suggested Family Members</span>
                <button style={{ color: '#0095f6', fontWeight: 600 }}>See All</button>
              </SuggestionsHeader>

              <SuggestionList>
                {suggestedUsers.length === 0 ? (
                  <p style={{ color: '#8e8e8e', fontSize: '14px' }}>No other users yet</p>
                ) : (
                  suggestedUsers.map((person) => {
                    const displayName = person.lastName && person.firstName
                      ? `${person.lastName} ${person.firstName}`
                      : person.displayName || 'user';

                    return (
                      <Suggestion key={person.id}>
                        <SugUser onClick={() => goToProfile(person.id)}>
                          {person.photoURL ? (
                            <SugAvatar src={person.photoURL} alt={displayName} />
                          ) : (
                            <SugPlaceholder>?</SugPlaceholder>
                          )}
                          <SugInfo>
                            <div>{displayName}</div>
                            <div>Suggested for you</div>
                          </SugInfo>
                        </SugUser>
                        <FollowBtn>Follow</FollowBtn>
                      </Suggestion>
                    );
                  })
                )}
              </SuggestionList>
            </RightSidebar>
          </MainLayout>

          <MobileNav>
            <MobileIcon className="active">🏠</MobileIcon>
            <MobileIcon>🔍</MobileIcon>
            <MobileIcon onClick={toggleUpload} style={{ fontSize: '32px' }}>
              +
            </MobileIcon>
            <MobileIcon>❤️</MobileIcon>
            <MobileIcon onClick={() => goToProfile(user.uid)}>👤</MobileIcon>
            <MobileIcon onClick={handleLogout} style={{ color: '#ed4956' }}>
              🚪
            </MobileIcon>
          </MobileNav>

          {toast && <Toast type={toast.type}>{toast.message}</Toast>}
        </>
      ) : (
        <Login />
      )}
    </Container>
  );
}