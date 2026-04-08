import pool from '../config/db.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token' });
    }

    const token = authHeader.split(' ')[1];

    const result = await pool.query(
      `SELECT u.user_id, u.role
       FROM auth_session s
       JOIN user_info u ON u.user_id = s.user_id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0]; // { user_id, role }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Auth middleware failed' });
  }
};

export default authMiddleware;
