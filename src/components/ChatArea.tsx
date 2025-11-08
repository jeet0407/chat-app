"use client";

import { useRef, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from "@/components/SocketProvider";

interface Message {
  id: string;
  content: string;
  userId: string;
  groupId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionData {
  user?: SessionUser | null;
  expires?: string;
}

interface ChatAreaProps {
  initialMessages: Message[];
  session: SessionData | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  groupId: string;
}

export default function ChatArea({ 
  initialMessages, 
  session, 
  newMessage, 
  setNewMessage, 
  handleSendMessage,
  groupId
}: ChatAreaProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<{[key: string]: string}>({});
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [socketDebug, setSocketDebug] = useState({ 
    id: null as string | null, 
    connectionConfirmed: false 
  });

  useEffect(() => {
    if (!socket) return;
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleConnectionConfirmed = (data: any) => {
      console.log("Connection confirmed:", data);
      setSocketDebug(prev => ({ 
        ...prev, 
        id: data.socketId, 
        connectionConfirmed: true 
      }));
    };
  
    socket.on("connection_confirmed", handleConnectionConfirmed);
    socket.on("pong", () => console.log("Pong received"));
  
    return () => {
      socket.off("connection_confirmed", handleConnectionConfirmed);
      socket.off("pong");
    };
  }, [socket]);

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Listen for new messages and typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log("Received message:", message);
      // Only add messages for the current group
      if (message.groupId === groupId) {
        setMessages(prev => {
          // Check if we already have this message to avoid duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    const handleUserTyping = (data: { userId: string; groupId: string; isTyping: boolean; userName: string }) => {
      // Only handle typing for the current group and not from the current user
      if (data.groupId === groupId && data.userId !== session?.user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return { ...prev, [data.userId]: data.userName || "Someone" };
          } else {
            const newTypingUsers = { ...prev };
            delete newTypingUsers[data.userId];
            return newTypingUsers;
          }
        });
      }
    };

    // Listen for new messages and typing indicators
    socket.on("message_received", handleNewMessage);
    socket.on("user_typing", handleUserTyping);

    // Clean up
    return () => {
      socket.off("message_received", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, groupId, session?.user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Handle typing indicators
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (socket && isConnected && session?.user?.id) {
      // Send typing indicator
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing_status", {
          userId: session.user.id,
          groupId: groupId,
          isTyping: true,
          userName: session.user.name || "User"
        });
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (socket.connected) {
          socket.emit("typing_status", {
            userId: session.user?.id,
            groupId: groupId,
            isTyping: false,
            userName: session.user?.name || "User"
          });
        }
      }, 2000);
    }
  };

  return (
    <>

    {/* Debug panel - remove in production */}
<div className="bg-gray-100 p-1 text-xs text-gray-600 border-b">
  <p>Socket ID: {socketDebug.id || 'Not connected'}</p>
  <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
  <p>Connection confirmed: {socketDebug.connectionConfirmed ? '✅ Yes' : '❌ No'}</p>
</div>


      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.userId === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.userId === session?.user?.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.userId !== session?.user?.id && (
                  <div className="font-semibold text-sm mb-1">
                    {message.user.name || "Unknown User"}
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <div
                  className={`text-xs mt-1 ${
                    message.userId === session?.user?.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing indicators */}
        {Object.values(typingUsers).length > 0 && (
          <div className="text-sm text-gray-500 italic mb-2">
            {Object.values(typingUsers).join(", ")} {Object.values(typingUsers).length === 1 ? "is" : "are"} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}