import { useContext } from "react";
import { ChatContext } from "../context/ChatContextValue";

export const useChat = () => useContext(ChatContext);
