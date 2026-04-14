// Seed script for courses_service + auth_service.
//
// What this does:
//   1. Upserts 7 instructor accounts + 1 test student into auth_service.user_info
//      (bcrypt-hashed passwords, idempotent via ON CONFLICT on email).
//   2. Wipes all demo data in courses_service (reviews, enrollments, lessons, modules, courses).
//   3. Inserts all 50 courses from client/src/data/mockData.js, with real instructor
//      user_ids, round-robin real video URLs on every lesson, and nested modules/lessons.
//   4. Auto-enrolls the test student in 3 courses so the dashboard isn't empty.
//
// Run:
//   cd backend/courses-service && node seed.js
//
// The script assumes both databases share the same host/user/password. If that ever
// changes, split DB_* env vars per service.

import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
import bcrypt from 'bcrypt';
import { seedCourses } from '../../client/src/data/mockData.js';

const { Pool } = pkg;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const commonDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const authPool = new Pool({ ...commonDbConfig, database: 'auth_service' });
const coursesPool = new Pool({ ...commonDbConfig, database: process.env.DB_NAME || 'courses_service' });

// Real, publicly hosted MP4s (Google's CC-licensed sample video bucket).
// These work directly with <video src="...">, no YouTube iframe needed.
const VIDEO_POOL = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

const DEFAULT_INSTRUCTOR_PASSWORD = 'instructor123';
const DEFAULT_STUDENT_PASSWORD = 'pass123';

const INSTRUCTORS = [
  { name: 'Aisha Morgan',  email: 'aisha@edusphere.app',  role: 'instructor' },
  { name: 'Noah Bennett',  email: 'noah@edusphere.app',   role: 'instructor' },
  { name: 'Mina Patel',    email: 'mina@edusphere.app',   role: 'instructor' },
  { name: 'Sarah Lin',     email: 'sarah@edusphere.app',  role: 'instructor' },
  { name: 'Lucas Rivera',  email: 'lucas@edusphere.app',  role: 'instructor' },
  { name: 'Harper Quinn',  email: 'harper@edusphere.app', role: 'instructor' },
  { name: 'Marcus Webb',   email: 'marcus@edusphere.app', role: 'instructor' },
];

const TEST_STUDENT = {
  name: 'Gloria Rodriguez',
  email: 'gloria@edusphere.app',
  role: 'student',
};

