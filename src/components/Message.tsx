import React from 'react';
import '../app/chat.css';

interface MessageProps {
  text: string;
  isSender: boolean;
}

export default function Message({ text, isSender }: MessageProps) {
  const isImage = text.startsWith('[IMAGE]');
  const imageUrl = isImage ? text.replace('[IMAGE]', '') : '';

  return (
    <div className={`message-wrapper ${isSender ? 'sender' : 'receiver'}`}>
      <div className={`message-bubble ${isImage ? 'image-bubble' : ''}`}>
        {isImage ? (
          <img src={imageUrl} alt="uploaded content" className="chat-image" />
        ) : (
          text
        )}
      </div>
    </div>
  );
}
