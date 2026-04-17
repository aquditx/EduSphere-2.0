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
const teachersPool = new Pool({ ...commonDbConfig, database: 'teachers_service' });

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
  {
    name: 'Aisha Morgan', email: 'aisha@edusphere.app', role: 'instructor',
    headline: 'Head of Product Design at Halo',
    bio: 'Aisha helps product teams turn messy discovery into crisp systems, clearer critiques, and portfolio-ready outcomes. She has led design organizations across SaaS, marketplaces, and education products.',
    topics: ['Product Design', 'Design Systems', 'Research', 'Prototyping'],
    website: 'https://edusphere.app/instructors/aisha',
    twitter: 'https://twitter.com/aishamorgan',
    linkedin: 'https://linkedin.com/in/aishamorgan',
    youtube: 'https://youtube.com/@aishamorgan',
  },
  {
    name: 'Noah Bennett', email: 'noah@edusphere.app', role: 'instructor',
    headline: 'Frontend Architect at Elevate',
    bio: 'Noah teaches engineers how to profile, debug, and scale modern frontend systems without sacrificing product velocity. His courses focus on practical performance wins and production-grade observability.',
    topics: ['React', 'Frontend Architecture', 'Performance', 'JavaScript'],
    website: 'https://edusphere.app/instructors/noah',
    twitter: 'https://twitter.com/noahbennett',
    linkedin: 'https://linkedin.com/in/noahbennett',
    youtube: 'https://youtube.com/@noahbennett',
  },
  {
    name: 'Mina Patel', email: 'mina@edusphere.app', role: 'instructor',
    headline: 'Data science educator and analytics consultant',
    bio: 'Mina helps analysts and operators build confidence with real-world data workflows, dashboards, and experimentation. She focuses on making technical concepts approachable without losing rigor.',
    topics: ['Data Science', 'Analytics', 'Experimentation'],
    website: 'https://edusphere.app/instructors/mina',
    twitter: 'https://twitter.com/minapatel',
    linkedin: 'https://linkedin.com/in/minapatel',
    youtube: 'https://youtube.com/@minapatel',
  },
  {
    name: 'Sarah Lin', email: 'sarah@edusphere.app', role: 'instructor',
    headline: 'Growth marketing lead and startup advisor',
    bio: 'Sarah helps founders and marketers turn messy growth ideas into repeatable acquisition and retention systems. She has advised more than 40 early-stage teams across SaaS, marketplaces, and consumer products.',
    topics: ['Marketing', 'Startups', 'Branding', 'Sales'],
    website: null, twitter: null, linkedin: null, youtube: null,
  },
  {
    name: 'Lucas Rivera', email: 'lucas@edusphere.app', role: 'instructor',
    headline: 'Visual designer and motion director',
    bio: 'Lucas teaches visual craft for the screen — from typographic systems to motion vocabulary for product teams. His work has shipped across award-winning apps, brand systems, and short films.',
    topics: ['Graphic Design', 'Motion', 'Typography', 'Color'],
    website: null, twitter: null, linkedin: null, youtube: null,
  },
  {
    name: 'Harper Quinn', email: 'harper@edusphere.app', role: 'instructor',
    headline: 'Career coach and productivity systems writer',
    bio: 'Harper helps knowledge workers design sustainable productivity systems and grow their careers on purpose. She writes a weekly newsletter on focus, habits, and deliberate career moves.',
    topics: ['Productivity', 'Career', 'Habits', 'Focus'],
    website: null, twitter: null, linkedin: null, youtube: null,
  },
  {
    name: 'Marcus Webb', email: 'marcus@edusphere.app', role: 'instructor',
    headline: 'Former CFO turned leadership educator',
    bio: 'Marcus translates finance, negotiation, and leadership into practical skills for operators who never trained formally. He has coached leaders at Fortune 500 firms and Series A startups alike.',
    topics: ['Finance', 'Leadership', 'Negotiation', 'Communication'],
    website: null, twitter: null, linkedin: null, youtube: null,
  },
];