// Course slugs to auto-enroll the test student in.
const AUTO_ENROLL_SLUGS = [
  'product-design-masterclass',
  'react-performance-lab',
  'full-stack-web-development',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nameToEmail(instructorName) {
  const match = INSTRUCTORS.find((entry) => entry.name === instructorName);
  if (!match) {
    throw new Error(`No seeded instructor matches "${instructorName}"`);
  }
  return match.email;
}

async function upsertUser(client, { name, email, role, password }) {
  const hash = await bcrypt.hash(password, 10);
  const result = await client.query(
    `INSERT INTO user_info (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP
     RETURNING user_id, email`,
    [name, email, hash, role]
  );
  return result.rows[0];
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

async function seedUsers() {
  console.log('» Seeding users in auth_service...');
  const emailToUserId = new Map();

  for (const instructor of INSTRUCTORS) {
    const row = await upsertUser(authPool, { ...instructor, password: DEFAULT_INSTRUCTOR_PASSWORD });
    emailToUserId.set(row.email, row.user_id);
    console.log(`  ✓ ${row.email} (user_id=${row.user_id}) [instructor]`);
  }

  const student = await upsertUser(authPool, { ...TEST_STUDENT, password: DEFAULT_STUDENT_PASSWORD });
  emailToUserId.set(student.email, student.user_id);
  console.log(`  ✓ ${student.email} (user_id=${student.user_id}) [student]`);

  return emailToUserId;
}

async function clearCoursesTables() {
  console.log('» Wiping courses_service demo tables...');
  // Order matters — children first, but ON DELETE CASCADE handles modules/lessons/reviews
  // from the courses wipe. Enrollments and reviews have no cascade parent besides courses,
  // so TRUNCATE them explicitly to be safe.
  await coursesPool.query('TRUNCATE TABLE reviews, enrollments, lessons, modules, courses RESTART IDENTITY CASCADE');
  console.log('  ✓ cleared reviews, enrollments, lessons, modules, courses');
}

async function insertCourses(emailToUserId) {
  console.log(`» Inserting ${seedCourses.length} courses into courses_service...`);
  let videoCursor = 0;
  let lessonCount = 0;

  for (const course of seedCourses) {
    const client = await coursesPool.connect();
    try {
      await client.query('BEGIN');

      const instructorEmail = nameToEmail(course.instructorName);
      const instructorUserId = emailToUserId.get(instructorEmail);
      if (!instructorUserId) {
        throw new Error(`No user_id for instructor email ${instructorEmail}`);
      }

      const courseInsert = await client.query(
        `INSERT INTO courses
         (slug, title, subtitle, description, category, level, language, duration_minutes,
          price, rating_average, rating_count, enrollment_count, trending_score,
          thumbnail, accent, skills, status, instructor_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING id`,
        [
          course.slug,
          course.title,
          course.subtitle,
          course.description,
          course.category,
          course.level,
          course.language || 'English',
          course.durationMinutes,
          course.price,
          course.ratingAverage,
          course.ratingCount,
          course.enrollmentCount,
          course.trendingScore,
          course.thumbnail,
          course.accent,
          course.skills || [],
          'approved', // force approved so everything shows up in the public catalog
          instructorUserId,
          course.createdAt,
          course.updatedAt,
        ]
      );
      const courseId = courseInsert.rows[0].id;

      for (let mIdx = 0; mIdx < course.modules.length; mIdx += 1) {
        const module = course.modules[mIdx];
        const moduleInsert = await client.query(
          `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
          [courseId, module.title, mIdx]
        );
        const moduleId = moduleInsert.rows[0].id;

        for (let lIdx = 0; lIdx < module.lessons.length; lIdx += 1) {
          const lesson = module.lessons[lIdx];
          const videoUrl = VIDEO_POOL[videoCursor % VIDEO_POOL.length];
          videoCursor += 1;
          lessonCount += 1;

          await client.query(
            `INSERT INTO lessons
             (module_id, title, description, duration_seconds, preview, video_url, transcript_url, position)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              moduleId,
              lesson.title,
              lesson.description || null,
              lesson.durationSeconds || 0,
              Boolean(lesson.preview),
              videoUrl,
              lesson.transcriptUrl || null,
              lIdx,
            ]
          );
        }
      }

      await client.query('COMMIT');
      console.log(`  ✓ ${course.title}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  ✗ ${course.title} — ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(`» Inserted ${seedCourses.length} courses with ${lessonCount} lessons total.`);
}

async function enrollTestStudent(emailToUserId) {
  console.log('» Auto-enrolling test student in sample courses...');
  const studentId = emailToUserId.get(TEST_STUDENT.email);
  if (!studentId) {
    console.warn('  ! test student not found — skipping enrollments');
    return;
  }

  for (const slug of AUTO_ENROLL_SLUGS) {
    const courseResult = await coursesPool.query(`SELECT id, title FROM courses WHERE slug = $1`, [slug]);
    if (courseResult.rows.length === 0) {
      console.warn(`  ! course slug "${slug}" not found — skipping`);
      continue;
    }
    const { id: courseId, title } = courseResult.rows[0];

    await coursesPool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [studentId, courseId]
    );
    await coursesPool.query(
      `UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = $1`,
      [courseId]
    );
    console.log(`  ✓ enrolled in "${title}"`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding EDDDUSPHERE demo data...\n');
  try {
    const emailToUserId = await seedUsers();
    await clearCoursesTables();
    await insertCourses(emailToUserId);
    await enrollTestStudent(emailToUserId);

    console.log('\nDone. Login credentials:');
    console.log('  student:    gloria@edusphere.app / pass123');
    console.log('  instructor: aisha@edusphere.app / instructor123  (and noah, mina, sarah, lucas, harper, marcus)');
  } catch (err) {
    console.error('\nSeed failed:', err);
    process.exitCode = 1;
  } finally {
    await authPool.end();
    await coursesPool.end();
  }
}

main();
