function normalizeUser(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};

  const result = {
    id: input.id != null ? String(input.id) : '',
    name: typeof input.name === 'string' && input.name.trim() !== ''
      ? input.name.trim()
      : 'Anonymous',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    plan: typeof input.plan === 'string' && input.plan.trim() !== ''
      ? input.plan.trim()
      : 'free',
    credits: Number.isFinite(Number(input.credits)) ? Number(input.credits) : 0,
  };

  if (input.referrer != null) {
    result.referrer = String(input.referrer);
  }

  if (input.trialUntil != null) {
    const date = input.trialUntil instanceof Date
      ? input.trialUntil
      : new Date(input.trialUntil);
    if (!Number.isNaN(date.getTime())) {
      result.trialUntil = date.toISOString();
    }
  }

  if (input.teamId != null) {
    result.teamId = String(input.teamId);
  }

  return result;
}

module.exports = { normalizeUser };
