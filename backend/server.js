require("dotenv").config();
const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Socket.IO configuration with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

// Socket authentication middleware
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization
      ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, "")
      : null) ||
    socket.handshake.query?.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO connection and room management
io.on("connection", async (socket) => {
  const user = socket.user;

  // Auto-join socket rooms based on user's projects
  if (user && user.id) {
    try {
      let projects = [];
      if (user.role === "company") {
        const { rows } = await pool.query("SELECT id FROM projects");
        projects = rows;
      } else if (user.role === "homeowner") {
        const { rows } = await pool.query(
          "SELECT id FROM projects WHERE homeowner_id = $1",
          [user.id]
        );
        projects = rows;
      } else if (user.role === "contractor") {
        const { rows } = await pool.query(
          "SELECT id FROM projects WHERE contractor_id = $1",
          [user.id]
        );
        projects = rows;
      }

      for (const p of projects) {
        socket.join(String(p.id));
      }
    } catch (err) {
      console.error("Error auto-joining project rooms:", err.message);
    }
  }

  // Handle explicit join/leave room events
  socket.on("join_project", (projectId) => {
    if (projectId) {
      socket.join(String(projectId));
    }
  });

  socket.on("leave_project", (projectId) => {
    if (projectId) {
      socket.leave(String(projectId));
    }
  });

  socket.on("disconnect", () => {
    // Socket disconnected
  });
});

// Make io accessible to route handlers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Mount Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const materialRoutes = require("./routes/materials");
const paymentRoutes = require("./routes/payments");
const documentRoutes = require("./routes/documents");
const dashboardRoutes = require("./routes/dashboard");
const messageRoutes = require("./routes/messages");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler caught:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
