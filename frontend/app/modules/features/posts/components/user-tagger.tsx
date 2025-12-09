"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "./modal";
import { Button } from "@/app/modules/components/buttons";
import { Combobox } from "@/app/modules/components/combobox";
import { supabase } from "@/app/modules/supabase/client";

interface User {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

interface UserTaggerProps {
  selectedUsers: string[]; // Array of user IDs
  onUsersChange: (userIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
  maxUsers?: number;
}

// Fetch followed users API - accept token as parameter
async function fetchFollowedUsers(
  search?: string,
  token?: string
): Promise<User[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const queryParams = new URLSearchParams();
  queryParams.append("type", "following");
  if (search) queryParams.append("search", search);

  const response = await fetch(
    `${baseUrl}/api/users/metadata?${queryParams.toString()}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch users");
  const data = await response.json();
  return data.users || [];
}

export function UserTagger({
  selectedUsers,
  onUsersChange,
  isOpen,
  onClose,
  maxUsers = 4,
}: UserTaggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users when search changes (debounced)
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Get token from Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const fetchedUsers = await fetchFollowedUsers(
          searchQuery,
          token || undefined
        );
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen]);

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      // Remove user
      onUsersChange(selectedUsers.filter((id) => id !== userId));
    } else {
      // Add user (check limit)
      if (selectedUsers.length >= maxUsers) {
        alert(`You can only tag up to ${maxUsers} users`);
        return;
      }
      onUsersChange([...selectedUsers, userId]);
    }
  };

  const selectedUserObjects = users.filter((user) =>
    selectedUsers.includes(user.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tag People">
      <div className="space-y-4">
        {/* Search input */}
        <Combobox
          value={searchQuery}
          onAction={setSearchQuery}
          options={users.map((user) => ({
            value: user.username,
            label:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.username,
          }))}
          placeholder="Search people to tag..."
        />

        {/* Selected users */}
        {selectedUserObjects.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Tagged Users</h3>
            <div className="flex flex-wrap gap-2">
              {selectedUserObjects.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-3 py-1"
                >
                  {user.avatarUrl && (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm">
                    {user.firstName || user.username}
                  </span>
                  <button
                    onClick={() => handleToggleUser(user.id)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available users */}
        {users.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">People You Follow</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {users
                .filter((user) => !selectedUsers.includes(user.id))
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-2 text-left hover:bg-gray-50"
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-sm font-medium">
                          {(user.firstName || user.username)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-gray-500">Loading users...</p>}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
