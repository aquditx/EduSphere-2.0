import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import coursesRoutes from './routes/courses.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';
import dashboardsRoutes from './routes/dashboards.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'courses-service' }));

// Dashboards mount BEFORE /courses so /courses/dashboard/* doesn't shadow /courses/:id.
app.use('/courses/dashboard', dashboardsRoutes);
app.use('/courses', coursesRoutes);
app.use('/enrollments', enrollmentsRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`[courses-service] running on port ${PORT}`);
});
