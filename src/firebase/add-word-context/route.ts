import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { sentences, words } from '../refs';

interface UpdateWordContextProps {
  matchedWord?: string;
  wordId?: string;
  sentenceId: string;
  language: string;
}

const updateWordContext = async ({
  matchedWord,
  wordId,
  sentenceId,
  language,
}: UpdateWordContextProps) => {
  const snapshotArr = await getContentTypeSnapshot({
    ref: words,
    language,
    db,
  });

  const index = snapshotArr.findIndex(
    (i) => i.baseForm === matchedWord || i.id === wordId,
  );

  if (index !== -1) {
    const wordData = snapshotArr[index];
    if (wordData.contexts.includes(sentenceId)) {
      console.log(
        `## ${wordData.baseForm} already has context for ${sentenceId}`,
      );
      return wordData;
    }

    const refPathWithIndex = `${getRefPath({
      ref: words,
      language,
    })}/${index}`;
    const refObj = db.ref(refPathWithIndex);
    const newContexts = [...wordData.contexts, sentenceId];
    await refObj.update({ contexts: newContexts });
    return {
      ...wordData,
      contexts: newContexts,
    };
  } else {
    throw new Error(`Couldn't find baseForm matching ${matchedWord || wordId}`);
  }
};

const addSentencesBulkToDb = async ({ language, sentencesBulk }) => {
  try {
    const refPath = getRefPath({
      language,
      ref: sentences,
    });
    const sentencesSnapShotArr =
      (await getContentTypeSnapshot({
        language,
        ref: sentences,
        db,
      })) || [];

    const sentencesId = sentencesBulk.map((item) => item.id);

    const duplicateIDs = sentencesSnapShotArr.filter((item) =>
      sentencesId.includes(item.id),
    );

    if (duplicateIDs?.length > 0) {
      console.log('## Not adding sentences ', duplicateIDs);
    }

    const sentencesToAdd = sentencesBulk.filter(
      (item) => !duplicateIDs.includes(item.id),
    );

    if (sentencesToAdd.length > 0) {
      await db.ref(refPath).set([...sentencesSnapShotArr, ...sentencesToAdd]);
      console.log('## bulk sentences added');
      return sentencesToAdd;
    }

    return true;
  } catch (error) {
    console.log('## addSentenceToDb error', error);
    throw new Error('Error trying to bulk add sentence to DB');
  }
};

export { addSentencesBulkToDb, updateWordContext };
