// db.js
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:cupokylepost@localhost/cupter',
    ssl: {
      rejectUnauthorized: false,
    },
  });
  

module.exports = {
  query: (text, params) => pool.query(text, params),
};
