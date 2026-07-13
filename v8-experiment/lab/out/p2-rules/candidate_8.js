'use strict';

function normalizeUser(raw) {
  const src = (raw !== null && typeof raw === 'object') ? raw : {};

  return {
    id: src.id != null ? String(src.id) : '',
    name: src.name != null ? String(src.name) : '',
    email: src.email != null ? String(src.email) : '',
    plan: src.plan != null ? String(src.plan) : 'free',
    credits: typeof src.credits === 'number' ? src.credits : 0,
    referrer: src.referrer != null ? String(src.referrer) : null,
    trialUntil: src.trialUntil != null ? String(src.trialUntil) : null,
    teamId: src.teamId != null ? String(src.teamId) : null,
  };
}

module.exports = { normalizeUser };
