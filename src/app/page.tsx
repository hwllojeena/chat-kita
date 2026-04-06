"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './chat.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === 'reginahenpiaoliang' && password === '1802') {
      sessionStorage.setItem('currentUser', 'regina');
      router.push('/chat');
    } else if (username.toLowerCase() === 'aldo' && password === '0904') {
      sessionStorage.setItem('currentUser', 'aldo');
      router.push('/chat');
    } else {
      setError('Invalid username or password!');
    }
  };

  return (
    <div className="mobile-simulator">
      <div className="login-container">
        <h1 className="login-title">Who are you?</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Your name"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Your birthday"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
