import pool from '../config/db.js';
import { serializeCourse, serializeLesson, serializeReview } from '../utils/serialize.js';

// Accepts either camelCase (as the React client sends) or snake_case (as the
// DB uses) for a given field. Returns the first defined value.
function pick(source, ...keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150) || `course-${Date.now().toString(36)}`;
}

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
      items: listResult.rows.map(serializeCourse),
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
      id: module.id,
      courseId: module.course_id,
      title: module.title,
      position: module.position,
      lessons: (lessonsByModule[module.id] || []).map(serializeLesson),
    }));

    const reviewsResult = await pool.query(
      `SELECT * FROM reviews WHERE course_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    // Flat lessons array for frontend resume/continue logic.
    const flatLessons = modules.flatMap((module) =>
      module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))
    );

    res.json({
      ...serializeCourse(course),
      modules,
      lessons: flatLessons,
      totalLessons: flatLessons.length,
      reviews: reviewsResult.rows.map(serializeReview),
    });
  } catch (err) {
    console.error('[courses-service] getCourse failed', err);
    res.status(500).json({ error: err.message });
  }
}

export async function createCourse(req, res) {
  const client = await pool.connect();
  try {
    // Accept both camelCase (React CMS) and snake_case (direct API callers).
    const body = req.body || {};
    const title = pick(body, 'title');
    const subtitle = pick(body, 'subtitle');
    const description = pick(body, 'description');
    const category = pick(body, 'category');
    const level = pick(body, 'level');
    const language = pick(body, 'language') || 'English';
    const durationMinutes = Number(pick(body, 'durationMinutes', 'duration_minutes') || 0);
    const price = Number(pick(body, 'price') || 0);
    const thumbnail = pick(body, 'thumbnail');
    const accent = pick(body, 'accent');
    const skills = pick(body, 'skills', 'tags') || [];
    const outcomes = pick(body, 'outcomes') || [];
    const status = pick(body, 'status') || 'draft';
    const slug = pick(body, 'slug', 'urlSlug') || slugify(title);
    const instructorName = pick(body, 'instructorName', 'instructor_name') || req.user.name || null;
    const modules = Array.isArray(pick(body, 'modules')) ? body.modules : [];

    if (!title || !category || !level) {
      return res.status(400).json({ error: 'title, category, and level are required' });
    }

    await client.query('BEGIN');

    const courseResult = await client.query(
      `INSERT INTO courses
       (slug, title, subtitle, description, category, level, language, duration_minutes, price,
        thumbnail, accent, skills, outcomes, status, instructor_id, instructor_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        slug, title, subtitle || null, description || null, category, level, language,
        durationMinutes, price, thumbnail || null, accent || null, skills, outcomes,
        status, req.user.user_id, instructorName,
      ]
    );
    const course = courseResult.rows[0];
    await insertModulesAndLessons(client, course.id, modules);

    await client.query('COMMIT');
    res.status(201).json(serializeCourse(course));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] createCourse failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

