import { Database } from 'firebase-admin/lib/database/database';
import { FirebaseCoreQueryParams } from '../firebase/types';
import { getRefPath } from './get-ref-path';

interface GetContentTypeSnapshotTypes {
  language: FirebaseCoreQueryParams['language'];
  ref: FirebaseCoreQueryParams['ref'];
  db: Database;
}

const getContentTypeSnapshot = async ({
  language,
  ref,
  db,
}: GetContentTypeSnapshotTypes) => {
  try {
    const refPath = getRefPath({ language, ref });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const valSnapshotData = snapshot.val();
    return valSnapshotData;
  } catch (error) {
    throw new Error(`Error getting snapshot of ${ref} for ${language}`);
  }
};

export { getContentTypeSnapshot };
