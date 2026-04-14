import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import teachersRoutes from './routes/teachers.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '512kb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'teachers-service' }));

app.use('/teachers', teachersRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`[teachers-service] running on port ${PORT}`);
});
