// seed.js
// Loads the dataset from data.js into CognoDB.
// Run with: npm run seed  (from the backend/ folder, after setting up .env)
//
// Every query here is parameterised ($param) - nothing is string-concatenated,
// per the assignment's requirement.

require("dotenv").config();
const { getSession, closeDriver } = require("../db");
const { SKILLS, PREREQUISITES, ROLES, COURSES } = require("./data");

async function seed() {
  const session = getSession();

  try {
    console.log("Clearing existing graph...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating uniqueness constraints...");
    await session.run(
      "CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT role_name IF NOT EXISTS FOR (r:Role) REQUIRE r.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT course_name IF NOT EXISTS FOR (c:Course) REQUIRE c.name IS UNIQUE"
    );

    console.log(`Creating ${SKILLS.length} Skill nodes...`);
    await session.run(
      `UNWIND $skills AS name
       MERGE (s:Skill {name: name})`,
      { skills: SKILLS }
    );

    console.log(`Creating ${PREREQUISITES.length} PREREQUISITE_OF relationships...`);
    await session.run(
      `UNWIND $pairs AS pair
       MATCH (a:Skill {name: pair[0]})
       MATCH (b:Skill {name: pair[1]})
       MERGE (a)-[:PREREQUISITE_OF]->(b)`,
      { pairs: PREREQUISITES }
    );

    const roleRows = Object.entries(ROLES).map(([name, skills]) => ({ name, skills }));
    console.log(`Creating ${roleRows.length} Role nodes + REQUIRES relationships...`);
    await session.run(
      `UNWIND $roles AS role
       MERGE (r:Role {name: role.name})
       WITH r, role
       UNWIND role.skills AS skillName
       MATCH (s:Skill {name: skillName})
       MERGE (r)-[:REQUIRES]->(s)`,
      { roles: roleRows }
    );

    const courseRows = Object.entries(COURSES).map(([name, info]) => ({
      name,
      provider: info.provider,
      skills: info.skills,
    }));
    console.log(`Creating ${courseRows.length} Course nodes + TEACHES relationships...`);
    await session.run(
      `UNWIND $courses AS course
       MERGE (c:Course {name: course.name})
       SET c.provider = course.provider
       WITH c, course
       UNWIND course.skills AS skillName
       MATCH (s:Skill {name: skillName})
       MERGE (c)-[:TEACHES]->(s)`,
      { courses: courseRows }
    );

    console.log("Seed complete.");
  } finally {
    await session.close();
    await closeDriver();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
