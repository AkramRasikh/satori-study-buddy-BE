import { db } from './init';
import { japaneseWords } from './refs';

const updateWord = async ({ wordId, fieldToUpdate }) => {
  try {
    const refObj = db.ref(japaneseWords);
    const snapshot = await refObj.once('value');
    const wordData = snapshot.val();

    const wordDataObjValues = Object.values(wordData);
    const keys = Object.keys(wordData);

    // Find the index of the object to update
    const index = wordDataObjValues.findIndex((item) => {
      return (item as any).id === wordId;
    });

    if (index !== -1) {
      const wordKeyInWordDB = keys[index];
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
