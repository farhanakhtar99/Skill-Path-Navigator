// readiness.js
//
// This is the query that shows why a graph database earns its place here.
//
// For every Role, and for every Skill it REQUIRES, we ask: "is this skill
// reachable from something the user already knows, by following up to 3
// PREREQUISITE_OF hops?" A distance of 0 means the user already has the
// exact skill. A distance of 1-3 means they're a short, learnable chain
// away. No path found means it's a genuine gap.
//
// Doing this in SQL would mean a recursive CTE walking a self-referencing
// prerequisites table, joined against a role-requirements table, grouped
// per role, with the shortest-depth-per-skill picked out of the recursion -
// awkward to write and awkward to read. In Cypher it's one readable query.

const express = require("express");
const { getSession } = require("../db");

const router = express.Router();

const READINESS_QUERY = `
  MATCH (role:Role)-[:REQUIRES]->(req:Skill)
  OPTIONAL MATCH path = (known:Skill)-[:PREREQUISITE_OF*0..3]->(req)
  WHERE known.name IN $knownSkills
  WITH role, req, min(length(path)) AS distance
  WITH role,
       collect({skill: req.name, distance: distance}) AS gaps
  RETURN role.name AS role,
         size(gaps) AS totalRequired,
         size([g IN gaps WHERE g.distance IS NOT NULL]) AS reachableCount,
         [g IN gaps WHERE g.distance IS NULL | g.skill] AS missingSkills,
         [g IN gaps WHERE g.distance = 0 | g.skill] AS alreadyHaveSkills
  ORDER BY reachableCount * 1.0 / totalRequired DESC
`;

// For every missing skill, find courses that teach it, so the UI can
// suggest a concrete next step instead of just naming the gap.
const COURSES_FOR_SKILLS_QUERY = `
  MATCH (c:Course)-[:TEACHES]->(s:Skill)
  WHERE s.name IN $skillNames
  RETURN s.name AS skill, collect(DISTINCT c.name) AS courses
`;

router.post("/readiness", async (req, res, next) => {
  const knownSkills = Array.isArray(req.body.knownSkills) ? req.body.knownSkills : [];

  const session = getSession();
  try {
    const roleResult = await session.run(READINESS_QUERY, { knownSkills });

    const roles = roleResult.records.map((r) => ({
      role: r.get("role"),
      totalRequired: r.get("totalRequired").toNumber(),
      reachableCount: r.get("reachableCount").toNumber(),
      missingSkills: r.get("missingSkills"),
      alreadyHaveSkills: r.get("alreadyHaveSkills"),
    }));

    // Gather every missing skill across all roles and fetch course
    // recommendations for them in a single follow-up query.
    const allMissing = [...new Set(roles.flatMap((r) => r.missingSkills))];
    let coursesBySkill = {};
    if (allMissing.length > 0) {
      const courseResult = await session.run(COURSES_FOR_SKILLS_QUERY, {
        skillNames: allMissing,
      });
      coursesBySkill = Object.fromEntries(
        courseResult.records.map((r) => [r.get("skill"), r.get("courses")])
      );
    }

    const enriched = roles.map((r) => ({
      ...r,
      readinessPercent: Math.round((r.reachableCount / r.totalRequired) * 100),
      recommendedCourses: Object.fromEntries(
        r.missingSkills.map((skill) => [skill, coursesBySkill[skill] || []])
      ),
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
