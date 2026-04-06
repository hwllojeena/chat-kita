"use client";

import React, { useEffect, useState, useRef } from 'react';
import ChatHeader from '@/components/ChatHeader';
import Message from '@/components/Message';
import ChatInput from '@/components/ChatInput';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import '../chat.css';

interface ChatMessage {
  id: number;
  created_at: string;
  author: string;
  text: string;
}

const isSameDay = (d1: string, d2: string) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Today";
  const date = new Date(dateString);
  const today = new Date();

  if (isSameDay(dateString, today.toISOString())) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(dateString, yesterday.toISOString())) {
    return "Yesterday";
  }

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = sessionStorage.getItem('currentUser');
    if (!user) {
      router.push('/');
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  // Load and Subscribe to Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: true }); // using ID as proxy for chronological
      if (data) setMessages(data as ChatMessage[]);
    };

    fetchMessages();

    // Listen to real-time additions
    const channel = supabase
      .channel('unique-chat-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => {
          // Prevent duplicates by forcing string comparison on IDs
          if (prev.some(m => String(m.id) === String(payload.new.id))) return prev;

          // Replace temp message if matches author and text
          const tempIndex = prev.findIndex(m => Number(m.id) < 0 && m.author === payload.new.author && m.text === payload.new.text);
          if (tempIndex !== -1) {
            const next = [...prev];
            next[tempIndex] = payload.new as ChatMessage;
            return next;
          }

          return [...prev, payload.new as ChatMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (currentUser) {
      // Optimistic update
      const tempMsg: ChatMessage = {
        id: -(Date.now() + Math.floor(Math.random() * 1000)),
        created_at: new Date().toISOString(),
        author: currentUser,
        text
      };
      setMessages(prev => [...prev, tempMsg]);

      // Push to DB
      await supabase.from('messages').insert({ author: currentUser, text });
    }
  };

  if (!currentUser) return null;

  const isRegina = currentUser === 'regina';
  const contactName = isRegina ? 'Aldo Pacarku' : 'Sayangku Regina';
  const avatarUrl = isRegina ? '/aldo.png' : '/profile.jpg';

  return (
    <div className="mobile-simulator">
      <ChatHeader contactName={contactName} avatarUrl={avatarUrl} />

      <div className="chat-area">
        {messages.map((msg, idx) => {
          let showDate = false;
          let dateText = "";

          if (idx === 0) {
            showDate = true;
            dateText = formatDate(msg.created_at);
          } else {
            const prevMsg = messages[idx - 1];
            if (!isSameDay(msg.created_at, prevMsg.created_at)) {
              showDate = true;
              dateText = formatDate(msg.created_at);
            }
          }

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="date-divider">
                  {idx === 0 && (
                    <>
                      Message
                      <br />
                    </>
                  )}
                  {dateText}
                </div>
              )}
              <Message
                text={msg.text}
                isSender={msg.author === currentUser}
              />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
