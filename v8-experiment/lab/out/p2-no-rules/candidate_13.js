function normalizeUser(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};

  const result = {
    id: src.id != null ? String(src.id) : '',
    name: typeof src.name === 'string' && src.name.trim() !== '' ? src.name.trim() : 'Anonymous',
    email: typeof src.email === 'string' ? src.email.trim().toLowerCase() : '',
    plan: typeof src.plan === 'string' && src.plan.trim() !== '' ? src.plan.trim() : 'free',
    credits: Number.isFinite(Number(src.credits)) ? Number(src.credits) : 0,
  };

  if (src.referrer != null) {
    result.referrer = String(src.referrer);
  }

  if (src.trialUntil != null) {
    const d = new Date(src.trialUntil);
    result.trialUntil = isNaN(d.getTime()) ? null : d.toISOString();
  }

  if (src.teamId != null) {
    result.teamId = String(src.teamId);
  }

  return result;
}

module.exports = { normalizeUser };