const TEST_STUDENT = {
  name: 'Gloria Rodriguez',
  email: 'gloria@edusphere.app',
  role: 'student',
  headline: 'Product designer upskilling into AI product management',
  bio: 'Full-stack learner passionate about design systems and AI product experiences.',
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

async function seedProfiles(emailToUserId) {
  console.log('» Seeding profiles in auth_service...');
  const allUsers = [...INSTRUCTORS, TEST_STUDENT];
  for (const user of allUsers) {
    const userId = emailToUserId.get(user.email);
    if (!userId) continue;

    // Check if profile exists, upsert manually (no UNIQUE on user_id in original schema)
    const existing = await authPool.query(
      `SELECT profile_id FROM profile WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (existing.rows.length > 0) {
      await authPool.query(
        `UPDATE profile SET bio = $1, profile_pic_url = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3`,
        [user.bio || null, null, userId]
      );
    } else {
      await authPool.query(
        `INSERT INTO profile (user_id, bio, profile_pic_url) VALUES ($1, $2, $3)`,
        [userId, user.bio || null, null]
      );
    }
    console.log(`  ✓ profile for ${user.email}`);
  }
}

async function seedTeachers(emailToUserId) {
  console.log('» Seeding teachers in teachers_service...');
  for (const instructor of INSTRUCTORS) {
    const userId = emailToUserId.get(instructor.email);
    if (!userId) continue;

    // Upsert into teachers table (has UNIQUE on user_id)
    await teachersPool.query(
      `INSERT INTO teachers (user_id, topics, website, twitter, linkedin, youtube, approved)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (user_id)
       DO UPDATE SET
         topics = EXCLUDED.topics,
         website = EXCLUDED.website,
         twitter = EXCLUDED.twitter,
         linkedin = EXCLUDED.linkedin,
         youtube = EXCLUDED.youtube,
         approved = TRUE,
         updated_at = NOW()`,
      [
        userId,
        instructor.topics || [],
        instructor.website || null,
        instructor.twitter || null,
        instructor.linkedin || null,
        instructor.youtube || null,
      ]
    );
    console.log(`  ✓ teacher for ${instructor.email} (topics: ${(instructor.topics || []).join(', ')})`);
  }
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
          thumbnail, accent, skills, outcomes, status, instructor_id, instructor_name, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
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
          course.outcomes || [],
          'approved', // force approved so everything shows up in the public catalog
          instructorUserId,
          course.instructorName,
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
  const skipCourses = process.argv.includes('--skip-courses');
  const onlyProfiles = process.argv.includes('--only-profiles');

  console.log('Seeding EDDDUSPHERE demo data...\n');
  if (skipCourses || onlyProfiles) {
    console.log('  (--skip-courses mode: profiles + teachers only, courses_service untouched)\n');
  }

  try {
    const emailToUserId = await seedUsers();
    await seedProfiles(emailToUserId);
    await seedTeachers(emailToUserId);

    if (!skipCourses && !onlyProfiles) {
      await clearCoursesTables();
      await insertCourses(emailToUserId);
      await enrollTestStudent(emailToUserId);
    }

    console.log('\nDone. Login credentials:');
    console.log('  student:    gloria@edusphere.app / pass123');
    console.log('  instructor: aisha@edusphere.app / instructor123  (and noah, mina, sarah, lucas, harper, marcus)');
    console.log('\nSeeded:');
    console.log('  - 8 user profiles in auth_service.profile');
    console.log('  - 7 teacher rows in teachers_service.teachers (all approved)');
    if (!skipCourses && !onlyProfiles) {
      console.log('  - 50 courses + modules + lessons in courses_service');
      console.log('  - 3 auto-enrollments for Gloria');
    } else {
      console.log('  - courses_service: SKIPPED (your existing courses are safe)');
    }
  } catch (err) {
    console.error('\nSeed failed:', err);
    process.exitCode = 1;
  } finally {
    await authPool.end();
    await coursesPool.end();
    await teachersPool.end();
  }
}

main();
