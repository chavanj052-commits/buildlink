import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io singleton management
let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to BuildLink Socket.IO server:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from Socket.IO server:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default API;
