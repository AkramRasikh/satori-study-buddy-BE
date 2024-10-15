import { getRefPath } from '../utils/get-ref-path';
import { db } from './init';
import { content } from './refs';
import { getThisContentsIndex } from './update-and-create-review';

const getLanguageContentData = async ({ language, topicName }) => {
  try {
    const refPath = getRefPath({
      language,
      ref: content,
    });
    const refObj = db.ref(refPath);
    const snapshot = await refObj.once('value');
    const data = snapshot.val();

    const { index, keys } = getThisContentsIndex({
      data,
      contentEntry: topicName,
    });

    if (index !== -1) {
      const key = keys[index];
      const languageContent = data[key].content.filter((i) => i !== null);

      return languageContent;
    } else {
      return null;
    }
  } catch (error) {
    console.error('## updateContentItem error:', error);
  }
};

export { getLanguageContentData };
