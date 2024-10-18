import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { snippets } from '../refs';
import { FirebaseCoreQueryParams, SnippetType } from '../types';

interface AddSnippetLogicTypes {
  snippet: SnippetType;
  language: FirebaseCoreQueryParams['language'];
}

const addSnippetLogic = async ({ language, snippet }: AddSnippetLogicTypes) => {
  try {
    const refPath = getRefPath({
      ref: snippets,
      language,
    });

    const snapshotArr =
      (await getContentTypeSnapshot({
        language,
        ref: snippets,
        db,
      })) || [];

    const snippetId = snippet.id;
    const isDuplicate =
      snapshotArr.length !== 0 &&
      snapshotArr.some((item: SnippetType) => item.id === snippetId);

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
