import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import '../app/chat.css';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('chat-images').getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        onSendMessage(`[IMAGE]${data.publicUrl}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Make sure the bucket chat-images exists and RLS allows inserts, or is public!');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="input-area">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
      <div 
        className="plus-btn" 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ opacity: isUploading ? 0.5 : 1 }}
      >
        {isUploading ? '⌛' : '+'}
      </div>
      <form 
        className="input-box" 
        onSubmit={handleSend}
        style={{ margin: 0, width: '100%' }}
      >
        <input 
          type="text" 
          className="input-field" 
          placeholder="Message" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isUploading}
        />
      </form>
    </div>
  );
}
