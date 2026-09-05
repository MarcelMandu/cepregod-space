const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://modern-molly-163476.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAn6UAAIgcDFmNDBkMmJlOTQ3MTI0MTgwOTIwMGZlOTY4MDNhODJhOQ';

async function redisGet(key) {
  const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
    headers: { 'Authorization': `Bearer ${UPSTASH_TOKEN}` }
  });
  const data = await res.json();
  return data.result;
}

async function redisSet(key, value) {
  const res = await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function redisDel(key) {
  const res = await fetch(`${UPSTASH_URL}/del/${key}`, {
    headers: { 'Authorization': `Bearer ${UPSTASH_TOKEN}` }
  });
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const drawing = await redisGet('sorteo:drawing');
      const winner = await redisGet('sorteo:winner');
      const participants = await redisGet('sorteo:participants') || [];
      return res.status(200).json({
        drawing: !!drawing,
        winner: winner || null,
        participants
      });
    }

    if (req.method === 'POST') {
      const { action, participant, drawing, winner } = req.body;

      if (action === 'register' && participant) {
        const participants = await redisGet('sorteo:participants') || [];
        const newId = participants.length > 0 ? participants[participants.length - 1].id + 1 : 1;
        const newParticipant = { ...participant, id: newId };
        participants.push(newParticipant);
        await redisSet('sorteo:participants', participants);
        return res.status(200).json({ ok: true, participant: newParticipant });
      }

      if (action === 'draw') {
        if (drawing !== undefined) await redisSet('sorteo:drawing', drawing);
        if (winner !== undefined) {
          if (winner === null) {
            await redisDel('sorteo:winner');
          } else {
            await redisSet('sorteo:winner', winner);
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
