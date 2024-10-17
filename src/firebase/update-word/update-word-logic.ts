import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import {
  getThisItemsIndex,
  getThisItemsViaValues,
} from '../../utils/get-this-items-index';
import { db } from '../init';
import { words } from '../refs';

const updateFirebaseStore = async ({ language, indexKey, fieldToUpdate }) => {
  const refPath = getRefPath({ language, ref: words });
  const refObj = db.ref(refPath);
  const wordObjectRef = refObj.child(indexKey);
  await wordObjectRef.update(fieldToUpdate);
  return fieldToUpdate;
};

const updateWordLogic = async ({ id, language, fieldToUpdate }) => {
  try {
    const snapshotArr = await getContentTypeSnapshot({
      language,
      ref: words,
      db,
    });

    const indexKey = getThisItemsIndex({ snapshotArr, id });

    if (isFinite(indexKey)) {
      await updateFirebaseStore({
        language,
        indexKey: indexKey.toString(),
        fieldToUpdate,
      });
      return fieldToUpdate;
    }

    const { keys, index } = getThisItemsViaValues({ snapshotArr, id });

    if (index !== -1) {
      const indexViaValues = keys[index];
      await updateFirebaseStore({
        language,
        indexKey: indexViaValues,
        fieldToUpdate,
      });
      return fieldToUpdate;
    } else {
      throw new Error('Word not found in DB');
    }
  } catch (error) {
    throw new Error('Error querying firebase DB (words)');
  }
};

export { updateWordLogic };
