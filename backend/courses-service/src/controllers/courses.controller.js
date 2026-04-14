import pool from '../config/db.js';

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.length) return [value];
  return [];
}

function buildSortClause(sort) {
  switch (sort) {
    case 'newest':
      return 'ORDER BY created_at DESC';
    case 'highest-rated':
      return 'ORDER BY rating_average DESC, rating_count DESC';
    case 'most-popular':
      return 'ORDER BY enrollment_count DESC, trending_score DESC';
    case 'price-low':
      return 'ORDER BY price ASC, rating_average DESC';
    case 'price-high':
      return 'ORDER BY price DESC, rating_average DESC';
    case 'trending':
      return 'ORDER BY trending_score DESC, rating_average DESC';
    case 'relevance':
    default:
      return 'ORDER BY trending_score DESC, rating_average DESC';
  }
}

function durationFilter(duration) {
  // Returns { sql, params } — appends to an existing WHERE.
  if (!duration || duration === 'All') return null;
  if (duration === 'Short' || duration === 'under-2') return { sql: 'duration_minutes < $', value: 120 };
  if (duration === '2-10') return { sql: 'duration_minutes BETWEEN $ AND $', range: [120, 600] };
  if (duration === 'Medium') return { sql: 'duration_minutes BETWEEN $ AND $', range: [300, 900] };
  if (duration === '10-plus') return { sql: 'duration_minutes > $', value: 600 };
  return null;
}

export async function listCourses(req, res) {
  try {
    const {
      search = '',
      sort = 'relevance',
      status = 'approved',
      price = 'any',
      duration = '',
      rating = '',
      instructorId = '',
      page = 1,
      pageSize = 12,
    } = req.query;

    const categories = toArray(req.query.category);
    const levels = toArray(req.query.level);
    const languages = toArray(req.query.language);

    const where = [];
    const params = [];
    const pushParam = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (status !== 'all') {
      where.push(`status = ${pushParam(status)}`);
    }
    if (instructorId) {
      where.push(`instructor_id = ${pushParam(Number(instructorId))}`);
    }
    if (search) {
      const term = `%${String(search).toLowerCase()}%`;
      const p = pushParam(term);
      where.push(`(LOWER(title) LIKE ${p} OR LOWER(description) LIKE ${p} OR LOWER(category) LIKE ${p} OR ${p} = ANY (SELECT LOWER(s) FROM unnest(skills) s))`);
    }
    if (categories.length > 0) {
      where.push(`category = ANY (${pushParam(categories)})`);
    }
    if (levels.length > 0) {
      where.push(`level = ANY (${pushParam(levels)})`);
    }
    if (languages.length > 0) {
      where.push(`language = ANY (${pushParam(languages)})`);
    }
    if (rating) {
      where.push(`rating_average >= ${pushParam(Number(rating))}`);
    }
    if (price === 'free') where.push(`price = 0`);
    if (price === 'paid') where.push(`price > 0`);

    if (duration === 'under-2' || duration === 'Short') where.push(`duration_minutes < 120`);
    else if (duration === '2-10') where.push(`duration_minutes BETWEEN 120 AND 600`);
    else if (duration === 'Medium') where.push(`duration_minutes BETWEEN 300 AND 900`);
    else if (duration === '10-plus') where.push(`duration_minutes > 600`);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = buildSortClause(sort);

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM courses ${whereSql}`, params);
    const totalItems = countResult.rows[0].total;

    const limit = Math.max(1, Math.min(100, Number(pageSize) || 12));
    const offset = Math.max(0, (Number(page) - 1) * limit);

    const listParams = [...params, limit, offset];
    const listResult = await pool.query(
      `SELECT * FROM courses ${whereSql} ${orderSql} LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    res.json({
      items: listResult.rows,
      pagination: {
        page: Number(page),
        pageSize: limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
        hasMore: offset + limit < totalItems,
      },
    });
  } catch (err) {
    console.error('[courses-service] listCourses failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function getCourse(req, res) {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(`SELECT * FROM courses WHERE id = $1`, [id]);
    if (courseResult.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    const course = courseResult.rows[0];

    const modulesResult = await pool.query(
      `SELECT * FROM modules WHERE course_id = $1 ORDER BY position ASC`,
      [id]
    );
    const moduleIds = modulesResult.rows.map((module) => module.id);

    let lessonsByModule = {};
    if (moduleIds.length > 0) {
      const lessonsResult = await pool.query(
        `SELECT * FROM lessons WHERE module_id = ANY ($1) ORDER BY position ASC`,
        [moduleIds]
      );
      lessonsByModule = lessonsResult.rows.reduce((acc, lesson) => {
        (acc[lesson.module_id] = acc[lesson.module_id] || []).push(lesson);
        return acc;
      }, {});
    }

    const modules = modulesResult.rows.map((module) => ({
      ...module,
      lessons: lessonsByModule[module.id] || [],
    }));

    const reviewsResult = await pool.query(
      `SELECT * FROM reviews WHERE course_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({ ...course, modules, reviews: reviewsResult.rows });
  } catch (err) {
    console.error('[courses-service] getCourse failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function createCourse(req, res) {
  const client = await pool.connect();
  try {
    const {
      slug,
      title,
      subtitle,
      description,
      category,
      level,
      language = 'English',
      duration_minutes = 0,
      price = 0,
      thumbnail,
      accent,
      skills = [],
      status = 'draft',
      modules = [],
    } = req.body;

    if (!slug || !title || !category || !level) {
      return res.status(400).json({ error: 'slug, title, category, and level are required' });
    }

    await client.query('BEGIN');

    const courseResult = await client.query(
      `INSERT INTO courses
       (slug, title, subtitle, description, category, level, language, duration_minutes, price,
        thumbnail, accent, skills, status, instructor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [slug, title, subtitle, description, category, level, language, duration_minutes, price,
        thumbnail, accent, skills, status, req.user.user_id]
    );
    const course = courseResult.rows[0];

    for (let mIdx = 0; mIdx < modules.length; mIdx += 1) {
      const module = modules[mIdx];
      const moduleResult = await client.query(
        `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING *`,
        [course.id, module.title, mIdx]
      );
      const lessons = Array.isArray(module.lessons) ? module.lessons : [];
      for (let lIdx = 0; lIdx < lessons.length; lIdx += 1) {
        const lesson = lessons[lIdx];
        await client.query(
          `INSERT INTO lessons
           (module_id, title, description, duration_seconds, preview, video_url, transcript_url, position)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            moduleResult.rows[0].id,
            lesson.title,
            lesson.description || null,
            lesson.duration_seconds || 0,
            Boolean(lesson.preview),
            lesson.video_url || null,
            lesson.transcript_url || null,
            lIdx,
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(course);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] createCourse failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    const existing = await pool.query(`SELECT instructor_id FROM courses WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

    if (req.user.role !== 'admin' && existing.rows[0].instructor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your course' });
    }

    const fields = [
      'title', 'subtitle', 'description', 'category', 'level', 'language',
      'duration_minutes', 'price', 'thumbnail', 'accent', 'skills', 'status',
    ];
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
      `UPDATE courses SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[courses-service] updateCourse failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const existing = await pool.query(`SELECT instructor_id FROM courses WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

    if (req.user.role !== 'admin' && existing.rows[0].instructor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your course' });
    }

    await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
    res.status(204).end();
  } catch (err) {
    console.error('[courses-service] deleteCourse failed', err);
    res.status(500).json({ error: err.message });
  }
}
