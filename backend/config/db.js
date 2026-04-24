const knex = require('knex');

let db;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  return databaseUrl;
}

function createDbConnection() {
  return knex({
    client: 'pg',
    connection: getDatabaseUrl(),
    pool: {
      min: 0,
      max: 10,
    },
  });
}

function getDb() {
  if (!db) {
    db = createDbConnection();
  }

  return db;
}

async function closeDb() {
  if (db) {
    await db.destroy();
    db = null;
  }
}

module.exports = {
  createDbConnection,
  getDb,
  closeDb,
};
