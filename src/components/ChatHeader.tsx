"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import '../app/chat.css';

interface ChatHeaderProps {
  contactName: string;
  avatarUrl: string;
}

export default function ChatHeader({ contactName, avatarUrl }: ChatHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-back" onClick={handleBack} style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
      </div>
      <div className="header-center">
        <div className="header-avatar" style={{ backgroundImage: `url('${avatarUrl}')` }}></div>
        <div className="header-name">
          {contactName}
        </div>
      </div>
      <div className="header-right"></div>
    </div>
  );
}
