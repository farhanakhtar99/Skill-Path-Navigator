import { useState } from "react";
import PathView from "./PathView.jsx";
import { getPath } from "../api.js";

export default function RoleCard({ roleData, knownSkills }) {
  const {
    role,
    readinessPercent,
    missingSkills,
    alreadyHaveSkills,
    recommendedCourses,
  } = roleData;

  const [openSkill, setOpenSkill] = useState(null);
  const [pathFrom, setPathFrom] = useState(knownSkills[0] || "");
  const [pathLoading, setPathLoading] = useState(false);
  const [pathResult, setPathResult] = useState(null);

  async function handleShowPath(missingSkill) {
    if (openSkill === missingSkill) {
      setOpenSkill(null);
      return;
    }
    setOpenSkill(missingSkill);
    setPathResult(null);

    const source = pathFrom || knownSkills[0];
    if (!source) return;

    setPathLoading(true);
    try {
      const result = await getPath(source, missingSkill);
      setPathResult(result);
    } catch (err) {
      setPathResult({ found: false });
    } finally {
      setPathLoading(false);
    }
  }

  return (
    <article className="role-card">
      <header className="role-card__header">
        <h3>{role}</h3>
        <span className="role-card__score">{readinessPercent}% ready</span>
      </header>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${readinessPercent}%` }}
        />
      </div>

      {alreadyHaveSkills.length > 0 && (
        <p className="role-card__have">
          Already have: {alreadyHaveSkills.join(", ")}
        </p>
      )}

      {missingSkills.length === 0 ? (
        <p className="role-card__done">You're fully ready for this role.</p>
      ) : (
        <ul className="gap-list">
          {missingSkills.map((skill) => (
            <li key={skill} className="gap-item">
              <div className="gap-item__row">
                <span className="gap-item__skill">{skill}</span>
                <button
                  className="link-button"
                  onClick={() => handleShowPath(skill)}
                >
                  {openSkill === skill ? "Hide route" : "Show route"}
                </button>
              </div>

              {recommendedCourses[skill]?.length > 0 && (
                <p className="gap-item__course">
                  Course: {recommendedCourses[skill].join(", ")}
                </p>
              )}

              {openSkill === skill && (
                <div className="gap-item__path">
                  {knownSkills.length > 1 && (
                    <label className="path-from-select">
                      From:{" "}
                      <select
                        value={pathFrom}
                        onChange={(e) => {
                          setPathFrom(e.target.value);
                          setPathResult(null);
                          handleShowPathFromSelect(e.target.value, skill);
                        }}
                      >
                        {knownSkills.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <PathView
                    loading={pathLoading}
                    result={pathResult}
                    fromSkill={pathFrom}
                    toSkill={skill}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );

  async function handleShowPathFromSelect(source, toSkill) {
    setPathLoading(true);
    try {
      const result = await getPath(source, toSkill);
      setPathResult(result);
    } catch {
      setPathResult({ found: false });
    } finally {
      setPathLoading(false);
    }
  }
}
