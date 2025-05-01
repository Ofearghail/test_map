import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    id,
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
    await turso.execute(
      `
      UPDATE projects SET
        projectName = ?,
        mainPartner = ?,
        otherpartners = ?,
        projectType = ?,
        areaScope = ?,
        deliverables = ?,
        link = ?,
        lat = ?,
        lng = ?
      WHERE id = ?
      `,
      [projectName, mainPartner, otherpartners, projectType, areaScope, deliverables, link, lat, lng, id]
    );
    res.status(200).json({ message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
