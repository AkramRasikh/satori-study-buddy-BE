import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';
import { adhocSentences } from './refs';

const updateAdhocSentence = async ({ sentenceId, language, fieldToUpdate }) => {
  try {
    const refPath = getRefPath({ language, ref: adhocSentences });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const values = Object.values(data);
    const keys = Object.keys(data);
    const thisSentenceIndex = values.findIndex(
      (sentenceData: any) => sentenceData?.id === sentenceId,
    );

    if (thisSentenceIndex !== -1) {
      const key = keys[thisSentenceIndex];
      // Firebase paths should be strings
      const objectRef = refObj.child(key);
      await objectRef.update(fieldToUpdate);
      console.log('## updateAdhocSentence Data successfully updated!', {
        sentenceId,
        fieldToUpdate,
      });
      return fieldToUpdate;
    } else {
      console.log('## updateAdhocSentence Object not found');
      return false;
    }
  } catch (error) {
    console.error('## updateAdhocSentence error:', error);
  }
};

export { updateAdhocSentence };
