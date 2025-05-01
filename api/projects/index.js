import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure the table exists
const ensureTable = async () => {
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
};

export default async function handler(req, res) {
  await ensureTable();

  if (req.method === 'GET') {
    try {
      const result = await turso.execute("SELECT * FROM projects");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const {
      projectName,
      mainPartner,
      otherpartners,
      projectType,
      areaScope,
      deliverables,
      link,
      lat,
      lng
    } = req.body;

    try {
      const result = await turso.execute(
        `
        INSERT INTO projects (
          projectName, mainPartner, otherpartners, projectType,
          areaScope, deliverables, link, lat, lng
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
        `,
        [projectName, mainPartner, otherpartners, projectType, areaScope, deliverables, link, lat, lng]
      );
      res.status(201).json({ id: result.rows[0]?.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
