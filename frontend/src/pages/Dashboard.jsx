import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div
      style={{ maxWidth: 360, margin: "60px auto", fontFamily: "sans-serif" }}
    >
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>
      <button onClick={logout} style={{ padding: 10 }}>
        Logout
      </button>
    </div>
  );
}
