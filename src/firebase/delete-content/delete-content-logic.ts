import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content } from '../refs';

const deleteContentLogic = async ({ language, title }) => {
  try {
    const refPath = getRefPath({
      ref: content,
      language,
    });
    const contentSnapshot = await getContentTypeSnapshot({
      language,
      ref: content,
      db,
    });
    const updatedContentArr = contentSnapshot.filter(
      (item) => item.title !== title,
    );
    await db.ref(refPath).set(updatedContentArr);
  } catch (error) {
    throw new Error(error || `Error deleting content (logic) for ${language}`);
  }
};

export { deleteContentLogic };
