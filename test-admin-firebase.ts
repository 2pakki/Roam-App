import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

async function test() {
  try {
    console.log('Testing Firebase Admin connection...');
    console.log('Project:', firebaseConfig.projectId);
    console.log('Database:', firebaseConfig.firestoreDatabaseId);

    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
        credential: admin.credential.applicationDefault()
      });
    }

    const db = getFirestore(admin.app());
    console.log('Attempting to list collections in (default) database...');
    const collections = await db.listCollections();
    console.log('Collections in (default):', collections.map(c => c.id));
    
    console.log('Attempting to read cached_events...');
    const snap = await db.collection('cached_events').limit(1).get();
    console.log('Read successful, docs found:', snap.size);
  } catch (err: any) {
    console.error('Test failed:', err);
  }
}

test();
