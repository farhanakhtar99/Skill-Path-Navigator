// db.js
// Sets up a single shared connection ("driver") to CognoDB using the
// official Neo4j JavaScript driver. CognoDB speaks the same Bolt protocol
// as Neo4j, so no custom SDK is needed - just point the standard driver
// at the bolt+s:// URI CognoDB gives you.

const neo4j = require("neo4j-driver");

let driver = null;

function getDriver() {
  if (driver) return driver;

  const { COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD } = process.env;

  if (!COGNODB_URI || !COGNODB_USER || !COGNODB_PASSWORD) {
    throw new Error(
      "Missing CognoDB connection details. Check that COGNODB_URI, " +
        "COGNODB_USER and COGNODB_PASSWORD are set in your .env file.",
    );
  }

  driver = neo4j.driver(
    COGNODB_URI,
    neo4j.auth.basic(COGNODB_USER, COGNODB_PASSWORD),
  );

  return driver;
}

// Quick connectivity check used on server startup and by /api/health.
// Lets the app fail loudly (and the UI show a clear error) instead of
// hanging on every request if the database is unreachable.
async function verifyConnection() {
  const d = getDriver();
  await d.verifyConnectivity();
}

// Every route opens a session, runs its queries, and closes the session.
// Sessions are cheap to open/close - the driver manages pooling underneath.
function getSession() {
  return getDriver().session();
}

async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

module.exports = { getDriver, getSession, verifyConnection, closeDriver };
