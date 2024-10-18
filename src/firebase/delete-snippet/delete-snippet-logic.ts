import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { snippets } from '../refs';

const deleteSnippetLogic = async ({ language, id }) => {
  try {
    const refPath = getRefPath({
      ref: snippets,
      language,
    });
    const snippetSnapshot = await getContentTypeSnapshot({
      language,
      ref: snippets,
      db,
    });
    const updatedSnippetArr = snippetSnapshot.filter((item) => item.id !== id);
    await db.ref(refPath).set(updatedSnippetArr);
  } catch (error) {
    throw new Error(`Error deleting snippet for ${language}`);
  }
};

export { deleteSnippetLogic };
