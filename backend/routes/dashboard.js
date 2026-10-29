const express = require("express");
const pool = require("../db");
const { auth } = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// GET /stats - Return role-based dashboard statistics
router.get("/stats", async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    if (role === "company") {
      // 1. Projects statistics
      const statusRes = await pool.query(
        "SELECT status, COUNT(*) AS count FROM projects GROUP BY status"
      );
      let totalProjects = 0;
      let activeProjects = 0;
      let completedProjects = 0;
      let onHoldProjects = 0;

      for (const row of statusRes.rows) {
        const count = parseInt(row.count, 10);
        totalProjects += count;
        const st = (row.status || "").toLowerCase();
        if (st === "in_progress" || st === "planning" || st === "active") {
          if (st === "in_progress") activeProjects += count;
        }
        if (st === "completed") completedProjects += count;
        if (st === "on_hold" || st === "hold") onHoldProjects += count;
      }

      // Total budget
      const budgetRes = await pool.query(
        "SELECT COALESCE(SUM(budget), 0) AS total_budget FROM projects"
      );
      const totalBudget = Number(budgetRes.rows[0].total_budget);

      // Total spent (completed payments)
      const spentRes = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_spent FROM payments WHERE status = 'completed'"
      );
      const totalSpent = Number(spentRes.rows[0].total_spent);

      // Total materials cost
      const matRes = await pool.query(
        "SELECT COALESCE(SUM(quantity * rate), 0) AS total_materials_cost FROM materials"
      );
      const totalMaterialsCost = Number(matRes.rows[0].total_materials_cost);

      // Recent 5 projects
      const recentProjRes = await pool.query(
        `SELECT p.*, h.name AS homeowner_name, c.name AS contractor_name
         FROM projects p
         LEFT JOIN users h ON h.id = p.homeowner_id
         LEFT JOIN users c ON c.id = p.contractor_id
         ORDER BY p.created_at DESC
         LIMIT 5`
      );

      // Recent 10 activity log entries with user and project name
      const activityRes = await pool.query(
        `SELECT a.*, u.name AS user_name, u.role AS user_role, p.name AS project_name
         FROM activity_log a
         LEFT JOIN users u ON u.id = a.user_id
         LEFT JOIN projects p ON p.id = a.project_id
         ORDER BY a.created_at DESC
         LIMIT 10`
      );

      return res.json({
        role: "company",
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        on_hold_projects: onHoldProjects,
        total_budget: totalBudget,
        total_spent: totalSpent,
        total_materials_cost: totalMaterialsCost,
        recent_projects: recentProjRes.rows,
        recent_activity: activityRes.rows,
      });
    }

    if (role === "homeowner") {
      // Find homeowner's primary/first project
      const projRes = await pool.query(
        `SELECT p.*, h.name AS homeowner_name, c.name AS contractor_name
         FROM projects p
         LEFT JOIN users h ON h.id = p.homeowner_id
         LEFT JOIN users c ON c.id = p.contractor_id
         WHERE p.homeowner_id = $1
         ORDER BY p.created_at DESC
         LIMIT 1`,
        [userId]
      );

      const project = projRes.rows[0] || null;

      if (!project) {
        return res.json({
          role: "homeowner",
          project: null,
          total_budget: 0,
          total_spent: 0,
          remaining: 0,
          homeowner_materials: [],
          payment_history: [],
          recent_activity: [],
        });
      }

      const totalBudget = Number(project.budget || 0);

      // Completed homeowner payments for this project
      const spentRes = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total_spent
         FROM payments
         WHERE project_id = $1 AND party = 'homeowner' AND status = 'completed'`,
        [project.id]
      );
      const totalSpent = Number(spentRes.rows[0].total_spent);
      const remaining = Math.max(0, totalBudget - totalSpent);

      // Homeowner materials
      const matRes = await pool.query(
        `SELECT *, (quantity * rate) AS total_cost
         FROM materials
         WHERE project_id = $1 AND party = 'homeowner'
         ORDER BY id ASC`,
        [project.id]
      );
      const homeownerMaterials = matRes.rows.map((r) => ({
        ...r,
        quantity: Number(r.quantity),
        rate: Number(r.rate),
        total_cost: Number(r.total_cost || 0),
      }));

      // Payment history
      const payRes = await pool.query(
        `SELECT *
         FROM payments
         WHERE project_id = $1 AND party = 'homeowner'
         ORDER BY payment_date DESC, id DESC`,
        [project.id]
      );
      const paymentHistory = payRes.rows.map((r) => ({
        ...r,
        amount: Number(r.amount),
      }));

      // Recent activity for their project
      const actRes = await pool.query(
        `SELECT a.*, u.name AS user_name, u.role AS user_role
         FROM activity_log a
         LEFT JOIN users u ON u.id = a.user_id
         WHERE a.project_id = $1
         ORDER BY a.created_at DESC
         LIMIT 10`,
        [project.id]
      );

      return res.json({
        role: "homeowner",
        project,
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining,
        homeowner_materials: homeownerMaterials,
        payment_history: paymentHistory,
        recent_activity: actRes.rows,
      });
    }

    if (role === "contractor") {
      // Find contractor's primary/first project
      const projRes = await pool.query(
        `SELECT p.*, h.name AS homeowner_name, c.name AS contractor_name
         FROM projects p
         LEFT JOIN users h ON h.id = p.homeowner_id
         LEFT JOIN users c ON c.id = p.contractor_id
         WHERE p.contractor_id = $1
         ORDER BY p.created_at DESC
         LIMIT 1`,
        [userId]
      );

      const project = projRes.rows[0] || null;

      if (!project) {
        return res.json({
          role: "contractor",
          project: null,
          pending_material_requests: [],
          approved_materials: [],
          contractor_payments: [],
          next_payment_amount: 0,
          next_deadline: null,
          recent_activity: [],
        });
      }

      // Pending material requests for contractor
      const pendingMatRes = await pool.query(
        `SELECT *, (quantity * rate) AS total_cost
         FROM materials
         WHERE project_id = $1 AND party = 'contractor' AND status = 'pending'
         ORDER BY id ASC`,
        [project.id]
      );
      const pendingMaterialRequests = pendingMatRes.rows.map((r) => ({
        ...r,
        quantity: Number(r.quantity),
        rate: Number(r.rate),
        total_cost: Number(r.total_cost || 0),
      }));

      // Approved materials for contractor
      const approvedMatRes = await pool.query(
        `SELECT *, (quantity * rate) AS total_cost
         FROM materials
         WHERE project_id = $1 AND party = 'contractor' AND status = 'approved'
         ORDER BY id ASC`,
        [project.id]
      );
      const approvedMaterials = approvedMatRes.rows.map((r) => ({
        ...r,
        quantity: Number(r.quantity),
        rate: Number(r.rate),
        total_cost: Number(r.total_cost || 0),
      }));

      // Contractor payments
      const payRes = await pool.query(
        `SELECT *
         FROM payments
         WHERE project_id = $1 AND party = 'contractor'
         ORDER BY payment_date DESC, id DESC`,
        [project.id]
      );
      const contractorPayments = payRes.rows.map((r) => ({
        ...r,
        amount: Number(r.amount),
      }));

      // Next payment amount and deadline
      const nextPayRes = await pool.query(
        `SELECT amount, payment_date
         FROM payments
         WHERE project_id = $1 AND party = 'contractor' AND status = 'pending'
         ORDER BY payment_date ASC, id ASC
         LIMIT 1`,
        [project.id]
      );

      let nextPaymentAmount = 0;
      let nextDeadline = project.end_date || null;
      if (nextPayRes.rows.length > 0) {
        nextPaymentAmount = Number(nextPayRes.rows[0].amount);
        nextDeadline = nextPayRes.rows[0].payment_date;
      }

      // Recent activity for their project
      const actRes = await pool.query(
        `SELECT a.*, u.name AS user_name, u.role AS user_role
         FROM activity_log a
         LEFT JOIN users u ON u.id = a.user_id
         WHERE a.project_id = $1
         ORDER BY a.created_at DESC
         LIMIT 10`,
        [project.id]
      );

      return res.json({
        role: "contractor",
        project,
        pending_material_requests: pendingMaterialRequests,
        approved_materials: approvedMaterials,
        contractor_payments: contractorPayments,
        next_payment_amount: nextPaymentAmount,
        next_deadline: nextDeadline,
        recent_activity: actRes.rows,
      });
    }

    res.status(400).json({ message: "Unknown user role" });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

module.exports = router;
