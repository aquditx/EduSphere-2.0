// Maps snake_case rows coming out of Postgres into the camelCase shape the
// React client already expects. Keeping this centralized means controllers
// don't have to remember the mapping.

export function serializeCourse(row) {
  if (!row) return row;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    level: row.level,
    language: row.language,
    durationMinutes: row.duration_minutes,
    durationLabel: row.duration_minutes
      ? `${Math.floor(row.duration_minutes / 60)}h ${row.duration_minutes % 60}m`
      : null,
    price: Number(row.price || 0),
    ratingAverage: Number(row.rating_average || 0),
    ratingCount: row.rating_count || 0,
    enrollmentCount: row.enrollment_count || 0,
    trendingScore: row.trending_score || 0,
    thumbnail: row.thumbnail,
    accent: row.accent,
    skills: row.skills || [],
    outcomes: row.outcomes || [],
    status: row.status,
    instructorId: row.instructor_id,
    instructorName: row.instructor_name,
    instructorHeadline: row.instructor_headline || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeLesson(row) {
  if (!row) return row;
  return {
    id: row.id,
    moduleId: row.module_id,
    moduleTitle: row.module_title,
    title: row.title,
    description: row.description,
    durationSeconds: row.duration_seconds,
    preview: row.preview,
    videoUrl: row.video_url,
    transcriptUrl: row.transcript_url,
    position: row.position,
  };
}

export function serializeModule(row, lessons = []) {
  if (!row) return row;
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    position: row.position,
    lessons: lessons.map(serializeLesson),
  };
}

export function serializeReview(row) {
  if (!row) return row;
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export function serializeEnrollment(row) {
  if (!row) return row;
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    title: row.title,
    slug: row.slug,
    thumbnail: row.thumbnail,
    accent: row.accent,
    category: row.category,
    level: row.level,
    instructorName: row.instructor_name,
  };
}
