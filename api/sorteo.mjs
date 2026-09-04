import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const drawing = await redis.get('sorteo:drawing');
      const winner = await redis.get('sorteo:winner');
      return res.status(200).json({ drawing: !!drawing, winner: winner || null });
    }

    if (req.method === 'POST') {
      const { drawing, winner } = req.body;

      if (drawing !== undefined) {
        await redis.set('sorteo:drawing', drawing);
      }
      if (winner !== undefined) {
        if (winner === null) {
          await redis.del('sorteo:winner');
        } else {
          await redis.set('sorteo:winner', winner);
        }
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
