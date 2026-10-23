function normalizeUser(raw) {
  const src = (raw && typeof raw === 'object') ? raw : {};
  const result = {};

  result.id = src.id != null ? String(src.id) : '';

  result.name = typeof src.name === 'string' && src.name.trim() !== ''
    ? src.name.trim()
    : 'Anonymous';

  result.email = typeof src.email === 'string'
    ? src.email.trim().toLowerCase()
    : '';

  const allowedPlans = ['free', 'pro', 'enterprise'];
  result.plan = allowedPlans.includes(src.plan) ? src.plan : 'free';

  const creditsNum = Number(src.credits);
  result.credits = Number.isFinite(creditsNum) && creditsNum >= 0
    ? Math.floor(creditsNum)
    : 0;

  if (src.referrer != null) {
    result.referrer = String(src.referrer);
  }

  if (src.trialUntil != null) {
    const d = new Date(src.trialUntil);
    if (!Number.isNaN(d.getTime())) {
      result.trialUntil = d.toISOString();
    }
  }

  if (src.teamId != null) {
    result.teamId = String(src.teamId);
  }

  return result;
}

module.exports = { normalizeUser };
