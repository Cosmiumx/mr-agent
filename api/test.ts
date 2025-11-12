import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({
    message: 'Test endpoint works!',
    method: req.method,
    url: req.url,
    query: req.query,
  });
}

