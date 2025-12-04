import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase-service-account.json'), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
