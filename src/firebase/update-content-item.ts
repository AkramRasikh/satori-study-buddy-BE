import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';
import { content } from './refs';
import {
  getThisContentsIndex,
  getThisSentenceIndex,
} from './get-content-sentence-index-keys';

const updateContentItem = async ({ id, language, title, fieldToUpdate }) => {
  try {
    const refPath = getRefPath({ language, ref: content });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { index, keys } = getThisContentsIndex({
      data,
      title,
    });

    if (index !== -1) {
      const key = keys[index];
      const thisTopicContent = data[key].content;
      // two in one refactor needed

      const { sentenceKeys, sentenceIndex } = getThisSentenceIndex({
        data: thisTopicContent,
        id,
      });

      const thisSentenceKey = sentenceKeys[sentenceIndex];

      // Firebase paths should be strings
      const objectRef = refObj.child(`${key}/content/${thisSentenceKey}`);
      await objectRef.update(fieldToUpdate);
      console.log('## Data successfully updated!', {
        id,
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
