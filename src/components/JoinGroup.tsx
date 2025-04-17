import { useState } from "react";

export default function JoinGroupForm({
  onSuccess = (group: any) => {},
  onCancel = () => {},
}) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join group");
      }

      const group = await response.json();
      onSuccess(group);
    } catch (error) {
      console.error("Error joining group:", error);
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Join a Chat Group</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="passcode" className="block text-black mb-1 font-medium">
            Group Passcode
          </label>
          <input
            type="text"
            id="passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            className="w-full px-4 py-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the group passcode"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        </div>
      </form>
    </div>
  );
}
