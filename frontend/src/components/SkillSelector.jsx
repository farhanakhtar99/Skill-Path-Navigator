export default function SkillSelector({ skills, selected, onToggle }) {
  return (
    <div className="skill-grid">
      {skills.map((skill) => {
        const isChecked = selected.includes(skill);
        return (
          <label key={skill} className={`skill-chip ${isChecked ? "skill-chip--on" : ""}`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(skill)}
            />
            {skill}
          </label>
        );
      })}
    </div>
  );
}
