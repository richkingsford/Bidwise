import { createChallenge, randomInt, verifySolution } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { fetchNlrStations } from './nlr-afdc.mjs';
import { fetchRegionalTraffic } from './regional-traffic.mjs';

const ALTCHA_SECRET = defineSecret('ALTCHA_SECRET');
const NLR_API_KEY = defineSecret('NLR_API_KEY');
const ALLOWED_ORIGINS = new Set(['https://get-ev.io', 'https://www.get-ev.io', 'http://localhost:5000', 'http://127.0.0.1:5000']);
const usedPayloads = new Set();
const allowCors = (request, response) => {
  const origin = request.get('origin');
  if (ALLOWED_ORIGINS.has(origin)) response.set('Access-Control-Allow-Origin', origin);
  response.set('Vary', 'Origin');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export const altchaChallenge = onRequest({ region: 'us-central1', secrets: [ALTCHA_SECRET], cors: false }, async (request, response) => {
  allowCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).send('');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  try {
    const challenge = await createChallenge({
      algorithm: 'PBKDF2/SHA-256',
      cost: 5000,
      counter: randomInt(5000, 10000),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      deriveKey,
      hmacSignatureSecret: ALTCHA_SECRET.value(),
    });
    return response.set('Cache-Control', 'no-store').json(challenge);
  } catch (error) {
    console.error('ALTCHA challenge error', error);
    return response.status(500).json({ error: 'Challenge unavailable' });
  }
});

export const submitFeedback = onRequest({ region: 'us-central1', cors: false, timeoutSeconds: 15 }, async (request, response) => {
  allowCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).send('');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  try {
    const authorization = String(request.get('authorization') || '');
    if (!authorization.startsWith('Bearer ')) return response.status(401).json({ error: 'Sign-in required.' });
    const user = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const message = String(request.body?.message || '').trim();
    const email = String(request.body?.email || '').trim();
    if (!message || message.length > 5000) return response.status(400).json({ error: 'A feedback message up to 5,000 characters is required.' });
    if (email && (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email))) return response.status(400).json({ error: 'Enter a valid email address or leave it blank.' });
    const db = getAdminFirestore();
    const feedback = { message, replyTo: email || null, submittedBy: user.email || user.uid, submittedAt: new Date().toISOString(), source: 'GetEV profile feedback' };
    await db.collection('feedback').add(feedback);
    await db.collection('mail').add({ to: ['richkingsford@gmail.com'], message: { subject: `GetEV feedback from ${user.email || 'signed-in user'}`, text: `${message}${email ? `\n\nOptional reply email: ${email}` : ''}\n\nSubmitted by: ${user.email || user.uid}` }, feedback });
    return response.status(202).json({ accepted: true });
  } catch (error) {
    console.error('Feedback submission error', error?.message || error, error?.stack || '');
    return response.status(error?.code === 'auth/id-token-expired' || error?.code === 'auth/argument-error' ? 401 : 500).json({ error: 'Feedback could not be submitted.' });
  }
});

export const altchaVerify = onRequest({ region: 'us-central1', secrets: [ALTCHA_SECRET], cors: false }, async (request, response) => {
  allowCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).send('');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const payload = typeof request.body?.payload === 'string' ? request.body.payload : request.body?.altcha;
  if (!payload || payload.length > 20000) return response.status(400).json({ verified: false, error: 'Missing or invalid payload' });
  try {
    if (usedPayloads.has(payload)) return response.status(403).json({ verified: false, error: 'Payload already used' });
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!decoded?.challenge || !decoded?.solution) return response.status(400).json({ verified: false, error: 'Invalid payload' });
    const result = await verifySolution({
      challenge: decoded.challenge,
      solution: decoded.solution,
      deriveKey,
      hmacSignatureSecret: ALTCHA_SECRET.value(),
    });
    if (result.verified) {
      usedPayloads.add(payload);
      if (usedPayloads.size > 10000) usedPayloads.delete(usedPayloads.values().next().value);
    }
    return response.status(result.verified ? 200 : 403).json({ verified: result.verified });
  } catch (error) {
    console.error('ALTCHA verification error', error);
    return response.status(403).json({ verified: false });
  }
});

export const nlrStations = onRequest({ region: 'us-central1', secrets: [NLR_API_KEY], cors: false, timeoutSeconds: 30 }, async (request, response) => {
  allowCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).send('');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const latitude = Number(request.query.latitude);
  const longitude = Number(request.query.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return response.status(400).json({ error: 'Valid latitude and longitude are required.' });
  try {
    const result = await fetchNlrStations({ latitude, longitude, radius: 10, apiKey: NLR_API_KEY.value() });
    response.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response.status(200).json(result);
  } catch (error) {
    console.error('NLR station lookup error', error);
    return response.status(502).json({ error: 'NLR station data unavailable.' });
  }
});

export const regionalTraffic = onRequest({ region: 'us-central1', cors: false, timeoutSeconds: 30 }, async (request, response) => {
  allowCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).send('');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const state = String(request.query.state || '').trim().toUpperCase();
  const latitude = Number(request.query.latitude); const longitude = Number(request.query.longitude);
  if (!['CO', 'NV', 'AZ', 'OR', 'ID'].includes(state)) return response.status(400).json({ error: 'A configured state (CO, NV, AZ, OR, or ID) is required.' });
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return response.status(400).json({ error: 'Valid latitude and longitude are required.' });
  try { const result = await fetchRegionalTraffic({ state, latitude, longitude, radiusMiles: 1 }); response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); return response.status(200).json(result); } catch (error) { console.error('Regional traffic lookup error', error); return response.status(502).json({ error: 'Regional traffic data unavailable.' }); }
});
