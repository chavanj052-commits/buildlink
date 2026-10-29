const pool = require("../db");

async function logActivity(projectId, userId, action, details = null) {
  try {
    await pool.query(
      "INSERT INTO activity_log (project_id, user_id, action, details) VALUES ($1, $2, $3, $4)",
      [projectId, userId, action, details]
    );
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
}

module.exports = { logActivity };
