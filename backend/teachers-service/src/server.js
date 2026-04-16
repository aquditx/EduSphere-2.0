import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
