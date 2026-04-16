const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Microservices — single source of truth for service URLs.
const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:5000';
const PROGRESS_SERVICE = process.env.PROGRESS_SERVICE || 'http://localhost:5001';
const COURSES_SERVICE = process.env.COURSES_SERVICE || 'http://localhost:5002';
const TEACHERS_SERVICE = process.env.TEACHERS_SERVICE || 'http://localhost:5003';

// Health endpoint for the gateway itself.
app.get('/health', (_req, res) => res.json({ ok: true, service: 'gateway' }));

// ----------------------------------------------------------------------------
// Proxy rules
// ----------------------------------------------------------------------------
// IMPORTANT — Express strips the mount path (e.g. "/api/courses") before
// http-proxy-middleware sees the request, so `pathRewrite` patterns like
// `^/api/courses` never match. We use function-form pathRewrite that operates
// on the already-stripped path, making the rewrite explicit.
//
// For AUTH and PROGRESS, the target services mount their routes at "/", so
// the stripped path can pass through untouched.
//
// For COURSES, ENROLLMENTS, and TEACHERS, the target services mount their
// routes under a prefix (e.g. "/courses"), so we prepend that prefix back.
// ----------------------------------------------------------------------------

// Auth — register/login/validate/protected + /users/*
// auth_login mounts routes at "/" and "/users"
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
  })
);

// Progress tracker (MongoDB) — routes mounted at "/"
app.use(
  '/api/progress',
  createProxyMiddleware({
    target: PROGRESS_SERVICE,
    changeOrigin: true,
  })
);

// Courses CMS — courses-service mounts at "/courses" and "/courses/dashboard"
app.use(
  '/api/courses',
  createProxyMiddleware({
    target: COURSES_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/courses${path}`,
  })
);

// Enrollments live on courses-service under "/enrollments"
app.use(
  '/api/enrollments',
  createProxyMiddleware({
    target: COURSES_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/enrollments${path}`,
  })
);

// Teachers CMS — teachers-service mounts at "/teachers"
app.use(
  '/api/teachers',
  createProxyMiddleware({
    target: TEACHERS_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/teachers${path}`,
  })
);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
  console.log(`  auth     -> ${AUTH_SERVICE}`);
  console.log(`  progress -> ${PROGRESS_SERVICE}`);
  console.log(`  courses  -> ${COURSES_SERVICE}`);
  console.log(`  teachers -> ${TEACHERS_SERVICE}`);
});
