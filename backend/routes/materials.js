const express = require("express");
const pool = require("../db");
const { auth, allow } = require("../middleware/auth");
const { checkProjectAccess } = require("../utils/projectAccess");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// GET /project/:projectId/summary - Get material cost summary
router.get("/project/:projectId/summary", async (req, res) => {
  const { projectId } = req.params;
  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const { rows } = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN party = 'homeowner' THEN (quantity * rate) ELSE 0 END), 0) AS homeowner_total,
        COALESCE(SUM(CASE WHEN party = 'contractor' THEN (quantity * rate) ELSE 0 END), 0) AS contractor_total,
        COALESCE(SUM(quantity * rate), 0) AS grand_total
       FROM materials
       WHERE project_id = $1`,
      [projectId]
    );

    const summary = rows[0] || {
      homeowner_total: 0,
      contractor_total: 0,
      grand_total: 0,
    };

    res.json({
      homeowner_total: Number(summary.homeowner_total),
      contractor_total: Number(summary.contractor_total),
      grand_total: Number(summary.grand_total),
    });
  } catch (err) {
    console.error("Error fetching material summary:", err);
    res.status(500).json({ message: "Failed to fetch material summary" });
  }
});

// GET /project/:projectId - List materials for a project
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    let query = `
      SELECT *, (quantity * rate) AS total_cost
      FROM materials
      WHERE project_id = $1
    `;
    const params = [projectId];

    if (req.user.role === "homeowner") {
      query += " AND party = 'homeowner'";
    } else if (req.user.role === "contractor") {
      query += " AND party = 'contractor'";
    }
    query += " ORDER BY id ASC";

    const { rows } = await pool.query(query, params);
    const materials = rows.map((r) => ({
      ...r,
      quantity: Number(r.quantity),
      rate: Number(r.rate),
      total_cost: Number(r.total_cost || 0),
    }));

    res.json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ message: "Failed to fetch materials" });
  }
});

// POST /project/:projectId - Add material (company only)
router.post("/project/:projectId", allow("company"), async (req, res) => {
  const { projectId } = req.params;
  const {
    name,
    quantity,
    unit = "units",
    rate = 0,
    party = "homeowner",
    status = "pending",
    delivery_status = "pending",
  } = req.body;

  if (!name || quantity === undefined || quantity === null) {
    return res.status(400).json({ message: "Name and quantity are required" });
  }

  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const { rows } = await pool.query(
      `INSERT INTO materials
        (project_id, name, quantity, unit, rate, party, status, delivery_status, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *, (quantity * rate) AS total_cost`,
      [
        projectId,
        name,
        quantity,
        unit,
        rate,
        party,
        status,
        delivery_status,
        req.user.id,
      ]
    );

    const material = {
      ...rows[0],
      quantity: Number(rows[0].quantity),
      rate: Number(rows[0].rate),
      total_cost: Number(rows[0].total_cost || 0),
    };

    await logActivity(
      projectId,
      req.user.id,
      "Added material",
      `Added material ${name} (${quantity} ${unit}) for ${party}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(projectId)).emit("material_added", material);
    }

    res.status(201).json(material);
  } catch (err) {
    console.error("Error adding material:", err);
    res.status(500).json({ message: "Failed to add material" });
  }
});

// PUT /:id - Update material (company only)
router.put("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, rate, party, status, delivery_status } =
    req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM materials WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Material not found" });
    }
    const current = existing.rows[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedQty = quantity !== undefined ? quantity : current.quantity;
    const updatedUnit = unit !== undefined ? unit : current.unit;
    const updatedRate = rate !== undefined ? rate : current.rate;
    const updatedParty = party !== undefined ? party : current.party;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedDelivery =
      delivery_status !== undefined ? delivery_status : current.delivery_status;

    const { rows } = await pool.query(
      `UPDATE materials
       SET name = $1, quantity = $2, unit = $3, rate = $4, party = $5, status = $6, delivery_status = $7
       WHERE id = $8
       RETURNING *, (quantity * rate) AS total_cost`,
      [
        updatedName,
        updatedQty,
        updatedUnit,
        updatedRate,
        updatedParty,
        updatedStatus,
        updatedDelivery,
        id,
      ]
    );

    const updated = {
      ...rows[0],
      quantity: Number(rows[0].quantity),
      rate: Number(rows[0].rate),
      total_cost: Number(rows[0].total_cost || 0),
    };

    await logActivity(
      current.project_id,
      req.user.id,
      "Updated material",
      `Updated material ${updated.name}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(current.project_id)).emit("material_updated", updated);
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ message: "Failed to update material" });
  }
});

// DELETE /:id - Delete material (company only)
router.delete("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query(
      "SELECT * FROM materials WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Material not found" });
    }
    const current = existing.rows[0];

    await pool.query("DELETE FROM materials WHERE id = $1", [id]);

    await logActivity(
      current.project_id,
      req.user.id,
      "Deleted material",
      `Deleted material ${current.name}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(current.project_id)).emit("material_deleted", {
        id: Number(id),
        project_id: current.project_id,
      });
    }

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({ message: "Failed to delete material" });
  }
});

module.exports = router;
