"use client";

import React, { useState } from "react";
import { User, Team, UserRole } from "../types";
import AvatarModal from "@/app/UserComponent/AvatarModal";
import { updateCurrentUser, updateUserById } from "@/app/api";

type UserProfileProps = {
  user: User;
  onClose: () => void;
  teams: Team[];
};

export default function UserProfile({
  user,
  onClose,
  teams,
}: UserProfileProps) {
  const [edit, setEdit] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">(user.teamId ?? "");
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatarUrl ?? "");
  const [role, setRole] = useState<UserRole>(user.role ?? "");
  const [username, setUsername] = useState<string>(user.username ?? "");
  const [email, setEmail] = useState<string>(user.email ?? "");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarSelect = (url: string) => {
    setPreviewUrl(url);
    setShowAvatarModal(false);
  };

  const handleSave = async () => {
    const userIdFromStorage = Number(localStorage.getItem("userId")); 
    const payload = {
      username,
      email,
      role,
      avatarUrl: previewUrl,
      teamId: selectedTeamId === "" ? undefined : Number(selectedTeamId),
    };

    console.log("Update payload:", payload);

    try {
      if (user.id === userIdFromStorage) {
        await updateCurrentUser(payload);
      } else {
        await updateUserById(user.id, payload);
      }
      setEdit(false);
    } catch (error) {
      console.error("Failed to update user:", error);
      // Optionally show error message to user
    }
  };


  const avatarBlock = previewUrl
    ? (
      <img
        src={previewUrl}
        alt={username}
        className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-gray-700"
      />
    )
    : (
      <div className="w-24 h-24 rounded-full bg-gray-700 mb-6 flex items-center justify-center text-gray-300 text-3xl border-4 border-gray-700">
        {username?.charAt(0).toUpperCase() ?? "?"}
      </div>
    );

  return (
    <section className="flex-1 bg-[#23243a] flex items-center justify-center h-screen">
      <div className="bg-[#292b3c] rounded-xl shadow-2xl p-10 w-[350px] max-w-md mx-auto text-center flex flex-col items-center">
        {avatarBlock}
        {!edit ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
            <div className="mb-1 text-gray-400">{user.role}</div>
            <div className="mb-1 text-gray-400">{user.email}</div>
            <div className="mb-6 text-green-400">
              <span className="font-semibold text-white">Team:</span> {user.teamName ?? "None"}
            </div>
            <button
              onClick={() => setEdit(true)}
              className="px-5 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition mb-2"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
            >
              Go Back
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mb-4 px-4 py-2 rounded bg-[#23243a] text-white border border-gray-700 w-full"
              required
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="mb-4 px-4 py-2 rounded bg-[#23243a] text-white border border-gray-700 w-full"
              required
            >
              <option value="" disabled>Select role</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mb-4 px-4 py-2 rounded bg-[#23243a] text-white border border-gray-700 w-full"
              required
            />
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mb-4 px-4 py-2 rounded bg-[#23243a] text-white border border-gray-700 w-full"
            >
              <option value="">No Team</option>
              {teams.map(team => (
                <option value={team.id} key={team.id}>{team.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAvatarModal(true)}
              className="mb-4 px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition w-full"
            >
              Choose Avatar
            </button>

            <button
              onClick={handleSave}
              className="bg-blue-600 text-white rounded px-5 py-2 font-bold hover:bg-blue-700 transition mb-2 w-full"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEdit(false);
                setPreviewUrl(user.avatarUrl ?? "");
                setUsername(user.username ?? "");
                setEmail(user.email ?? "");
                setSelectedTeamId(user.teamId ?? "");
              }}
              className="text-gray-300 hover:text-gray-100 mb-2 w-full"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {showAvatarModal && <AvatarModal onSelect={handleAvatarSelect} />}
    </section>
  );
}
