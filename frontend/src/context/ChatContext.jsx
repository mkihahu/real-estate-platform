import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChatSocket } from "../hooks/useChatSocket";
import { ChatContext } from "./ChatContextValue";

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const activeChatRef = useRef(null);

  const { joinChat, sendMessage, socket } = useChatSocket(
    user,
    activeChatRef,
    setNotifications,
  );

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setActiveChat(null);
      setNotifications([]);
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeChat,
        setActiveChat,
        joinChat,
        sendMessage,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
