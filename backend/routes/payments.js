const express = require("express");
const pool = require("../db");
const { auth, allow } = require("../middleware/auth");
const { checkProjectAccess } = require("../utils/projectAccess");
const { logActivity } = require("../utils/activity");

const router = express.Router();
router.use(auth);

// GET /project/:projectId - List payments
router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    let query = `
      SELECT p.*,
             up.name AS paid_by_name,
             ur.name AS received_by_name
      FROM payments p
      LEFT JOIN users up ON up.id = p.paid_by
      LEFT JOIN users ur ON ur.id = p.received_by
      WHERE p.project_id = $1
    `;
    const params = [projectId];

    if (req.user.role === "homeowner") {
      query += " AND p.party = 'homeowner'";
    } else if (req.user.role === "contractor") {
      query += " AND p.party = 'contractor'";
    }
    query += " ORDER BY p.payment_date DESC, p.id DESC";

    const { rows } = await pool.query(query, params);
    const payments = rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
    }));

    res.json(payments);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// POST /project/:projectId - Create payment (company only)
router.post("/project/:projectId", allow("company"), async (req, res) => {
  const { projectId } = req.params;
  const {
    amount,
    payment_type = "milestone",
    party = "homeowner",
    status = "pending",
    description = null,
    stage = null,
    received_by = null,
    payment_date = new Date().toISOString().split("T")[0],
  } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(400).json({ message: "Payment amount is required" });
  }

  try {
    const { error } = await checkProjectAccess(projectId, req.user);
    if (error) return res.status(error.status).json({ message: error.message });

    const { rows } = await pool.query(
      `INSERT INTO payments
        (project_id, amount, payment_type, party, status, description, stage, paid_by, received_by, payment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        projectId,
        amount,
        payment_type,
        party,
        status,
        description,
        stage,
        req.user.id,
        received_by,
        payment_date,
      ]
    );

    const payment = {
      ...rows[0],
      amount: Number(rows[0].amount),
    };

    await logActivity(
      projectId,
      req.user.id,
      "Created payment",
      `Recorded ${party} payment of $${amount} (${payment_type}) - ${status}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(projectId)).emit("payment_created", payment);
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

// PUT /:id - Update payment (company only)
router.put("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    payment_type,
    party,
    status,
    description,
    stage,
    received_by,
    payment_date,
  } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM payments WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    const current = existing.rows[0];

    const updatedAmount = amount !== undefined ? amount : current.amount;
    const updatedType =
      payment_type !== undefined ? payment_type : current.payment_type;
    const updatedParty = party !== undefined ? party : current.party;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedDesc =
      description !== undefined ? description : current.description;
    const updatedStage = stage !== undefined ? stage : current.stage;
    const updatedReceived =
      received_by !== undefined ? received_by : current.received_by;
    const updatedDate =
      payment_date !== undefined ? payment_date : current.payment_date;

    const { rows } = await pool.query(
      `UPDATE payments
       SET amount = $1, payment_type = $2, party = $3, status = $4,
           description = $5, stage = $6, received_by = $7, payment_date = $8
       WHERE id = $9
       RETURNING *`,
      [
        updatedAmount,
        updatedType,
        updatedParty,
        updatedStatus,
        updatedDesc,
        updatedStage,
        updatedReceived,
        updatedDate,
        id,
      ]
    );

    const updated = {
      ...rows[0],
      amount: Number(rows[0].amount),
    };

    await logActivity(
      current.project_id,
      req.user.id,
      "Updated payment",
      `Updated payment #${id} to status ${updated.status}`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(current.project_id)).emit("payment_updated", updated);
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ message: "Failed to update payment" });
  }
});

// DELETE /:id - Delete payment (company only)
router.delete("/:id", allow("company"), async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query("SELECT * FROM payments WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    const current = existing.rows[0];

    await pool.query("DELETE FROM payments WHERE id = $1", [id]);

    await logActivity(
      current.project_id,
      req.user.id,
      "Deleted payment",
      `Deleted payment #${id} ($${current.amount})`
    );

    const io = req.app.get("io");
    if (io) {
      io.to(String(current.project_id)).emit("payment_deleted", {
        id: Number(id),
        project_id: current.project_id,
      });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(500).json({ message: "Failed to delete payment" });
  }
});

module.exports = router;
