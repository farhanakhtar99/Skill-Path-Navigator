export default function PathView({ loading, result, fromSkill, toSkill }) {
  if (loading) {
    return <p className="path-status">Finding the shortest route...</p>;
  }

  if (!result) return null;

  if (!result.found) {
    return (
      <p className="path-status path-status--empty">
        No prerequisite chain connects <strong>{fromSkill}</strong> to{" "}
        <strong>{toSkill}</strong> yet. A dedicated course is the fastest way in
        - see the recommendation above.
      </p>
    );
  }

  return (
    <div className="route">
      {result.steps.map((step, i) => (
        <div className="route-step" key={step}>
          <span className="route-node">{step}</span>
          {i < result.steps.length - 1 && (
            <span className="route-line" aria-hidden="true" />
          )}
        </div>
      ))}
      <p className="path-status">
        {result.hops} {result.hops === 1 ? "hop" : "hops"} from what you already
        know.
      </p>
    </div>
  );
}
