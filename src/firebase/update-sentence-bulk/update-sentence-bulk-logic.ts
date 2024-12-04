import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';
import { getThisContentsIndex } from '../firebase-utils/get-content-sentence-index-keys';

const updateSentenceBulkLogic = async ({ title, language, fieldToUpdate }) => {
  try {
    const refPath = getRefPath({ language, ref: content });
    const contentSnapshotArr = await getContentTypeSnapshot({
      language,
      ref: content,
      db,
    });

    const { keys, index } = getThisContentsIndex({
      data: contentSnapshotArr,
      title,
    });

    if (index !== -1) {
      const key = keys[index];
      const thisTopicData = contentSnapshotArr[key];
      const thisTopicContent = thisTopicData.content;
      const contentWithUpdatedReviewData = thisTopicContent.map(
        (sentenceWidget) => {
          return {
            ...sentenceWidget,
            ...fieldToUpdate,
          };
        },
      );
      const refObj = db.ref(refPath);
      const objectRef = refObj.child(key);
      await objectRef.update({ content: contentWithUpdatedReviewData });
      return contentWithUpdatedReviewData;
    } else {
      throw new Error("Couldn't find content to update");
    }
  } catch (error) {
    throw new Error('Error updating content metadata');
  }
};
export { updateSentenceBulkLogic };
