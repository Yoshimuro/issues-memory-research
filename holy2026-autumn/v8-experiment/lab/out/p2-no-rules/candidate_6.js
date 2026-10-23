function normalizeUser(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};

  const result = {
    id: input.id != null ? input.id : null,
    name: typeof input.name === 'string' && input.name.trim() !== '' ? input.name : 'Anonymous',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
    plan: typeof input.plan === 'string' && input.plan.trim() !== '' ? input.plan : 'free',
    credits: Number.isFinite(input.credits) ? input.credits : 0,
  };

  if (input.referrer != null) {
    result.referrer = input.referrer;
  }
  if (input.trialUntil != null) {
    result.trialUntil = input.trialUntil;
  }
  if (input.teamId != null) {
    result.teamId = input.teamId;
  }

  return result;
}

module.exports = { normalizeUser };
