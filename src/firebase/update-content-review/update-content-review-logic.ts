import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';
import { getThisContentsIndex } from '../update-and-create-review';

const updateContentMetaDataLogic = async ({
  title,
  language,
  fieldToUpdate,
}) => {
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
      const refObj = db.ref(refPath);
      const objectRef = refObj.child(key);

      await objectRef.update(fieldToUpdate);
      return fieldToUpdate;
    } else {
      throw new Error("Couldn't find content to update");
    }
  } catch (error) {
    throw new Error('Error updating content metadata');
  }
};

export { updateContentMetaDataLogic };
