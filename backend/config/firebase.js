// config/firebase.js
// Firebase Admin SDK — used for FCM push notifications (Phase 8).
// Config only in Phase 0; not wired into any feature yet.

const admin = require('firebase-admin');
const env = require('./env');

let app = null;

function getFirebaseApp() {
  if (app) return app;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    console.warn('[firebase] Credentials not set — FCM will be a no-op until Phase 8 config is added.');
    return null;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  return app;
}

module.exports = { getFirebaseApp };
