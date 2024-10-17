import { getRefPath } from './get-ref-path';

const getContentTypeSnapshot = async ({ language, ref, db }) => {
  const refPath = getRefPath({ language, ref });
  const refObj = db.ref(refPath);
  const snapshot = await refObj.once('value');
  const valSnapshotData = snapshot.val();
  return valSnapshotData;
};

export { getContentTypeSnapshot };
