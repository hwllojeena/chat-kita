"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './chat.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('user_key')
      .eq('username', username.toLowerCase())
      .eq('password', password)
      .single();

    if (user) {
      sessionStorage.setItem('currentUser', user.user_key);
      router.push('/chat');
    } else {
      if (dbError) {
        console.error('Login error:', dbError);
      }
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
