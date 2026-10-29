const router = require("express").Router();
const db = require("../db");
const { auth, allow } = require("../middleware/auth");
const { logActivity } = require("../utils/activity");

router.use(auth);

const SELECT = `
  SELECT p.*, h.name AS homeowner_name, c.name AS contractor_name
  FROM projects p
  LEFT JOIN users h ON h.id = p.homeowner_id
  LEFT JOIN users c ON c.id = p.contractor_id
`;

// Homeowners and contractors list, for the company's create form
router.get("/people", allow("company"), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, email, role FROM users WHERE role IN ('homeowner','contractor') ORDER BY name"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Create project (company only)
router.post("/", allow("company"), async (req, res) => {
  const {
    name,
    location,
    status = "planning",
    budget,
    start_date,
    end_date,
    homeowner_id,
    contractor_id,
    description,
    image_url,
    progress = 0,
  } = req.body;
  if (!name)
    return res.status(400).json({ message: "Project name is required" });
  try {
    const { rows } = await db.query(
      `INSERT INTO projects
        (name, location, status, budget, start_date, end_date, homeowner_id, contractor_id, created_by, description, image_url, progress)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        name,
        location || null,
        status || "planning",
        budget || null,
        start_date || null,
        end_date || null,
        homeowner_id || null,
        contractor_id || null,
        req.user.id,
        description || null,
        image_url || null,
        progress || 0,
      ]
    );

    const project = rows[0];
    await logActivity(
      project.id,
      req.user.id,
      "Created project",
      `Created project: ${name}`
    );

    res.status(201).json(project);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not create project" });
  }
});

// List projects, filtered by role
router.get("/", async (req, res) => {
  try {
    let result;
    if (req.user.role === "company") {
      result = await db.query(`${SELECT} ORDER BY p.created_at DESC`);
    } else if (req.user.role === "homeowner") {
      result = await db.query(
        `${SELECT} WHERE p.homeowner_id = $1 ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await db.query(
        `${SELECT} WHERE p.contractor_id = $1 ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// One project (only if the user is allowed to see it)
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query(`${SELECT} WHERE p.id = $1`, [
      req.params.id,
    ]);
    const p = rows[0];
    if (!p) return res.status(404).json({ message: "Project not found" });
    const { role, id } = req.user;
    const ok =
      role === "company" ||
      (role === "homeowner" && Number(p.homeowner_id) === Number(id)) ||
      (role === "contractor" && Number(p.contractor_id) === Number(id));
    if (!ok) return res.status(403).json({ message: "Not allowed" });
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// Update project (company only)
router.put("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    location,
    status,
    budget,
    start_date,
    end_date,
    homeowner_id,
    contractor_id,
    description,
    image_url,
    progress,
  } = req.body;

  try {
    const existing = await db.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const current = existing.rows[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedLocation =
      location !== undefined ? location : current.location;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedBudget = budget !== undefined ? budget : current.budget;
    const updatedStart =
      start_date !== undefined ? start_date : current.start_date;
    const updatedEnd = end_date !== undefined ? end_date : current.end_date;
    const updatedHomeowner =
      homeowner_id !== undefined ? homeowner_id : current.homeowner_id;
    const updatedContractor =
      contractor_id !== undefined ? contractor_id : current.contractor_id;
    const updatedDesc =
      description !== undefined ? description : current.description;
    const updatedImage =
      image_url !== undefined ? image_url : current.image_url;
    const updatedProgress =
      progress !== undefined ? progress : current.progress;

    await db.query(
      `UPDATE projects
       SET name = $1, location = $2, status = $3, budget = $4,
           start_date = $5, end_date = $6, homeowner_id = $7,
           contractor_id = $8, description = $9, image_url = $10, progress = $11
       WHERE id = $12`,
      [
        updatedName,
        updatedLocation,
        updatedStatus,
        updatedBudget,
        updatedStart,
        updatedEnd,
        updatedHomeowner,
        updatedContractor,
        updatedDesc,
        updatedImage,
        updatedProgress,
        id,
      ]
    );

    const { rows: updatedRows } = await db.query(
      `${SELECT} WHERE p.id = $1`,
      [id]
    );
    const updatedProject = updatedRows[0];

    await logActivity(
      id,
      req.user.id,
      "Updated project",
      `Updated project: ${updatedProject.name}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(id)).emit("project_updated", updatedProject);
    }

    res.json(updatedProject);
  } catch (e) {
    console.error("Error updating project:", e);
    res.status(500).json({ message: "Could not update project" });
  }
});

// Delete project (company only)
router.delete("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await db.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const current = existing.rows[0];

    await db.query("DELETE FROM projects WHERE id = $1", [id]);

    const io = req.app.get("io");
    if (io) {
      io.to(String(id)).emit("project_deleted", { id: Number(id) });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (e) {
    console.error("Error deleting project:", e);
    res.status(500).json({ message: "Could not delete project" });
  }
});

module.exports = router;
