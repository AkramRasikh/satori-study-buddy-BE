import { v4 as uuidv4 } from 'uuid';
import { chatGPTTranslator } from '../../open-ai/translator';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { words } from '../refs';
import { FirebaseCoreQueryParams, WordType } from '../types';

interface AddWordLogicType {
  word: string;
  language: FirebaseCoreQueryParams['language'];
  context: string;
  contextSentence: string;
}

const addWordLogic = async ({
  word,
  language,
  context,
  contextSentence,
}: AddWordLogicType) => {
  try {
    const refPath = getRefPath({
      language,
      ref: words,
    });
    const wordSnapShotArr =
      (await getContentTypeSnapshot({
        language,
        ref: words,
        db,
      })) || [];

    const isDuplicate = wordSnapShotArr.some(
      (item: WordType) => item.baseForm === word || item.surfaceForm === word,
    );

    if (!isDuplicate) {
      const chatGptRes = await chatGPTTranslator({
        word,
        model: 'gpt-4',
        context: contextSentence,
      });

      const wordData = {
        id: uuidv4(),
        contexts: [context],
        surfaceForm: word,
        ...chatGptRes,
      };
      wordSnapShotArr.push(wordData);
      await db.ref(refPath).set(wordSnapShotArr);
      return wordData;
    } else {
      throw new Error(`${word} already exists in ${language} word back`);
    }
  } catch (error) {
    throw new Error('Error trying to add word into DB');
  }
};

export { addWordLogic };
