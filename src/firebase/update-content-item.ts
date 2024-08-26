import { db } from './init';
import { japaneseContent } from './refs';
import {
  getThisContentsIndex,
  getThisSentenceIndex,
} from './update-and-create-review';

const updateContentItem = async ({ sentenceId, topicName, fieldToUpdate }) => {
  try {
    const refObj = db.ref(japaneseContent);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { index, keys } = getThisContentsIndex({
      data,
      contentEntry: topicName,
    });

    if (index !== -1) {
      const key = keys[index];
      const thisTopicContent = data[key].content;
      // two in one refactor needed

      const { sentenceKeys, sentenceIndex } = getThisSentenceIndex({
        data: thisTopicContent,
        id: sentenceId,
      });

      const thisSentenceKey = sentenceKeys[sentenceIndex];

      // Firebase paths should be strings
      const objectRef = refObj.child(`${key}/content/${thisSentenceKey}`);
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