// Helper — reinserts the modules + lessons nested structure for a course.
// Caller owns the transaction. The caller must have already deleted the
// existing rows (or this is a brand-new course).
async function insertModulesAndLessons(client, courseId, modules) {
  for (let mIdx = 0; mIdx < modules.length; mIdx += 1) {
    const module = modules[mIdx];
    const moduleResult = await client.query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, module.title || `Module ${mIdx + 1}`, mIdx]
    );
    const lessons = Array.isArray(module.lessons) ? module.lessons : [];
    for (let lIdx = 0; lIdx < lessons.length; lIdx += 1) {
      const lesson = lessons[lIdx];
      const lessonDuration = Number(pick(lesson, 'durationSeconds', 'duration_seconds') || 0);
      const videoUrl = pick(lesson, 'videoUrl', 'video_url') || null;
      const transcriptUrl = pick(lesson, 'transcriptUrl', 'transcript_url') || null;
      await client.query(
        `INSERT INTO lessons
         (module_id, title, description, duration_seconds, preview, video_url, transcript_url, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          moduleResult.rows[0].id,
          lesson.title || `Lesson ${lIdx + 1}`,
          lesson.description || null,
          lessonDuration,
          Boolean(lesson.preview),
          videoUrl,
          transcriptUrl,
          lIdx,
        ]
      );
    }
  }
}

export async function updateCourse(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const existing = await client.query(`SELECT instructor_id FROM courses WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

    if (req.user.role !== 'admin' && existing.rows[0].instructor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your course' });
    }

    // camelCase → snake_case mapping for the flat course fields.
    const body = req.body || {};
    const fieldMap = {
      title: pick(body, 'title'),
      subtitle: pick(body, 'subtitle'),
      description: pick(body, 'description'),
      category: pick(body, 'category'),
      level: pick(body, 'level'),
      language: pick(body, 'language'),
      duration_minutes: pick(body, 'durationMinutes', 'duration_minutes'),
      price: pick(body, 'price'),
      thumbnail: pick(body, 'thumbnail'),
      accent: pick(body, 'accent'),
      skills: pick(body, 'skills', 'tags'),
      outcomes: pick(body, 'outcomes'),
      status: pick(body, 'status'),
      slug: pick(body, 'slug', 'urlSlug'),
      instructor_name: pick(body, 'instructorName', 'instructor_name'),
    };

    const updates = [];
    const params = [];
    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        params.push(value);
        updates.push(`${column} = $${params.length}`);
      }
    }

    // If the caller sent a `modules` array, treat it as an authoritative replacement
    // of the course's curriculum — delete and re-insert inside the same transaction.
    const nextModules = Array.isArray(body.modules) ? body.modules : null;

    if (updates.length === 0 && !nextModules) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await client.query('BEGIN');

    let courseRow = null;
    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      const result = await client.query(
        `UPDATE courses SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );
      courseRow = result.rows[0];
    }

    if (nextModules) {
      // CASCADE wipes lessons too (lessons.module_id ON DELETE CASCADE).
      await client.query(`DELETE FROM modules WHERE course_id = $1`, [id]);
      await insertModulesAndLessons(client, id, nextModules);

      if (!courseRow) {
        const refresh = await client.query(`SELECT * FROM courses WHERE id = $1`, [id]);
        courseRow = refresh.rows[0];
      } else {
        // Touch updated_at even when only curriculum changed but flat fields were also sent.
        await client.query(`UPDATE courses SET updated_at = NOW() WHERE id = $1`, [id]);
      }
    }

    await client.query('COMMIT');
    res.json(serializeCourse(courseRow));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] updateCourse failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

export async function duplicateCourse(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const existing = await client.query(`SELECT * FROM courses WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    const source = existing.rows[0];
    if (req.user.role !== 'admin' && source.instructor_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not your course' });
    }

    await client.query('BEGIN');

    const newSlug = `${source.slug}-copy-${Date.now().toString(36).slice(-5)}`;
    const newTitle = `${source.title} (Copy)`;

    const inserted = await client.query(
      `INSERT INTO courses
       (slug, title, subtitle, description, category, level, language, duration_minutes, price,
        thumbnail, accent, skills, outcomes, status, instructor_id, instructor_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft',$14,$15)
       RETURNING *`,
      [
        newSlug,
        newTitle,
        source.subtitle,
        source.description,
        source.category,
        source.level,
        source.language,
        source.duration_minutes,
        source.price,
        source.thumbnail,
        source.accent,
        source.skills,
        source.outcomes || [],
        source.instructor_id,
        source.instructor_name,
      ]
    );
    const newCourseId = inserted.rows[0].id;

    const modulesResult = await client.query(
      `SELECT * FROM modules WHERE course_id = $1 ORDER BY position`,
      [id]
    );
    for (const module of modulesResult.rows) {
      const moduleInsert = await client.query(
        `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
        [newCourseId, module.title, module.position]
      );
      const lessonsResult = await client.query(
        `SELECT * FROM lessons WHERE module_id = $1 ORDER BY position`,
        [module.id]
      );
      for (const lesson of lessonsResult.rows) {
        await client.query(
          `INSERT INTO lessons
           (module_id, title, description, duration_seconds, preview, video_url, transcript_url, position)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            moduleInsert.rows[0].id,
            lesson.title,
            lesson.description,
            lesson.duration_seconds,
            lesson.preview,
            lesson.video_url,
            lesson.transcript_url,
            lesson.position,
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(serializeCourse(inserted.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[courses-service] duplicateCourse failed', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
