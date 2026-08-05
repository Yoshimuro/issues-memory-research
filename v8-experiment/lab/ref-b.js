'use strict';
// Эталон MEGA: та же семантика, но три последних поля добавляются условным спредом.
function normalizeUser(raw) {
  return {
    id: raw.id,
    name: raw.name ?? '',
    email: raw.email ?? '',
    plan: raw.plan ?? 'free',
    credits: raw.credits ?? 0,
    ...(raw.referrer && { referrer: raw.referrer }),
    ...(raw.trialUntil && { trialUntil: raw.trialUntil }),
    ...(raw.teamId && { teamId: raw.teamId }),
  };
}
module.exports = { normalizeUser };
