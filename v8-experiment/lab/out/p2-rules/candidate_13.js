'use strict';

function normalizeUser(raw) {
  const src = raw != null ? raw : {};

  return {
    id: src.id != null ? src.id : null,
    name: typeof src.name === 'string' ? src.name : '',
    email: typeof src.email === 'string' ? src.email : '',
    plan: typeof src.plan === 'string' ? src.plan : 'free',
    credits: typeof src.credits === 'number' ? src.credits : 0,
    referrer: src.referrer != null ? src.referrer : null,
    trialUntil: src.trialUntil != null ? src.trialUntil : null,
    teamId: src.teamId != null ? src.teamId : null
  };
}

module.exports = { normalizeUser };
