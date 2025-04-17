"use client";

import CreateGroupForm from "@/components/CreateGroup";
import GroupCard from "@/components/GroupCard";
import JoinGroupForm from "@/components/JoinGroup";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<
    { id: any; name: string; joinedAt: string; description?: string; role?: string; memberCount?: number }[]
  >([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (!session?.user) {
          router.push("/signIn");
        } else {
          fetchGroups();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/signIn");
      } finally {
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [router]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newGroup: any) => {
    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setShowCreateModal(false);
  };

  const handleJoinSuccess = (joinedGroup: any) => {
    if (!groups.some((g) => g.id === joinedGroup.id)) {
      setGroups((prevGroups) => [...prevGroups, joinedGroup]);
    }
    setShowJoinModal(false);
  };

  if (!sessionChecked || loading) {
    return <div className="text-center p-6">Loading groups...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Chat Groups</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
          >
            Create Group
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Join Group
          </button>
        </div>
      </div>

      {/* Group Cards */}
      {groups.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border">
          <p className="text-lg text-gray-600 mb-4">
            You haven't joined any chat groups yet.
          </p>
          <p>Create a new group or join an existing one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => router.push(`/groups/${group.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <CreateGroupForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <JoinGroupForm
                onSuccess={handleJoinSuccess}
                onCancel={() => setShowJoinModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}