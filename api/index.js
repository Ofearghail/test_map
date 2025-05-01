import express from 'express';
import cors from 'cors';
import path from 'path';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Turso client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // for static assets

// Ensure DB table exists
(async () => {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectName TEXT NOT NULL,
      mainPartner TEXT,
      otherpartners TEXT,
      projectType TEXT NOT NULL,
      areaScope TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      link TEXT NOT NULL,
      lat REAL,
      lng REAL
    )
  `);
})();

// Routes
app.get('/api/projects', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    const project = result.rows[0];
    if (project) res.json(project);
    else res.status(404).json({ error: 'Project not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { projectName, mainPartner, otherpartners, projectType, areaScope, deliverables, link, lat, lng } = req.body;
  try {
    const result = await turso.execute(
      `INSERT INTO projects (projectName, mainPartner, otherpartners, projectType, areaScope, deliverables, link, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [projectName, mainPartner, otherpartners, projectType, areaScope, deliverables, link, lat, lng]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default serverless(app);
