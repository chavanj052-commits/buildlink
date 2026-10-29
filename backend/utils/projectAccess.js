const pool = require("../db");

async function checkProjectAccess(projectId, user) {
  const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [
    projectId,
  ]);
  const project = rows[0];
  if (!project) {
    return { error: { status: 404, message: "Project not found" } };
  }

  const { role, id } = user;
  const isAllowed =
    role === "company" ||
    (role === "homeowner" && Number(project.homeowner_id) === Number(id)) ||
    (role === "contractor" && Number(project.contractor_id) === Number(id));

  if (!isAllowed) {
    return { error: { status: 403, message: "Access denied" } };
  }

  return { project };
}

module.exports = { checkProjectAccess };
