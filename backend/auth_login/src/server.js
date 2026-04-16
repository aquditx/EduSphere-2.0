import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env relative to THIS file, not process.cwd().
// Matters when the service is launched from a parent directory
// (e.g. a monorepo root runner) so env loading is always correct.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());               // REQUIRED
app.use(express.json());

app.use('/users', usersRoutes);
app.use('/', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
