// routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');
const { generateToken, authenticateToken } = require('./auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the username is already registered
        const existingUsername = (await db.query('SELECT * FROM users WHERE username = $1', [username])).rows[0];
        if (existingUsername) {
            return res.status(400).json({ error: 'Username is already registered' });
        }

        // Check if the email is already registered
        const existingEmail = (await db.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
        if (existingEmail) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        const token = generateToken(newUser.rows[0]);

        res.status(201).json({ token });
    } catch (err) {
        console.error('Error details:', err); // Log the error details
        res.status(500).json({ error: 'Error registering user' });
    }
});



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.query('SELECT * FROM users WHERE username = $1', [
            username,
        ]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(403).json({ error: 'Invalid password' });
        }

        const token = generateToken(user.rows[0]);

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.post('/posts', authenticateToken, async (req, res) => {
    const { content } = req.body;

    try {
        const newPost = await db.query(
            'INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *',
            [req.user.id, content]
        );

        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error creating post' });
    }
});
router.get('/posts', async (req, res) => {
    try {
      const posts = await db.query(`
        SELECT p.id, p.content, p.created_at, p.user_id, u.username as user_username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `);
  
      res.status(200).json(posts.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching posts' });
    }
  });
  

router.post('/posts/:postId/likes', authenticateToken, async (req, res) => {
    const { postId } = req.params;

    try {
        const like = await db.query(
            'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *',
            [req.user.id, postId]
        );

        res.status(201).json(like.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error liking post' });
    }
});

router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    try {
        const comment = await db.query(
            'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, postId, content]
        );

        res.status(201).json(comment.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error commenting on post' });
    }
});

module.exports = router;
