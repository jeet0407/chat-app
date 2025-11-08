"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ChatArea from "@/components/ChatArea";
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

interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
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

export default function GroupChatPage() {
  const params = useParams();
  const groupId = params.id as string;
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check session and load initial data
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (!session?.user) {
          router.push("/signIn");
        } else {
          setSessionData(session);
          await fetchGroupDetails();
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error checking session: ", error);
        setError("Error checking authentication. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [groupId, router]);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/groups");
          return;
        }
        throw new Error("Failed to fetch group details");
      }
      
      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group details:", error);
      setError("Error loading group. Please try again.");
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Error loading messages. Please try again.");
    }
  };

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !sessionData?.user || !socket) return;
    
    try {
      // Save the message to the database
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      // Get the saved message
      const message = await response.json();
      
      // Emit the message to all clients via socket
      socket.emit("new_message", message);
      
      // Clear the input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => router.push("/groups")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/groups")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">{group?.name}</h1>
        </div>
        <div className="flex items-center">
          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Chat Area Component */}
      <ChatArea
        initialMessages={messages}
        session={sessionData}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        groupId={groupId}
      />
    </div>
  );
}