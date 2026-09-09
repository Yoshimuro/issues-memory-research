'use strict';
// Сценарий "два модуля кодовой базы писали разные агенты": обе реализации
// мономорфны сами по себе (все 8 ключей всегда), но порядок полей разный.
// Выбор по чётности id → на общем потоке данных ожидается 2 shapes.

function normalizeUserA(raw) {
  const src = raw != null ? raw : {};
  return {
    id: src.id != null ? src.id : null,
    name: src.name != null ? src.name : '',
    email: src.email != null ? src.email : '',
    plan: src.plan != null ? src.plan : 'free',
    credits: src.credits != null ? src.credits : 0,
    referrer: src.referrer != null ? src.referrer : null,
    trialUntil: src.trialUntil != null ? src.trialUntil : null,
    teamId: src.teamId != null ? src.teamId : null,
  };
}

function normalizeUserB(raw) {
  const src = raw != null ? raw : {};
  return {
    id: src.id != null ? src.id : null,
    teamId: src.teamId != null ? src.teamId : null,
    trialUntil: src.trialUntil != null ? src.trialUntil : null,
    referrer: src.referrer != null ? src.referrer : null,
    credits: src.credits != null ? src.credits : 0,
    plan: src.plan != null ? src.plan : 'free',
    email: src.email != null ? src.email : '',
    name: src.name != null ? src.name : '',
  };
}

function normalizeUser(raw) {
  return (raw.id % 2 === 0) ? normalizeUserA(raw) : normalizeUserB(raw);
}

module.exports = { normalizeUser };
