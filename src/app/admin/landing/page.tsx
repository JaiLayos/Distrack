"use client";

import { useEffect, useState } from "react";
import TeamSidebar from "./components/teamsidebar";
import UserList from "./components/userlist";
import UserProfile from "./components/userprofile";
import TaskList from "./components/tasklist";
import TeamView from "./components/teamview";
import UserPanel from "./components/userpanel";
import TaskEditModal from "./components/taskedit";
import AddTeamModal from "./components/addteam";
import EditTeamModal from "./components/editteam";
import { User, Task, Team, UserRole } from "./types";
import { getTasks, getTeams, getUsers } from "@/app/api";
import { useCurrentUser } from "@/app/hooks/currentuser";
import axios from "axios";

// Define the shape for user update
type UserUpdateArgs = {
  userId: number;
  teamId: number | null;
  username?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  imageFile?: File | null;
};

export default function AdminLanding() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);

  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!user) return;
    getTeams().then(setTeams);
    getUsers().then(setUsers);
    getTasks().then(setTasks);
  }, [user]);

  const handleUserUpdate = async ({
    userId,
    teamId,
    username,
    email,
    name,
    role,
    imageFile,
  }: UserUpdateArgs) => {
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();

      const userUpdateDTO: any = { teamId };
      if (username !== undefined) userUpdateDTO.username = username;
      if (email !== undefined) userUpdateDTO.email = email;
      if (name !== undefined) userUpdateDTO.name = name;
      if (role !== undefined) userUpdateDTO.role = role;

      formData.append(
        "user",
        new Blob([JSON.stringify(userUpdateDTO)], { type: "application/json" })
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put(
        `https://chic-integrity-production.up.railway.app/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? {
                ...u,
                teamId,
                teamName: teams.find(t => t.id === teamId)?.name ?? null,
                avatarUrl: imageFile ? URL.createObjectURL(imageFile) : u.avatarUrl,
                username: username ?? u.username,
                email: email ?? u.email,
                role: role ?? u.role,
              }
            : u
        )
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev =>
          prev
            ? {
                ...prev,
                teamId,
                teamName: teams.find(t => t.id === teamId)?.name ?? null,
                avatarUrl: imageFile ? URL.createObjectURL(imageFile) : prev.avatarUrl,
                username: username ?? prev.username,
                email: email ?? prev.email,
                role: role ?? prev.role,
              }
            : null
        );
      }
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  const handleTaskSaved = (newTask: Task) => {
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === newTask.id ? newTask : t));
    } else {
      setTasks(prev => [...prev, newTask]);
    }
    setShowEditModal(false);
    setEditTask(null);
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setEditTask(null);
    setShowEditModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setShowEditModal(true);
    setSelectedTask(null);
  };

  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const PRIORITY_TASKS = tasks.filter(t => {
    const due = new Date(t.dueDate).getTime();
    return (t.status === "ADDED" || t.status === "PENDING") &&
          due >= now && due <= now + FIVE_DAYS_MS;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#151727] items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="flex min-h-screen bg-[#151727] items-center justify-center">
        <div className="text-white text-2xl">No user found</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#151727]">
      {selectedTeam ? (
        <>
          <div className="relative">
            <TeamSidebar teams={teams} onSelect={team => { setSelectedTeam(team); setSelectedUser(null); }} onAddTeam={() => setShowAddTeam(true)}/>
            <div className="absolute bottom-0 left-0 w-full">
              <UserPanel user={user} onLogout={() => {}} hideUsername={!!selectedTeam} />
            </div>
          </div>
          <TeamView team={selectedTeam} allTasks={tasks} users={users} onClose={() => setSelectedTeam(null)} onEditTeam={team => setEditTeam(team)}/>
          {editTeam && (
            <EditTeamModal
              open={!!editTeam}
              onClose={() => setEditTeam(null)}
              team={editTeam}
              onTeamUpdated={team => setTeams(prev => prev.map(t => t.id === team.id ? team : t))}
            />
          )}
        </>
      ) : (
        <>
          <div className="relative flex">
            <TeamSidebar teams={teams} onSelect={team => { setSelectedTeam(team); setSelectedUser(null); }} onAddTeam={() => setShowAddTeam(true)} />
            <UserList users={users} onSelect={setSelectedUser} />
            <div className="absolute bottom-0 left-0 w-full">
              <UserPanel user={user} onLogout={() => {}} />
            </div>
          </div>

          {selectedUser ? (
            <UserProfile
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              teams={teams}
            />
          ) : (
            <>
              <TaskList
                tasks={tasks}
                title="All Tasks"
                description="All tasks in the system."
                onTaskClick={setSelectedTask}
                onAddTask={handleAddTask}
              />
              <TaskList
                tasks={PRIORITY_TASKS}
                title="Priority Tasks"
                priority
                description="Tasks due in the next 5 days."
                onTaskClick={setSelectedTask}
              />

              {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                  <div className="bg-[#292b3c] rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl">
                    <div className="flex flex-col items-center">
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedTask.taskName}</h3>
                      <div className="text-gray-400 mb-2">{selectedTask.taskDescription}</div>
                      <div className="mb-2 text-white">
                        <span className="font-semibold">Status:</span> {selectedTask.status}
                      </div>
                      <div className="mb-2 text-white">
                        <span className="font-semibold">Due Date:</span> {new Date(selectedTask.dueDate).toLocaleString()}
                      </div>
                      <div className="mb-2 text-white">
                        <span className="font-semibold">Assigned To:</span> {selectedTask.userName}
                      </div>
                      {user?.role === "ADMIN" && (
                        <button
                          className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          onClick={() => handleEditTask(selectedTask)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setSelectedTask(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <TaskEditModal
                open={showEditModal}
                onClose={() => { setShowEditModal(false); setEditTask(null); }}
                task={editTask ?? undefined}
                users={users}
                onSaved={handleTaskSaved}
              />
            </>
          )}
        </>
      )}
      <AddTeamModal
        open={showAddTeam}
        onClose={() => setShowAddTeam(false)}
        onTeamAdded={team => setTeams(prev => [...prev, team])}
      />
    </main>
  );
}