const DEFAULT_PLAN = 'free';

function normalizeUser(raw) {
  const src = raw != null ? raw : {};

  return {
    id: src.id != null ? src.id : null,
    name: src.name != null ? src.name : '',
    email: src.email != null ? src.email : '',
    plan: src.plan != null ? src.plan : DEFAULT_PLAN,
    credits: typeof src.credits === 'number' ? src.credits : 0,
    referrer: src.referrer != null ? src.referrer : null,
    trialUntil: src.trialUntil != null ? src.trialUntil : null,
    teamId: src.teamId != null ? src.teamId : null,
  };
}

module.exports = { normalizeUser };
