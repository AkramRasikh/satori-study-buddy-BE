import { db } from './init';
import { japaneseAdhocSentences } from './refs';

const updateAdhocSentence = async ({ sentenceId, fieldToUpdate }) => {
  console.log('## updateAdhocSentence 1');
  try {
    console.log('## updateAdhocSentence 2');
    const refObj = db.ref(japaneseAdhocSentences);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const thisSentenceIndex = Object.values(data).findIndex(
      (sentenceData: any) => sentenceData?.id === sentenceId,
    );

    console.log('## updateAdhocSentence 3', { thisSentenceIndex });
    if (thisSentenceIndex !== -1) {
      console.log('## updateAdhocSentence 4');
      // Firebase paths should be strings
      const objectRef = refObj.child(`${thisSentenceIndex}`);
      await objectRef.update(fieldToUpdate);
      console.log('## updateAdhocSentence 5 Data successfully updated!', {
        sentenceId,
        fieldToUpdate,
      });
      console.log('## updateAdhocSentence 6');
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
