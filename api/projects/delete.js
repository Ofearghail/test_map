import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No project IDs provided" });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM projects WHERE id IN (${placeholders})`;
    await turso.execute(sql, ids);
    res.status(200).json({ message: 'Projects deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
