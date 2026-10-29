const express = require("express");
const pool = require("../db");
const { auth } = require("../middleware/auth");
const { checkProjectAccess } = require("../utils/projectAccess");

const router = express.Router();
router.use(auth);

// GET /project/:projectId - Get messages for a project
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const { rows } = await pool.query(
      `SELECT m.*, u.name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC`,
      [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST /project/:projectId - Send message
router.post("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Message content cannot be empty" });
  }

  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const insertResult = await pool.query(
      `INSERT INTO messages (project_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projectId, req.user.id, content.trim()]
    );

    const saved = insertResult.rows[0];

    const messageWithSender = {
      ...saved,
      sender_name: req.user.name,
      sender_role: req.user.role,
    };

    const io = req.app.get("io");
    if (io) {
      io.to(String(projectId)).emit("new_message", messageWithSender);
    }

    res.status(201).json(messageWithSender);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
