const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})


app.use(cors());
app.use(express.json());


app.post('/api/register', async (req, res) => {
    console.log('Received registration request:', req.body);
    const {name, surname, phone,email, password} = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        } else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const Register = await pool.query('INSERT INTO users (name, surname, phone, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, surname, phone,email, hashedPassword]);
            const user = Register.rows[0];
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('User registered successfully:', token);
            res.json({ token });
        }

    } catch (error) {
        console.error('Error occurred while registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/login', async (req, res) => {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        } else{
            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid email or password' });
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        }
    } catch (error) {
        console.error('Error occurred while logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    } 
    
})

app.post('/api/group/create', async (req, res) => {
    const { name, user_id } = req.body;
    try {
        while (true) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const code =  Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const result = await pool.query('SELECT * FROM groups WHERE group_code = $1', [code]);
            if (result.rows.length === 0) {
                const newGroup = await pool.query('INSERT INTO groups (group_leader_id,group_name, group_code) VALUES ($1, $2, $3) RETURNING *', [user_id, name, code]);
                const groupmember = await pool.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)', [newGroup.rows[0].group_id, user_id, 'leader']);
                res.json({ group: newGroup.rows[0] });
                break;
            }
        }
        console.log('Group created successfully');


    } catch (error) {
        console.error('Error occurred while creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/group/join', async (req, res) => {
    const { code, user_id } = req.body;
    try {
        const check = await pool.query('SELECT * FROM groups WHERE group_code = $1', [code]);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid group code' });
        } else{
            const join = await pool.query('INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) RETURNING *', [check.rows[0].group_id, user_id, 'member']);
            res.json({ group_member: join.rows[0] });
        }
        console.log('Joined group successfully');

    } catch (error) {
        console.error('Error occurred while joining group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/group/leave', async (req, res) => {
    const { group_id, user_id } = req.body;
    try {
        const check = await pool.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2', [group_id, user_id]);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not a member of the group' });
        } else{
            const leave = await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *', [group_id, user_id]);
            res.json({ group_member: leave.rows[0] });
        }
            console.log('Left group successfully');
    } catch (error) {
            console.error('Error occurred while leaving group:', error);
            res.status(500).json({ error: 'Internal server error' });
    }
})


app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});