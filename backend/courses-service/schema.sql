-- Run against the courses_service database:
--   psql -U postgres -d courses_service -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS courses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             VARCHAR(160) UNIQUE NOT NULL,
  title            VARCHAR(200) NOT NULL,
  subtitle         VARCHAR(300),
  description      TEXT,
  category         VARCHAR(60)  NOT NULL,
  level            VARCHAR(20)  NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  language         VARCHAR(40)  NOT NULL DEFAULT 'English',
  duration_minutes INT          NOT NULL DEFAULT 0,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating_average   NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count     INT          NOT NULL DEFAULT 0,
  enrollment_count INT          NOT NULL DEFAULT 0,
  trending_score   INT          NOT NULL DEFAULT 0,
  thumbnail        TEXT,
  accent           VARCHAR(120),
  skills           TEXT[]       NOT NULL DEFAULT '{}',
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','pending','approved','rejected')),
  instructor_id    INT          NOT NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title      VARCHAR(200) NOT NULL,
  position   INT NOT NULL,
  UNIQUE (course_id, position)
);

CREATE TABLE IF NOT EXISTS lessons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id        UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  duration_seconds INT NOT NULL DEFAULT 0,
  preview          BOOLEAN NOT NULL DEFAULT FALSE,
  video_url        TEXT,
  transcript_url   TEXT,
  position         INT NOT NULL,
  UNIQUE (module_id, position)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     INT  NOT NULL,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id    INT  NOT NULL,
  user_name  VARCHAR(120) NOT NULL,
  rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_courses_status     ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category   ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_trending   ON courses(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user   ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course     ON reviews(course_id);
