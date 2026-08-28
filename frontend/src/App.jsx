import { useEffect, useState } from "react";
import SkillSelector from "./components/SkillSelector.jsx";
import RoleCard from "./components/RoleCard.jsx";
import { getSkills, getReadiness, checkHealth } from "./api.js";

export default function App() {
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState([]);
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState("checking");

  useEffect(() => {
    checkHealth()
      .then(() => setDbStatus("ok"))
      .catch(() => setDbStatus("down"));

    getSkills()
      .then(setSkills)
      .catch((err) => setError(err.message));
  }, []);

  function toggleSkill(skill) {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  async function handleCheckReadiness() {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadiness(selected);
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <p className="eyebrow">Skill Path Navigator</p>
        <hr />
        <h1>Find the shortest route to your next role.</h1>
        <p className="hero-sub">
          Tell it what you already know. It traces the prerequisite graph to
          rank roles by how close you are, and maps the exact path for what's
          left.
        </p>
        {dbStatus === "down" && (
          <p className="db-warning">
            Can't reach the database right now. Check your CognoDB connection
            details in backend/.env and that your instance is running.
          </p>
        )}
      </div>

      <div className="panel">
        <h2>1. What do you already know?</h2>
        {skills.length === 0 && dbStatus !== "down" && (
          <p className="path-status">Loading skills...</p>
        )}
        <SkillSelector
          skills={skills}
          selected={selected}
          onToggle={toggleSkill}
        />

        <button
          className="primary-button"
          disabled={selected.length === 0 || loading}
          onClick={handleCheckReadiness}
        >
          {loading ? "Calculating..." : `Check readiness`}
        </button>

        {error && <p className="error-text">{error}</p>}
      </div>

      {roles && (
        <div className="panel">
          <h2>2. Your best-fit roles</h2>
          <div className="role-grid">
            {roles.map((r) => (
              <RoleCard key={r.role} roleData={r} knownSkills={selected} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
