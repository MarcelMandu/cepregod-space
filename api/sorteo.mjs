import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  console.log('Sorteo API:', req.method, JSON.stringify(req.body));
  console.log('Redis URL defined:', !!process.env.UPSTASH_REDIS_REST_URL);
  console.log('Redis Token defined:', !!process.env.UPSTASH_REDIS_REST_TOKEN);

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
      const participants = (await redis.get('sorteo:participants')) || [];
      return res.status(200).json({
        drawing: !!drawing,
        winner: winner || null,
        participants
      });
    }

    if (req.method === 'POST') {
      const { action, participant, drawing, winner } = req.body;

      if (action === 'register' && participant) {
        const participants = (await redis.get('sorteo:participants')) || [];
        const newId = participants.length > 0 ? participants[participants.length - 1].id + 1 : 1;
        const newParticipant = { ...participant, id: newId };
        participants.push(newParticipant);
        await redis.set('sorteo:participants', participants);
        return res.status(200).json({ ok: true, participant: newParticipant });
      }

      if (action === 'draw') {
        if (drawing !== undefined) await redis.set('sorteo:drawing', drawing);
        if (winner !== undefined) {
          if (winner === null) {
            await redis.del('sorteo:winner');
          } else {
            await redis.set('sorteo:winner', winner);
          }
        }
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
