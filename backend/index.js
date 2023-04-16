// index.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const db = require('./db');
const {
  createUserTable,
  createPostTable,
  createLikesTable,
  createCommentsTable,
} = require('./queries');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

async function createTables() {
  try {
    await db.query(createUserTable);
    await db.query(createPostTable);
    await db.query(createLikesTable);
    await db.query(createCommentsTable);
    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
}

createTables();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
