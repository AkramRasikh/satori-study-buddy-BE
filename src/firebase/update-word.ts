import { getContentTypeSnapshot } from '../utils/get-content-type-snapshot';
import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';
import { words } from './refs';

const updateWord = async ({ wordId, language, fieldToUpdate }) => {
  try {
    const wordSnapshot = await getContentTypeSnapshot({
      language,
      ref: words,
      db,
    });
    const wordDataObjValues = Object.values(wordSnapshot);
    const keys = Object.keys(wordSnapshot);

    // Find the index of the object to update
    const index = wordDataObjValues.findIndex((item) => {
      return (item as any).id === wordId;
    });

    if (index !== -1) {
      const wordKeyInWordDB = keys[index];
      const refPath = getRefPath({ language, ref: words });
      const refObj = db.ref(refPath);
      const wordObjectRef = refObj.child(wordKeyInWordDB);
      await wordObjectRef.update(fieldToUpdate);
      return fieldToUpdate;
    } else {
      console.log('## updateWord Object not found');
      return false;
    }
  } catch (error) {
    console.error('## updateContent error:', error);
  }
};

export { updateWord };
