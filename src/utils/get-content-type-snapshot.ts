import { getRefPath } from './get-ref-path';

const getContentTypeSnapshot = async ({ language, ref, db }) => {
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
