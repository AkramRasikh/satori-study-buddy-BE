import { Request, Response } from 'express';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { sentences, words } from '../refs';

const addSentenceToDb = async ({ language, sentence }) => {
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

    const isDuplicate = sentencesSnapShotArr.some(
      (item) => item.id === sentence.id,
    );

    if (!isDuplicate) {
      sentencesSnapShotArr.push(sentence);
      await db.ref(refPath).set(sentencesSnapShotArr);
      console.log('## addSentenceToDb success');
    }
    return true;
  } catch (error) {
    console.log('## addSentenceToDb error', error);
    throw new Error('Error trying to add sentence to DB');
  }
};

const updateWordContext = async ({ matchedWord, sentenceId, language }) => {
  const snapshotArr = await getContentTypeSnapshot({
    ref: words,
    language,
    db,
  });

  const index = snapshotArr.findIndex((i) => i.baseForm === matchedWord);

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
    throw new Error(`Couldn't find baseForm matching ${matchedWord}`);
  }
};

const addWordContext = async (req: Request, res: Response) => {
  const {
    id,
    baseLang,
    targetLang,
    matchedWords,
    tokenised,
    language,
    reviewData,
  } = req.body;
  try {
    const sentence = {
      id,
      baseLang,
      targetLang,
      matchedWords,
      tokenised,
      reviewData,
    };
    await addSentenceToDb({ language, sentence });
    const wordsWithUpdatedContext = await Promise.all(
      matchedWords.map(
        async (matchedWord) =>
          await updateWordContext({ matchedWord, sentenceId: id, language }),
      ),
    );

    res.status(200).json(wordsWithUpdatedContext);
  } catch (error) {
    console.log('## addWordContext error', error);
    res.status(400).json(error);
  }
};

export { addWordContext };
