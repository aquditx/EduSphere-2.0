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

// Auth — register/login/validate/protected
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' },
  })
);

// Progress tracker (MongoDB)
app.use(
  '/api/progress',
  createProxyMiddleware({
    target: PROGRESS_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/progress': '' },
  })
);

// Courses CMS — courses, modules, lessons, reviews, enrollments
app.use(
  '/api/courses',
  createProxyMiddleware({
    target: COURSES_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/courses': '/courses' },
  })
);

app.use(
  '/api/enrollments',
  createProxyMiddleware({
    target: COURSES_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/enrollments': '/enrollments' },
  })
);

// Teachers CMS — teacher profiles, applications
app.use(
  '/api/teachers',
  createProxyMiddleware({
    target: TEACHERS_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/teachers': '/teachers' },
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
