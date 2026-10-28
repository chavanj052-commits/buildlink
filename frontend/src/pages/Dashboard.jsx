import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const emptyForm = {
  name: "",
  location: "",
  budget: "",
  start_date: "",
  end_date: "",
  homeowner_id: "",
  contractor_id: "",
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadProjects = () =>
    API.get("/projects").then(({ data }) => setProjects(data));

  useEffect(() => {
    API.get("/auth/me")
      .then(({ data }) => {
        setUser(data);
        loadProjects();
        if (data.role === "company") {
          API.get("/projects/people").then(({ data }) => setPeople(data));
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/projects", form);
      setForm(emptyForm);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create project");
    }
  };

  if (!user) return <p style={{ padding: 40 }}>Loading...</p>;

  const input = {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    boxSizing: "border-box",
  };
  const homeowners = people.filter((p) => p.role === "homeowner");
  const contractors = people.filter((p) => p.role === "contractor");

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "0 16px",
      }}
    >
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>
      <button onClick={logout} style={{ padding: 10 }}>
        Logout
      </button>

      {user.role === "company" && (
        <form onSubmit={createProject} style={{ marginTop: 30, maxWidth: 400 }}>
          <h3>Create project</h3>
          <input
            name="name"
            placeholder="Project name"
            value={form.name}
            onChange={handleChange}
            required
            style={input}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            style={input}
          />
          <input
            name="budget"
            type="number"
            placeholder="Budget (INR)"
            value={form.budget}
            onChange={handleChange}
            style={input}
          />
          <label>Start date</label>
          <input
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            style={input}
          />
          <label>End date</label>
          <input
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            style={input}
          />
          <select
            name="homeowner_id"
            value={form.homeowner_id}
            onChange={handleChange}
            style={input}
          >
            <option value="">Select homeowner</option>
            {homeowners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <select
            name="contractor_id"
            value={form.contractor_id}
            onChange={handleChange}
            style={input}
          >
            <option value="">Select contractor</option>
            {contractors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <button type="submit" style={{ width: "100%", padding: 10 }}>
            Create project
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}

      <h3 style={{ marginTop: 30 }}>Projects</h3>
      {projects.length === 0 && <p>No projects yet.</p>}
      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <strong>{p.name}</strong> <small>({p.status})</small>
          <div>Location: {p.location || "-"}</div>
          <div>Budget: {p.budget ? `₹${p.budget}` : "-"}</div>
          <div>
            Homeowner: {p.homeowner_name || "-"} | Contractor:{" "}
            {p.contractor_name || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
