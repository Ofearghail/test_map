import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req;

  if (method === 'GET') {
    try {
      const result = await turso.execute("SELECT * FROM projects WHERE id = ?", [id]);
      const project = result.rows[0];
      if (project) {
        res.status(200).json(project);
      } else {
        res.status(404).json({ error: "Project not found" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
