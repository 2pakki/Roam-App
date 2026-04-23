import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

let adminDb: any;
let adminAuth: any;

try {
  if (!admin.apps.length) {
    let credential;
    if (fs.existsSync('serviceAccountKey.json')) {
      credential = admin.credential.cert('serviceAccountKey.json');
      console.log('Using local serviceAccountKey.json for Firebase Admin authentication.');
    } else {
      // In this environment, applicationDefault() might fail if not configured.
      // We'll try it, but catch errors to prevent crashing.
      try {
        credential = admin.credential.applicationDefault();
        console.log('Using applicationDefault() for Firebase Admin authentication.');
      } catch (e) {
        console.warn('Firebase applicationDefault() failed. Server-side Firestore will be disabled unless serviceAccountKey.json is provided.');
      }
    }

    if (credential) {
      console.log(`Initializing Firebase Admin for project: ${firebaseConfig.projectId}, database: ${firebaseConfig.firestoreDatabaseId}`);
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        credential
      });
      console.log(`Firebase Admin initialized successfully.`);
    }
  }

  const app = admin.apps.length > 0 ? admin.app() : null;
  if (app) {
    console.log(`Firebase Admin instance found for project: ${app.options.projectId || 'default'}`);
    adminDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    adminAuth = admin.auth();
    console.log(`Firestore handle created for database: ${firebaseConfig.firestoreDatabaseId}`);
  } else {
    // Provide a dummy db that returns empty results instead of crashing
    adminDb = {
      collection: () => ({
        where: () => ({
          get: async () => ({
            forEach: () => {},
            size: 0,
            docs: []
          })
        }),
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
          update: async () => {},
          delete: async () => {}
        })
      })
    };
    adminAuth = {
      verifyIdToken: async () => { throw new Error('Auth disabled'); }
    };
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export { adminDb, adminAuth };
