import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { content as contentRef } from '../refs';

const addContentLogic = async ({ language, content }) => {
  try {
    const refPath = getRefPath({ language, ref: contentRef });
    const snapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: contentRef,
        db,
      })) || [];

    const entryTitle = content.title;
    const isDuplicate = snapshotArr.some((item) => item.title === entryTitle);

    if (!isDuplicate) {
      snapshotArr.push(content);
      await db.ref(refPath).set(snapshotArr);
      return entryTitle;
    } else {
      throw new Error(`Error ${content.title} ${content} already exists in DB`);
    }
  } catch (error) {
    throw new Error(`Error adding ${content} to DB`);
  }
};

export { addContentLogic };
