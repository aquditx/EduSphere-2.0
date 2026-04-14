import pool from '../config/db.js';

// Public: list approved teachers.
export async function listTeachers(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM teachers WHERE approved = TRUE ORDER BY updated_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[teachers-service] listTeachers failed', err);
    res.status(500).json({ error: err.message });
  }
}

// Public: get a single teacher row (teacher-specific fields only — bio/avatar
// live in auth_service.profile and must be fetched from there by the caller).
export async function getTeacher(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM teachers WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[teachers-service] getTeacher failed', err);
    res.status(500).json({ error: err.message });
  }
}

// Public lookup by user_id — the frontend usually has the auth user_id, not the teacher row id.
export async function getTeacherByUserId(req, res) {
  try {
    const userId = Number(req.params.userId);
    const result = await pool.query(`SELECT * FROM teachers WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[teachers-service] getTeacherByUserId failed', err);
    res.status(500).json({ error: err.message });
  }
}

// Authenticated: a logged-in user submits an application to become an instructor.
export async function applyToTeach(req, res) {
  try {
    const userId = req.user.user_id;
    const { reason } = req.body;

    const existing = await pool.query(
      `SELECT id FROM teacher_applications WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have a pending application' });
    }

    const result = await pool.query(
      `INSERT INTO teacher_applications (user_id, reason) VALUES ($1, $2) RETURNING *`,
      [userId, reason || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[teachers-service] applyToTeach failed', err);
    res.status(500).json({ error: err.message });
  }
}

// Instructor: update own teacher row.
export async function updateTeacher(req, res) {
  try {
    const { id } = req.params;
    const existing = await pool.query(`SELECT user_id FROM teachers WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Teacher not found' });

    if (req.user.role !== 'admin' && existing.rows[0].user_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your profile' });
    }

    const fields = ['topics', 'website', 'twitter', 'linkedin', 'youtube'];
    const updates = [];
    const params = [];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        updates.push(`${field} = $${params.length}`);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push(`updated_at = NOW()`);
    params.push(id);
    const result = await pool.query(
      `UPDATE teachers SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[teachers-service] updateTeacher failed', err);
    res.status(500).json({ error: err.message });
  }
}

// Admin: approve/reject an application. On approve, create the teacher row.
export async function reviewApplication(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { decision, reason } = req.body; // decision: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
    }

    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT * FROM teacher_applications WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }
    const application = appResult.rows[0];

    if (application.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Application already reviewed' });
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    await client.query(
      `UPDATE teacher_applications
       SET status = $1, reason = $2, reviewed_at = NOW(), reviewed_by = $3
       WHERE id = $4`,
      [newStatus, reason || null, req.user.user_id, id]
    );

    if (decision === 'approve') {
      await client.query(
        `INSERT INTO teachers (user_id, approved)
         VALUES ($1, TRUE)
         ON CONFLICT (user_id) DO UPDATE SET approved = TRUE, updated_at = NOW()`,
        [application.user_id]
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true, status: newStatus });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[teachers-service] reviewApplication failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

// Admin: list pending applications.
export async function listApplications(req, res) {
  try {
    const status = req.query.status || 'pending';
    const result = await pool.query(
      `SELECT * FROM teacher_applications WHERE status = $1 ORDER BY submitted_at DESC`,
      [status]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[teachers-service] listApplications failed', err);
    res.status(500).json({ error: err.message });
  }
}
