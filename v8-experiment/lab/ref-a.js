'use strict';
// Эталон MONO: всегда один и тот же литерал со всеми 8 полями.
function normalizeUser(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    email: raw.email ?? '',
    plan: raw.plan ?? 'free',
    credits: raw.credits ?? 0,
    referrer: raw.referrer ?? null,
    trialUntil: raw.trialUntil ?? null,
    teamId: raw.teamId ?? null,
  };
}
module.exports = { normalizeUser };
