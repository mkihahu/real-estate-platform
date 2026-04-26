import React, { useState, useEffect } from "react";
import { chatMessagesStyles as s } from "../../assets/dummyStyles.js";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useRef } from "react";
import axios from "axios";
import API_URL from "../../config.js";
import Navbar from "../../components/common/Navbar.jsx";
import {
  HiChevronLeft,
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiPaperAirplane,
} from "react-icons/hi";

const ChatMessages = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { activeChat, setActiveChat, joinChat, sendMessage, socket } =
    useChat();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat]);

  // Fetch conversation (between buyer & seller)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle response - backend returns array directly
        const fetchedConversations = Array.isArray(res.data) ? res.data : [];
        setConversations(fetchedConversations);

        if (location.state?.chat) {
          const existingChat = fetchedConversations.find(
            (e) => e._id === location.state.chat._id,
          );
          setActiveChat(existingChat || location.state.chat);
        } else if (!activeChat && fetchedConversations.length > 0) {
          setActiveChat(fetchedConversations[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setConversations([]);
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user, token, location.state?.chat?._id, activeChat, setActiveChat]);

  // Fetch messages
  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/chat/${activeChat._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(res.data.messages || []);
          joinChat(activeChat._id);
          scrollToBottom();
        } catch (err) {
          console.error("Error fetching messages: ", err);
        }
      };
      fetchMessages();
    }
  }, [activeChat, joinChat, token]);

  // Updating the chat when new message is received
  useEffect(() => {
    const currentSocket = socket.current;
    if (currentSocket) {
      currentSocket.on("receiveMessage", (data) => {
        if (activeChat && data.chatId === activeChat._id) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("receiveMessage");
      }
    };
  }, [socket, activeChat]);

  // To send messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: activeChat._id,
          text: textToSend,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.newMessage) {
        sendMessage(
          activeChat._id,
          textToSend,
          res.data.newMessage._id,
          res.data.newMessage.createdAt,
        );
      }
      scrollToBottom();
    } catch (err) {
      console.error("Error sending messages: ", err);
    }
  };

  // To delete a chat
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChat?._id === chatId) setActiveChat(null);
    } catch (err) {
      console.error("Error deleting chat: ", err);
    }
  };

  // To delete a message from chat
  const handleDeleteMessage = async (chatId, messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/chat/${chatId}/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(res.data.chat.messages);
    } catch (err) {
      console.error("Error deleting message: ", err);
    }
  };

  // To get the chat partner
  const getChatPartner = (chat) => {
    return user._id === chat.buyer._id ? chat.seller : chat.buyer;
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={`${s.chatContainer} ${
        user?.role === "seller"
          ? s.chatContainerSeller
          : s.chatContainerNonSeller
      }`}
    >
      {user?.role !== "seller" && <Navbar />}

      <div className={s.chatWrapper}>
        <div className={`${s.sidebar} ${activeChat ? s.sidebarHidden : ""}`}>
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Messages</h2>
          </div>

          <div className={s.sidebarContent}>
            {!Array.isArray(conversations) || conversations.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat._id}
                  className={`${s.conversationItem} ${
                    activeChat?._id === chat._id ? s.conversationItemActive : ""
                  }`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className={s.avatar}>
                    {getChatPartner(chat)?.profilePicture ? (
                      <img
                        src={getChatPartner(chat).profilePicture}
                        className={s.avatarImg}
                      />
                    ) : (
                      getChatPartner(chat)?.name.charAt(0)
                    )}
                  </div>

                  <div className={s.conversationInfo}>
                    <div className={s.conversationName}>
                      {getChatPartner(chat)?.name}
                    </div>
                    <div>
                      {chat.messages.at(-1)?.text || "Started a conversation"}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    className={s.deleteChatButton}
                    title="Delete Conversation"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}

        <div className={s.chatArea}>
          {activeChat ? (
            <>
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button
                    className={s.backButton}
                    onClick={() => setActiveChat(null)}
                  >
                    <HiChevronLeft size={24} />
                  </button>
                  <div className={s.avatar}>
                    {getChatPartner(activeChat)?.profilePicture ? (
                      <img
                        className={s.avatarImg}
                        src={getChatPartner(activeChat).profilePicture}
                        alt=""
                      />
                    ) : (
                      getChatPartner(activeChat)?.name?.charAt(0)
                    )}
                  </div>
                  <div className={s.chatPartnerName}>
                    {getChatPartner(activeChat)?.name}
                  </div>
                </div>
              </div>

              <div className={s.messagesArea}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${s.messageBubble} ${(msg.sender?._id || msg.sender) === user._id ? s.messageOwn : s.messageOther}`}
                  >
                    <div className={s.messageContent}>
                      {msg.image && (
                        <div className={s.messageImageWrapper}>
                          <img
                            src={msg.image}
                            alt="Property Reference"
                            className={s.messageImage}
                          />
                        </div>
                      )}
                      <div className={s.messageText}>{msg.text}</div>
                      {(msg.sender?._id || msg.sender) === user._id && (
                        <button
                          className={s.deleteMessageButton}
                          onClick={() =>
                            handleDeleteMessage(activeChat._id, msg._id)
                          }
                          title="Delete Message"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      )}
                    </div>
                    <span className={s.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className={s.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={s.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className={s.sendButton}>
                  <HiPaperAirplane className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 className={s.noChatIcon} />
              <h3 className={s.noChatTitle}>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
