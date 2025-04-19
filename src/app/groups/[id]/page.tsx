"use client"

import ChatArea from "@/components/ChatArea";
import { formatDistanceToNow } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  userId: string;
  senderId: string;
  groupId: string;
  content: string;
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
  description: string;
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

export default function GroupPage() {

    const params = useParams();
    const groupId = params.id as string;

  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [checkSession, setSessionChecked] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (!session?.user) {
          router.push("/signIn");
        } else {
        setSessionData(session);
          fetchGroupDetails(groupId);
          fetchMessages(groupId);
        }
      } catch (error) {
        console.error("Error checking session: ", error);
        router.push("/signIn");
      } finally {
        setSessionChecked(true);
      }
    };

    if(groupId){
        checkSession();
    }

  }, [groupId, router]);

  const fetchGroupDetails = async (id : string) => {
    try {
      const response = await fetch(`/api/groups/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/groups");
          return;
        }

        if (response.status === 403) {
          setError("You don't have permission to view this group");
          return;
        }

        throw new Error("Failed to fetch group details");
      }

      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group details:", error);
      setError("Error loading group details. Please try again.");
    }
  };

  const fetchMessages = async (id : string ) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${id}/messages`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Error loading messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
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

      const msg = await response.json();
      setMessages((prevMessages) => [...prevMessages, msg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error sending message. Please try again.");
    }
  };

  if (!groupId || !setSessionChecked || (loading && !group)) {
    return <div className="text-center p-6">Loading group...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => router.push("/groups")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Groups
          </button>
        </div>
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
          <h1 className="text-xl text-black font-semibold">{group?.name}</h1>
        </div>
        <button
          onClick={() => {/* Show members list */}}
          className="text-blue-600 text-sm hover:underline"
        >
          {group?.memberCount || 0} members
        </button>
      </div>

      {/* Chat Area Component */}
      <ChatArea
        messages={messages}
        session={sessionData}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}