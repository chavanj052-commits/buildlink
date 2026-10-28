const router = require("express").Router();
const db = require("../db");
const { auth, allow } = require("../middleware/auth");

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
      "SELECT id, name, email, role FROM users WHERE role IN ('homeowner','contractor') ORDER BY name",
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
    budget,
    start_date,
    end_date,
    homeowner_id,
    contractor_id,
  } = req.body;
  if (!name)
    return res.status(400).json({ message: "Project name is required" });
  try {
    const { rows } = await db.query(
      `INSERT INTO projects
        (name, location, budget, start_date, end_date, homeowner_id, contractor_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name,
        location || null,
        budget || null,
        start_date || null,
        end_date || null,
        homeowner_id || null,
        contractor_id || null,
        req.user.id,
      ],
    );
    res.status(201).json(rows[0]);
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
        [req.user.id],
      );
    } else {
      result = await db.query(
        `${SELECT} WHERE p.contractor_id = $1 ORDER BY p.created_at DESC`,
        [req.user.id],
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
      (role === "homeowner" && p.homeowner_id === id) ||
      (role === "contractor" && p.contractor_id === id);
    if (!ok) return res.status(403).json({ message: "Not allowed" });
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
