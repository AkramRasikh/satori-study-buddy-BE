import { db } from './init';
import { tempContent } from './refs';

const ref = tempContent;

const updateContentItem = async ({ sentenceId, topicName, fieldToUpdate }) => {
  try {
    const refObj = db.ref(ref);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    // Convert object of objects to an array

    const values = Object.values(data) as any;

    // Find the index of the object to update
    const index = values.findIndex((item) => {
      return (item as any).title === topicName;
    });

    if (index !== -1) {
      const thisTopicContent = values[index].content;
      // two in one refactor needed
      const targetSentenceIndex = thisTopicContent.findIndex(
        (sentence) => sentence.id === sentenceId,
      );

      // Firebase paths should be strings
      const objectRef = refObj.child(`${index}/content/${targetSentenceIndex}`);

      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        sentenceId,
        fieldToUpdate,
      });
      return fieldToUpdate;
    } else {
      console.log('## updateContentItem Object not found');
      return false;
    }
  } catch (error) {
    console.error('## updateContentItem error:', error);
  }
};

export { updateContentItem };
