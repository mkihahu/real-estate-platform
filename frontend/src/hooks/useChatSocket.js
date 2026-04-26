import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import API_URL from "../config";

export const useChatSocket = (user, activeChatRef, setNotifications) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const connectTimer = setTimeout(() => {
      if (!isMounted) return;

      const socket = io(API_URL);
      socketRef.current = socket;

      socket.on("receiveMessage", (data) => {
        if (activeChatRef.current?._id !== data.chatId) {
          setNotifications((prev) => [...prev, data]);
        }
      });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(connectTimer);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user, activeChatRef, setNotifications]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const joinChat = useCallback((chatId) => {
    if (socketRef.current) {
      socketRef.current.emit("joinChat", chatId);
    }
  }, []);

  const sendMessage = useCallback(
    (chatId, text, messageId = null, createdAt = new Date(), image = null) => {
      if (socketRef.current && user) {
        const messageData = {
          chatId,
          sender: user._id,
          text,
          image,
          createdAt,
          _Id: messageId,
        };
        socketRef.current.emit("sendMessage", messageData);
        return messageData;
      }
      return null;
    },
    [user],
  );

  return { joinChat, sendMessage, socket: socketRef };
};
