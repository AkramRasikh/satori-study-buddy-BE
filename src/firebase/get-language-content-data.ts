import { db } from './init';
import { japaneseContent } from './refs';
import { getThisContentsIndex } from './update-and-create-review';

const getLanguageContentData = async ({ topicName }) => {
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
