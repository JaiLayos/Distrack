"use client";

import React from "react";
import { Team, Task, User } from "../types";

type TeamViewProps = {
  team: Team;
  allTasks: Task[];
  users: User[];
  onClose: () => void;
  onEditTeam: (team: Team) => void;
};

export default function TeamView({ team, allTasks, users, onClose, onEditTeam }: TeamViewProps) {
  const teamMembers = users.filter(user => user.teamId === team.id);
  const teamUserIds = teamMembers.map(user => user.id);
  const teamTasks = allTasks.filter(task => teamUserIds.includes(task.userId));
  const sortedTasks = teamTasks
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const now = Date.now();
  const nearestDue = sortedTasks.length > 0 ? sortedTasks[0] : null;

  function getTaskStatus(task: Task) {
    const due = new Date(task.dueDate).getTime();
    if (task.status === "COMPLETED") return "Completed";
    if (due < now) return "Overdue";
    if (task.id === nearestDue?.id) return "Nearest Due";
    return task.status === "PENDING" ? "Pending" : "Added";
  }

  return (
    <div className="flex w-full h-screen">
      {/* Team Tasks Section */}
      <section className="w-[60%] bg-[#1e202d] p-8 flex flex-col h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{team.name} Tasks</h2>
            {/* Edit Team Button */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 ml-2 flex items-center justify-center"
              title="Edit Team"
              onClick={() => onEditTeam(team)}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M16.862 5.487a2.003 2.003 0 0 1 2.828 2.828l-9.193 9.193-3.535.707.707-3.535 9.193-9.193z"/>
              </svg>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
        {sortedTasks.length === 0 ? (
          <div className="text-gray-400 mt-10 text-center">No tasks assigned to this team.</div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const statusLabel = getTaskStatus(task);
              const isOverdue = statusLabel === "Overdue";
              const isNearest = statusLabel === "Nearest Due";
              return (
                <div
                  key={task.id}
                  className={`bg-[#23243a] rounded-lg shadow p-4 border-l-4 ${
                    isOverdue ? "border-red-500" : isNearest ? "border-yellow-400" : "border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-semibold ${
                        isOverdue ? "text-red-400" : isNearest ? "text-yellow-400" : "text-gray-200"
                      }`}
                    >
                      {task.taskName}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-800 text-white ml-2">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-400">{task.taskDescription}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="font-semibold">Due:</span> {new Date(task.dueDate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Assigned to:</span> {task.userName}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Team Members Section */}
      <section className="w-[40%] bg-[#292b3c] p-8 flex flex-col h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{team.name} Members</h2>
        {teamMembers.length === 0 ? (
          <div className="text-gray-400">No members in this team.</div>
        ) : (
          <ul className="space-y-6">
            {teamMembers.map(user => (
              <li key={user.id} className="flex items-center gap-4 bg-[#23243a] p-4 rounded-lg shadow">
                <img
                  src={user.avatarUrl || "/pattern.png"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                />
                <div>
                  <div className="text-white font-semibold">{user.username}</div>
                  <div className="text-gray-400 text-sm">{user.role}</div>
                  <div className="text-gray-400 text-xs">{user.email}</div>
                  {user.teamName && (
                    <div className="text-green-400 text-xs">{user.teamName}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}