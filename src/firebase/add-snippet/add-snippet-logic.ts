import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';

const addSnippetLogic = async ({ language, snippet }) => {
  try {
    const refPath = getRefPath({
      ref: snippet,
      language,
    });

    const snapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: snippet,
        db,
      })) || [];

    const snippetId = snippet.id;
    const isDuplicate =
      snapshotArr.length !== 0 &&
      snapshotArr.some((item) => item.id === snippetId);

    if (!isDuplicate) {
      snapshotArr.push(snippet);
      await db.ref(refPath).set(snapshotArr);
    } else {
      throw new Error(`Error snippet already exists ${language}`);
    }
  } catch (error) {
    throw new Error(`Error adding snippets for ${language}`);
  }
};

export { addSnippetLogic };
