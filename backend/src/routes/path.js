// path.js
//
// The second required traversal query: given a skill the user already
// knows and a skill they need, find the actual shortest prerequisite
// chain between them (2+ hops in most real cases). This powers the
// "show me the route" view in the UI - a visual line of skill nodes.

const express = require("express");
const { getSession } = require("../db");

const router = express.Router();

const SHORTEST_PATH_QUERY = `
  MATCH (start:Skill {name: $fromSkill}), (target:Skill {name: $toSkill})
  OPTIONAL MATCH p = shortestPath((start)-[:PREREQUISITE_OF*0..6]->(target))
  RETURN [n IN nodes(p) | n.name] AS steps, length(p) AS hops
`;

router.post("/path", async (req, res, next) => {
  const { fromSkill, toSkill } = req.body;

  if (!fromSkill || !toSkill) {
    return res.status(400).json({ error: "fromSkill and toSkill are both required." });
  }

  const session = getSession();
  try {
    const result = await session.run(SHORTEST_PATH_QUERY, { fromSkill, toSkill });
    const record = result.records[0];
    const steps = record ? record.get("steps") : null;

    if (!steps) {
      return res.json({ found: false, steps: [], hops: null });
    }

    res.json({ found: true, steps, hops: record.get("hops").toNumber() });
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
