'use strict';

function normalizeUser(raw) {
  const src = (raw !== null && typeof raw === 'object') ? raw : {};

  return {
    id: src.id != null ? String(src.id) : '',
    name: typeof src.name === 'string' ? src.name : '',
    email: typeof src.email === 'string' ? src.email : '',
    plan: typeof src.plan === 'string' ? src.plan : 'free',
    credits: typeof src.credits === 'number' ? src.credits : 0,
    referrer: typeof src.referrer === 'string' ? src.referrer : null,
    trialUntil: typeof src.trialUntil === 'number' ? src.trialUntil : null,
    teamId: src.teamId != null ? String(src.teamId) : null
  };
}

module.exports = { normalizeUser };
