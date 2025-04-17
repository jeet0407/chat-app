"use client";

import { useState } from "react";

export default function CreateGroupForm({
  onSuccess = (group: any) => {},
  onCancel = () => {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    passcode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create group");
      }
      const group = await res.json();

      onSuccess(group);
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl text-black font-bold mb-6">
        Create New Chat Group
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-black mb-1 font-medium">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-black border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-black mb-1 font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border  text-black rounded-md focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="passcode"
            className="block text-black mb-1 font-medium"
          >
            Passcode *
          </label>
          <input
            type="text"
            id="passcode"
            name="passcode"
            value={formData.passcode}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
            placeholder="Create a unique passcode for others to join"
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
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
}
