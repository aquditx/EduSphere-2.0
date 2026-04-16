import pool from '../config/db.js';

function serializeUser(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeProfile(row) {
  if (!row) return null;
  return {
    profileId: row.profile_id,
    userId: row.user_id,
    bio: row.bio,
    avatarUrl: row.profile_pic_url,
    updatedAt: row.updated_at,
  };
}

// GET /users — admin only, supports ?role= and ?search=
export const listUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const { role, search } = req.query;
    const where = [];
    const params = [];
    if (role) {
      params.push(role);
      where.push(`role = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT user_id, name, email, role, created_at, updated_at FROM user_info ${whereSql} ORDER BY created_at DESC`,
      params
    );
    res.json(result.rows.map(serializeUser));
  } catch (err) {
    console.error('[auth_login] listUsers failed', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /users/:id — self or admin
export const getUserById = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.user_id !== targetId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await pool.query(
      `SELECT user_id, name, email, role, created_at, updated_at FROM user_info WHERE user_id = $1`,
      [targetId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(serializeUser(result.rows[0]));
  } catch (err) {
    console.error('[auth_login] getUserById failed', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /users/:id — update user fields (self or admin)
export const updateUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.user_id !== targetId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, email, role } = req.body;
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change role' });
    }
    const updates = [];
    const params = [];
    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${params.length}`);
    }
    if (email !== undefined) {
      params.push(email);
      updates.push(`email = $${params.length}`);
    }
    if (role !== undefined) {
      params.push(role);
      updates.push(`role = $${params.length}`);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(targetId);
    const result = await pool.query(
      `UPDATE user_info SET ${updates.join(', ')} WHERE user_id = $${params.length}
       RETURNING user_id, name, email, role, created_at, updated_at`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(serializeUser(result.rows[0]));
  } catch (err) {
    console.error('[auth_login] updateUser failed', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /users/:id/profile — public, no auth required (public profiles)
export const getProfile = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const result = await pool.query(
      `SELECT p.*, u.name, u.email, u.role
       FROM user_info u
       LEFT JOIN profile p ON p.user_id = u.user_id
       WHERE u.user_id = $1`,
      [targetId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const row = result.rows[0];
    res.json({
      userId: targetId,
      name: row.name,
      email: row.email,
      role: row.role,
      ...serializeProfile({
        profile_id: row.profile_id,
        user_id: row.user_id,
        bio: row.bio,
        profile_pic_url: row.profile_pic_url,
        updated_at: row.updated_at,
      }),
    });
  } catch (err) {
    console.error('[auth_login] getProfile failed', err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /users/:id/profile — self or admin. Manual upsert so we don't
// require a UNIQUE constraint on profile.user_id (the original schema has
// no unique index there).
export const updateProfile = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.user_id !== targetId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { bio, avatarUrl } = req.body;

    const existing = await pool.query(
      `SELECT profile_id FROM profile WHERE user_id = $1 LIMIT 1`,
      [targetId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE profile
         SET bio = COALESCE($1, bio),
             profile_pic_url = COALESCE($2, profile_pic_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING *`,
        [bio ?? null, avatarUrl ?? null, targetId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO profile (user_id, bio, profile_pic_url, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING *`,
        [targetId, bio ?? null, avatarUrl ?? null]
      );
    }

    res.json(serializeProfile(result.rows[0]));
  } catch (err) {
    console.error('[auth_login] updateProfile failed', err);
    res.status(500).json({ error: err.message });
  }
};
