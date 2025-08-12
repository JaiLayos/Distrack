'use client';

import Logo from "../GlobalComponent/Logo";
import MenuIcon from "../GlobalComponent/MenuIcon";
import HomeIcon from "../GlobalComponent/HomeIcon";
import AdminSideButton from "../GlobalComponent/AdminSideButton";
import Header from "../GlobalComponent/Header";
import MeSideButton from "../GlobalComponent/MeSideButton";
import UserSideButton from "../GlobalComponent/UserSideButton";
import LandingComponent from "./LandingComponent";
import { useState, useEffect } from "react";
import TaskTracker from "./TaskTracker";
import { fetchCurrentUser, fetchAllUsers, updateCurrentUser } from "../api";
import AvatarModal from "./AvatarModal";
import TeamAssignmentModal from "./TeamAssignmentModal";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  teamId: number;
  avatarUrl: string;
}


export default function Home() {
  const [activePage, setActivePage] = useState<'landing' | 'task'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);


  const handleAvatarSelection = async (url: string, imageFile?: File | null) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      avatarUrl: url,
      role: user.role as "ADMIN" | "USER",
    };

    try {
      const updated = await updateCurrentUser(updatedUser, imageFile);
      setUser(updated);
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  };

  const handleTeamModalAcknowledge = () => {
    localStorage.removeItem("token");
    window.location.reload(); 
  };


  useEffect(() => {
    fetchCurrentUser()
      .then(async (data) => {
        setUser(data);
        if (data.teamId === null) {
          setShowTeamModal(true);
          return;
        }

        console.log("Current user:", data);

        if (!data.avatarUrl || data.avatarUrl === "null") {
          setShowAvatarModal(true);
        }

        try {
          const allUsers = await fetchAllUsers();

          const teamAdmin = allUsers.find((u: User) =>
            u.teamId === data.teamId && u.role === "ADMIN"
          );
          setAdmin(teamAdmin || null);

          const members = allUsers.filter(
            (u: User) =>
              u.teamId === data.teamId &&
              u.role === "USER" &&
              u.id !== data.id
          );

          setTeamMembers(members);

          console.log("User's Admin: ", teamAdmin);
          console.log("Team Members: ", members);
        } catch (err) {
          console.error("Failed to fetch all users", err);
        }

      })
      .catch((err) => {
        console.error("Failed to fetch user", err);
      });

  }, []);

  if (!user) return (
      <main className="flex min-h-screen bg-[#151727] items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </main>
    );;

  return (
    <div className="w-screen h-screen overflow-x-hidden">
      <div className="w-full h-full flex flex-row">
        <div className="w-1/6 bg-black flex flex-col">
          <div className="w-full h-1/4 border-b border-nuanceDarkPastelBlue">
            <Logo />
          </div>
          <div className="w-full h-3/4 flex flex-col">
            <div className="h-[40%] p-2 flex flex-col">
              <div className="h-1/3"
                onClick={() => setActivePage('landing')}>
                <HomeIcon />
              </div>
              <div className="h-1/3"
                onClick={() => setActivePage('task')}>
                <MenuIcon />
              </div>
            </div>
            <div className="h-[60%] p-2 flex flex-col space-y-2 overflow-y-auto">
              <AdminSideButton admin={admin} />
              <MeSideButton user={user} />
              {teamMembers.map((member) => (
                <UserSideButton key={member.id} user={member} />
              ))}

            </div>

          </div>
        </div>
        <div className="w-5/6 flex flex-col">
          <Header user={user} />
          <div className="flex-1 h-0 flex">
            {activePage === 'landing' ? (
              <LandingComponent admin={admin} user={user} />
            ) : (
              <TaskTracker admin={admin} user={user} />
            )}
          </div>
        </div>
      </div>
      {showAvatarModal && (
        <AvatarModal onSelect={handleAvatarSelection} />
      )}
      {showTeamModal && 
      <TeamAssignmentModal onAcknowledge={handleTeamModalAcknowledge} />}

    </div>

  );
}
