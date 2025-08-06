"use client";

import React, { useState } from "react";
import { User, Team, UserRole } from "../types";
import AvatarModal from "@/app/UserComponent/AvatarModal";

type UserUpdateArgs = {
  userId: number;
  teamId: number | null;
  username?: string;
  email?: string;
  role?: UserRole;
  imageFile?: File | null;
  avatarUrl?: string;
};

type UserProfileProps = {
  user: User;
  onClose: () => void;
  teams: Team[];
  onUserUpdate: (args: UserUpdateArgs) => void;
};

export default function UserProfile({
  user,
  onClose,
  teams,
  onUserUpdate
}: UserProfileProps) {
  const [edit, setEdit] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">(user.teamId ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatarUrl ?? "");
  const [role, setRole] = useState<UserRole>(user.role ?? "")
  const [username, setUsername] = useState<string>(user.username ?? "");
  const [email, setEmail] = useState<string>(user.email ?? "");
  const [showAvatarModal, setShowAvatarModal] = useState(false);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onUserUpdate({
      userId: user.id,
      teamId: selectedTeamId === "" ? null : Number(selectedTeamId),
      username,
      email,
      role,
      imageFile,
      avatarUrl: imageFile ? undefined : previewUrl,
    });

    setEdit(false);
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
      <img
        src="/pattern.png"
        alt="Default Avatar"
        className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-gray-700"
      />
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
            <button onClick={() => setEdit(true)} className="px-5 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition mb-2">
              Edit
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
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
            ><option value="" disabled>Select role</option>
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
              className="mb-4 px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition block w-full"
            >
              Choose Avatar
            </button>
            <button onClick={handleSave} className="bg-blue-600 text-white rounded px-5 py-2 font-bold hover:bg-blue-700 transition mb-2 w-full">
              Save
            </button>
            <button
              onClick={() => {
                setEdit(false);
                setImageFile(null);
                setPreviewUrl(user.avatarUrl ?? "");
                setUsername(user.username ?? "");
                setEmail(user.email ?? "");
                setSelectedTeamId(user.teamId ?? "");
              }}
              className="text-gray-300 hover:text-gray-100 mb-2 w-full"
            >
              Cancel
            </button>

            {showAvatarModal && (
              <AvatarModal
                onSelect={(url, file) => {
                  setPreviewUrl(url);
                  setImageFile(file || null);
                  setShowAvatarModal(false);
                }}
              />
            )}

          </>
        )}
      </div>
    </section>
  );
}