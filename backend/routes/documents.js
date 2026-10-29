const express = require("express");
const path = require("path");
const fs = require("fs");
const pool = require("../db");
const { auth, allow } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { checkProjectAccess } = require("../utils/projectAccess");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// GET /project/:projectId - List documents/designs for a project
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const { rows } = await pool.query(
      `SELECT d.*, u.name AS uploaded_by_name, u.role AS uploaded_by_role
       FROM designs d
       LEFT JOIN users u ON u.id = d.uploaded_by
       WHERE d.project_id = $1
       ORDER BY d.created_at DESC`,
      [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

// POST /project/:projectId - Upload document (company only)
router.post(
  "/project/:projectId",
  allow("company"),
  upload.single("file"),
  async (req, res) => {
    const { projectId } = req.params;
    const {
      title,
      file_type = "design",
      description = null,
      file_url: bodyUrl,
    } = req.body;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : bodyUrl;

    if (!fileUrl) {
      return res.status(400).json({ message: "File or file URL is required" });
    }

    const docTitle =
      title || (req.file ? req.file.originalname : "Untitled Document");

    try {
      const { error } = await checkProjectAccess(projectId, req.user);
      if (error)
        return res.status(error.status).json({ message: error.message });

      const { rows } = await pool.query(
        `INSERT INTO designs
          (project_id, title, file_url, uploaded_by, file_type, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, docTitle, fileUrl, req.user.id, file_type, description]
      );

      const document = rows[0];

      await logActivity(
        projectId,
        req.user.id,
        "Uploaded document",
        `Uploaded document: ${docTitle} (${file_type})`
      );

      const io = req.app.get("io");
      if (io) {
        io.to(String(projectId)).emit("document_uploaded", document);
      }

      res.status(201).json(document);
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ message: "Failed to upload document" });
    }
  }
);

// DELETE /:id - Delete document (company only)
router.delete("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query("SELECT * FROM designs WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }
    const current = existing.rows[0];

    await pool.query("DELETE FROM designs WHERE id = $1", [id]);

    // Try deleting the physical file if it exists locally in /uploads/
    if (current.file_url && current.file_url.startsWith("/uploads/")) {
      const filename = current.file_url.replace("/uploads/", "");
      const filePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete physical file:", e.message);
        }
      }
    }

    await logActivity(
      current.project_id,
      req.user.id,
      "Deleted document",
      `Deleted document: ${current.title}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(current.project_id)).emit("document_deleted", {
        id: Number(id),
        project_id: current.project_id,
      });
    }

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Failed to delete document" });
  }
});

module.exports = router;
