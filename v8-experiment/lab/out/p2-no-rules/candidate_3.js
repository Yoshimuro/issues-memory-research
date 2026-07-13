function normalizeUser(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};

  const toStr = (v, fallback) =>
    v === undefined || v === null ? fallback : String(v);

  const id = toStr(src.id, '');
  const name = toStr(src.name, 'Unknown');
  const email = toStr(src.email, '').trim().toLowerCase();
  const plan = toStr(src.plan, 'free');

  let credits = Number(src.credits);
  if (!Number.isFinite(credits) || credits < 0) credits = 0;

  const result = { id, name, email, plan, credits };

  if (src.referrer !== undefined && src.referrer !== null) {
    result.referrer = toStr(src.referrer, '');
  }

  if (src.trialUntil !== undefined && src.trialUntil !== null) {
    result.trialUntil = src.trialUntil;
  }

  if (src.teamId !== undefined && src.teamId !== null) {
    result.teamId = toStr(src.teamId, '');
  }

  return result;
}

module.exports = { normalizeUser };
