const Notification = require("../models/Notification");

/**
 * Lightweight helper so anywhere in the codebase can drop a notification.
 * Fails open — logs but never throws into request handlers.
 */
async function notify({ userId, type, title, body, link, icon }) {
  if (!userId) return null;
  try {
    return await Notification.create({ userId, type, title, body, link, icon });
  } catch (err) {
    console.error("[notify] failed", err.message);
    return null;
  }
}

async function notifyMany(userIds, payload) {
  if (!userIds?.length) return;
  await Promise.all(userIds.map((uid) => notify({ ...payload, userId: uid })));
}

module.exports = { notify, notifyMany };
