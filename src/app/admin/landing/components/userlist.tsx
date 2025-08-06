"use client";

import React from "react";
import { User } from "../types";

type UserListProps = {
  users: User[];
  onSelect: (user: User) => void;
};

export default function UserList({ users, onSelect }: UserListProps) {
  return (
    <section className="w-[100%] bg-[#1e202d] p-4 border-r border-gray-800 flex flex-col h-screen">
      <div>
        <div className="bg-[#292b3c] rounded-md shadow p-4 flex justify-between items-center mb-4">
          <h2 className="sticky top-0 bg-[#292b3c] z-10 text-lg font-bold text-white">Users</h2>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="mb-4 px-2 py-1 rounded bg-[#292b3c] text-white border border-gray-700"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pb-20">
        <ul>
          {users.map(user => (
            <li
              key={user.email}
              className="mb-2 text-gray-200 cursor-pointer hover:bg-[#23243a] p-2 rounded transition"
              onClick={() => onSelect(user)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl || "/pattern.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700"
                />
                <span>{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}