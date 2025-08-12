import axios from "axios";
import { Notification } from "./UserComponent/Announcement";
import { UserRole } from "./admin/landing/types";

// types.ts or in your component
export interface NotificationsDTO {
  id: number;
  userId: number;
  teamId: number;
  taskId: number;
  description: string;
  createdAt: string;
  read: boolean;
}

type UpdateUserPayload = {
  username?: string;
  email?: string;
  teamId?: number;
  role?: UserRole;
  avatarUrl?: string;
};




const API_BASE_URL = "https://chic-integrity-production.up.railway.app/api";
export const fetchTeams = async () => {
  const response = await axios.get(`${API_BASE_URL}/teams`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const registerUsers = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    email,
    password,
    role: "USER" // hardcoded role
  });
  return response.data;
};

export const login = async (
  email: string,
  password: string
) => {
  const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });

  const { token, ...loginData } = loginResponse.data;

  localStorage.setItem("token", token);

  const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    token,
    loginData,
    currentUser: userResponse.data,
  };
};


export const fetchTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasks`);
  return response.data;
};


export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("token"); // get token from localStorage
  const response = await axios.get(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchAllUsers = async () => {
  const token = localStorage.getItem("token"); // Assuming this is a protected route
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchNotifications = async (): Promise<Notification[]> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchPersonalTasks = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/tasks/users/${userId}/personal`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createPersonalTask = async (userId: number, taskName: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/tasks/users/${userId}/personal`,
    {
      taskName, // Only this is required
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchTaskById = async (id: number) => {
  const token = localStorage.getItem("token"); // If auth is needed
  const response = await axios.get(`${API_BASE_URL}/tasks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchTasksByUserId = async (userId: number) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/tasks/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateTask = async (task: {
  id: number;
  taskName: string;
  taskDescription: string;
  createdAt: string;
  dueDate: string;
  status: string;
  userId: number;
  taskType: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_BASE_URL}/tasks/${task.id}`, task, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateTaskStatus = async (taskId: number, status: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/tasks/${taskId}/status?status=${status}`,
    null, // No body needed
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateCurrentUser = async (
  userUpdateDTO: {
    username?: string;
    email?: string;
    password?: string;
    teamId?: number;
    role?: "ADMIN" | "USER";
    avatarUrl?: string;
  },
  imageFile?: File | null // optional image
) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  // Send the user object as JSON string under "user"
  formData.append("user", new Blob([JSON.stringify(userUpdateDTO)], { type: "application/json" }));

  // Add the image only if present
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await axios.put(`${API_BASE_URL}/users/me`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export async function updateUserById(
  id: number,
  userData: UpdateUserPayload,
  imageFile?: File | null
) {
  const formData = new FormData();

  // Append the user JSON
  formData.append("user", new Blob([JSON.stringify(userData)], { type: "application/json" }));

  // Append the image only if provided
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await axios.put(`${API_BASE_URL}/users/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // if using JWT
    },
  });

  return response.data;
}

function getToken() {
  return localStorage.getItem("token");
}

export const getTeams = async () => {
  const token = getToken();
  const response = await axios.get(`${API_BASE_URL}/teams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUsers = async () => {
  const token = getToken();
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getTasks = async () => {
  const token = getToken();
  const response = await axios.get(`${API_BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchNotificationsByUserId = async (userId: number): Promise<NotificationsDTO[]> => {
  const token = localStorage.getItem('token'); // or sessionStorage, depending on your auth flow

  const response = await axios.get<NotificationsDTO[]>(
    `${API_BASE_URL}/notifications/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // or just `token` depending on backend expectations
      },
    }
  );

  return response.data;
};
