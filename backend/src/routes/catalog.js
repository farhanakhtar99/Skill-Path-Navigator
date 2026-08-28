// catalog.js
// Simple lookups used to populate the frontend's skill checkboxes and
// role dropdown. No traversal needed here - just listing nodes.

const express = require("express");
const { getSession } = require("../db");

const router = express.Router();

router.get("/skills", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (s:Skill) RETURN s.name AS name ORDER BY s.name"
    );
    res.json(result.records.map((r) => r.get("name")));
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

router.get("/roles", async (req, res, next) => {
  const session = getSession();
  try {
    const result = await session.run(
      "MATCH (r:Role) RETURN r.name AS name ORDER BY r.name"
    );
    res.json(result.records.map((r) => r.get("name")));
  } catch (err) {
    next(err);
  } finally {
    await session.close();
  }
});

module.exports = router;
