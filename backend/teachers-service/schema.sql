-- Run against the teachers_service database:
--   psql -U postgres -d teachers_service -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS teachers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    INT  UNIQUE NOT NULL,  -- logical FK to auth_service.user_info.user_id
  topics     TEXT[] NOT NULL DEFAULT '{}',
  website    TEXT,
  twitter    TEXT,
  linkedin   TEXT,
  youtube    TEXT,
  approved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      INT  NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected')),
  reason       TEXT,
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  INT
);

CREATE INDEX IF NOT EXISTS idx_teachers_approved   ON teachers(approved);
CREATE INDEX IF NOT EXISTS idx_teacher_apps_status ON teacher_applications(status);
