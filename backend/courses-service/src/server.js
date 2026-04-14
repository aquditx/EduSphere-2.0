import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import coursesRoutes from './routes/courses.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'courses-service' }));

app.use('/courses', coursesRoutes);
app.use('/enrollments', enrollmentsRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`[courses-service] running on port ${PORT}`);
});
