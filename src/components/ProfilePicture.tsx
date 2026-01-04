// src/components/ProfilePicture.tsx
import { useState } from 'react';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styled from 'styled-components';

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const AvatarImg = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const PlaceholderAvatar = styled.div`
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ChangePhotoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  text-align: center;
  padding: 8px;
  border-radius: 0 0 75px 75px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;

  ${AvatarWrapper}:hover & {
    opacity: 1;
  }
`;

export default function ProfilePicture({ photoURL, uid }: { photoURL: string | null; uid: string }) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser || auth.currentUser.uid !== uid) return;

    setUploading(true);

    try {
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: downloadURL,
      });
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AvatarWrapper>
      {photoURL ? (
        <AvatarImg src={photoURL} alt="Profile" />
      ) : (
        <PlaceholderAvatar>?</PlaceholderAvatar>
      )}
      {auth.currentUser?.uid === uid && (
        <>
          <ChangePhotoOverlay>
            {uploading ? 'Uploading...' : 'Change Photo'}
          </ChangePhotoOverlay>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            onChange={handlePhotoChange}
            disabled={uploading}
          />
          <label htmlFor="photo-upload" style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
        </>
      )}
    </AvatarWrapper>
  );
}