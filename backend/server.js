const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const e = require('express');


require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")){
        console.log("No token");
        return res.status(401).json({error: "No token"})
    }

    const token = authHeader.split(" ")[1];
    if (!token){
        console.log("No token");
        return res.status(401).json({error: "No token"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (err){
        console.log("Invalid token",token);
        return res.status(401).json({error: "Invalid token"})
    }
}


app.use(cors());
app.use(express.json());

app.get('/api/verify', authenticateToken, (req, res) => {
    res.json({ message: 'Token is valid' });
})


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
            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
            

        }
    } catch (error) {
        console.error('Error occurred while logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

    
})

app.get('/api/user', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await pool.query('SELECT user_id as id, name, surname, phone, email FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        } else{
            res.json({ user: result.rows[0] });
        }
    } catch (error) {
        console.error('Error occurred while fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
})

app.post('/api/group/create', authenticateToken, async (req, res) => {
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

app.put('/api/group/update', authenticateToken, async (req, res) => {
    const { group_id, user_id, name } = req.body;
    try {
        const check = await pool.query('SELECT * FROM groups WHERE group_id = $1 AND group_leader_id = $2', [group_id, user_id]);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not the leader of the group' });
        } else{
            const updateGroup = await pool.query('UPDATE groups SET group_name = $1 WHERE group_id = $2 RETURNING *', [name, group_id]);
            res.json({ group: updateGroup.rows[0] });
        }
        console.log('Group updated successfully');
    } catch (error) {
        console.error('Error occurred while updating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/group', authenticateToken, async (req, res) => {
    const user_id = req.user.userId;
    try {
        const groups = await pool.query('SELECT g.group_id, g.group_name, g.group_code FROM groups g JOIN group_members gm ON g.group_id = gm.group_id WHERE gm.user_id = $1', [user_id]);
        res.json({ groups: groups.rows });
    } catch (error) {
        console.error('Error occurred while fetching group data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Fetched group data successfully');
})

app.delete('/api/group/delete', authenticateToken, async (req, res) => {
    const { group_id, user_id } = req.body;
    try {
        const check = await pool.query('SELECT * FROM groups WHERE group_id = $1 AND group_leader_id = $2', [group_id, user_id]);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not the leader of the group' });
        } else{
            const deleteGroup = await pool.query('DELETE FROM groups WHERE group_id = $1 RETURNING *', [group_id]);
            while (true) {
                const deleteMembers = await pool.query('DELETE FROM group_members WHERE group_id = $1 RETURNING *', [group_id]);
                if (deleteMembers.rows.length === 0) {
                    break;
                }
            }
            res.json({ group: deleteGroup.rows[0] , member: deleteMembers.rows});
        }

    } catch (error) {
            console.error('Error occurred while deleting group:', error);
            res.status(500).json({ error: 'Internal server error' });
    }
})


app.post('/api/group/join', authenticateToken, async (req, res) => {
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

app.post('/api/group/leave', authenticateToken, async (req, res) => {
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

app.post('/api/task/create', authenticateToken, async (req, res) => {
    const { group_id, user_id, assigned_to, task_name, task_des, start_date, end_date } = req.body;
    try {
        const check = await pool.query('SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3', [group_id, user_id, 'leader']);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not the leader of the group' });
        } else{
            const createTask = await pool.query('INSERT INTO tasks (group_id, assigned_to, task_name, task_des, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [group_id, assigned_to, task_name, task_des, start_date, end_date]);
            res.json({ task: createTask.rows[0] });
        }
        console.log('Task created successfully');
    } catch (error) {
        console.error('Error occurred while creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.delete('/api/task/delete', authenticateToken, async (req, res) => {
    const { task_id, user_id } = req.body;
    try {
        const check = await pool.query('SELECT * FROM tasks WHERE task_id = $1 AND created_by = $2', [task_id, user_id]);
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not the owner of the task' });
        } else{
            const deleteTask = await pool.query('DELETE FROM tasks WHERE task_id = $1 RETURNING *', [task_id]);
            res.json({ task: deleteTask.rows[0] });
        }
    } catch (error) {
        console.error('Error occurred while deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/task', authenticateToken, async (req, res) => {
    const user_id = req.user.userId;
    try {
        const tasks = await pool.query('SELECT t.task_id, t.group_id, t.assigned_to, t.task_name, t.task_des, t.start_date, t.end_date FROM tasks t JOIN group_members gm ON t.group_id = gm.group_id WHERE gm.user_id = $1', [user_id]);
        res.json({ tasks: tasks.rows });
        console.log('Fetched task data successfully');
    } catch (error) {
        console.error('Error occurred while fetching task data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/task/submit', authenticateToken, async (req, res) => {
    const { task_id, user_id, file, comment } = req.body;
    try {
        const check = await pool.query('SELECT * FROM tasks WHERE task_id = $1 AND assigned_to = $2', [task_id, user_id]); 
        if (check.rows.length === 0) {
            return res.status(400).json({ error: 'User is not assigned to the task' });
        } else{
            const submitTask = await pool.query('INSERT INTO submissions (task_id, user_id, file, comment) VALUES ($1, $2, $3, $4) RETURNING *', [task_id, user_id, file, comment]);
            res.json({ submission: submitTask.rows[0] });
        }
        console.log('Task submitted successfully');
    } catch (error) {
        console.error('Error occurred while submitting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/chat/send', authenticateToken, async (req, res) => {
    const { group_id, user_id, message } = req.body;
    try {
        const sendMessage = await pool.query('INSERT INTO chat (group_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *', [group_id, user_id, message]);
        res.json({ message: sendMessage.rows[0] });
    } catch (error) {
        console.error('Error occurred while sending chat message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/api/chat', authenticateToken, async (req, res) => {
    const { group_id } = req.query;
    try {
        const messages = await pool.query('SELECT c.chat_id, c.group_id, c.sender_id, c.message, c.create_at, u.name FROM chat c JOIN users u ON c.sender_id = u.user_id WHERE c.group_id = $1 ORDER BY c.create_at ASC', [group_id]);
        res.json({ messages: messages.rows });
    } catch (error) {
        console.error('Error occurred while fetching chat messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});