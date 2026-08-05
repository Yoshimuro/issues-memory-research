function normalizeUser(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};

  const toStr = (v) => (v === undefined || v === null ? '' : String(v).trim());

  const id = toStr(src.id) || null;

  const name = toStr(src.name) || 'Anonymous';

  const email = toStr(src.email).toLowerCase();

  const validPlans = ['free', 'pro', 'enterprise'];
  const rawPlan = toStr(src.plan).toLowerCase();
  const plan = validPlans.includes(rawPlan) ? rawPlan : 'free';

  let credits = Number(src.credits);
  if (!Number.isFinite(credits) || credits < 0) credits = 0;

  const result = { id, name, email, plan, credits };

  if (src.referrer !== undefined && src.referrer !== null && toStr(src.referrer) !== '') {
    result.referrer = toStr(src.referrer);
  }

  if (src.trialUntil !== undefined && src.trialUntil !== null && toStr(src.trialUntil) !== '') {
    const d = new Date(src.trialUntil);
    if (!isNaN(d.getTime())) result.trialUntil = d.toISOString();
  }

  if (src.teamId !== undefined && src.teamId !== null && toStr(src.teamId) !== '') {
    result.teamId = toStr(src.teamId);
  }

  return result;
}

module.exports = { normalizeUser };
