// src/components/Upload.tsx
import { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';

interface UploadProps {
  onClose?: () => void; // Add this prop
}

const UploadContainer = styled.div`
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 40px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  float: right;
  color: #999;

  &:hover {
    color: #262626;
  }
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  font-weight: 600;
`;

const FileInput = styled.input`
  margin: 10px 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
`;

const SubmitButton = styled.button`
  background: #0095f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function Upload({ onClose }: UploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0 || !auth.currentUser) return;

    setUploading(true);

    try {
      const mediaUrls: string[] = [];
      const mediaTypes: string[] = [];

      for (const file of files) {
        const storageRef = ref(storage, `posts/${auth.currentUser!.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        mediaUrls.push(url);
        mediaTypes.push(file.type.startsWith('video') ? 'video' : 'image');
      }

      await addDoc(collection(db, 'posts'), {
        uid: auth.currentUser!.uid,
        username: auth.currentUser!.displayName || auth.currentUser!.email?.split('@')[0],
        caption,
        mediaUrls,
        mediaTypes,
        likes: 0,
        likedBy: [],
        timestamp: serverTimestamp(),
      });

      // Reset form
      setFiles([]);
      setCaption('');
      
      // Close the upload form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploadContainer>
      {onClose && (
        <CloseButton onClick={onClose} aria-label="Close">
          ×
        </CloseButton>
      )}
      <Title>Share a Memory</Title>

      <FileInput
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      <TextArea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <SubmitButton onClick={handleSubmit} disabled={uploading || files.length === 0}>
        {uploading ? 'Uploading...' : 'Share'}
      </SubmitButton>
    </UploadContainer>
  );
}