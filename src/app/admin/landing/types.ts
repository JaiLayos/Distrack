export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  teamId?: number;
  teamName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "ADDED" | "PENDING" | "COMPLETED";

export type TaskType = "TEAM" | "PERSONAL";

export type UserRole = "ADMIN" | "USER";

export type Task = {
  id: number;
  taskName: string;
  taskDescription: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  taskType: TaskType;
};

export type Team = {
  id: number;
  name: string;
  imageUrl?: string;
};
