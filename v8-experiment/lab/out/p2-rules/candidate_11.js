const DEFAULT_PLAN = 'free';
const DEFAULT_CREDITS = 0;

function normalizeUser(raw) {
  const src = raw != null ? raw : {};

  return {
    id: src.id != null ? String(src.id) : '',
    name: typeof src.name === 'string' ? src.name : '',
    email: typeof src.email === 'string' ? src.email : '',
    plan: typeof src.plan === 'string' ? src.plan : DEFAULT_PLAN,
    credits: typeof src.credits === 'number' ? src.credits : DEFAULT_CREDITS,
    referrer: src.referrer != null ? String(src.referrer) : null,
    trialUntil: src.trialUntil != null ? String(src.trialUntil) : null,
    teamId: src.teamId != null ? String(src.teamId) : null,
  };
}

module.exports = { normalizeUser };
