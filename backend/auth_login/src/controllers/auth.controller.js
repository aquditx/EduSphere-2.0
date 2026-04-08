import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO user_info (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, role`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await pool.query(
      `SELECT * FROM user_info WHERE email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = userQuery.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = uuidv4();

    await pool.query(
      `INSERT INTO auth_session (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 day')`,
      [user.user_id, token]
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    const result = await pool.query(
      `SELECT u.user_id, u.role
       FROM auth_session s
       JOIN user_info u ON u.user_id = s.user_id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ valid: false });

    res.json({ valid: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
