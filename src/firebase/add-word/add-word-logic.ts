import { v4 as uuidv4 } from 'uuid';
import { chatGPTTranslator } from '../../open-ai/translator';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { words } from '../refs';
import { FirebaseCoreQueryParams, WordType } from '../types';
import { getGoogleTranslate } from '../../language-script-helpers/google-translate';
import { filterOutNestedNulls } from '../../utils/filter-out-nested-nulls';

interface AddWordLogicType {
  word: string;
  language: FirebaseCoreQueryParams['language'];
  context: string;
  contextSentence: string;
  isGoogle?: boolean;
  reviewData?: any;
  meaning?: string;
}

const getTranslationData = async ({
  isGoogle,
  context,
  contextSentence,
  word,
  language,
}) => {
  const translationDataRes = isGoogle
    ? await getGoogleTranslate({ word, language })
    : await chatGPTTranslator({
        word,
        model: 'gpt-4',
        context: contextSentence,
        language,
      });

  return {
    id: uuidv4(),
    contexts: [context],
    surfaceForm: word,
    ...translationDataRes,
    baseForm: translationDataRes?.baseForm || word,
    phonetic:
      translationDataRes?.phonetic || translationDataRes?.transliteration,
  };
};

const addWordLogic = async ({
  word,
  language,
  context,
  contextSentence,
  isGoogle,
  reviewData,
  meaning,
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
      (item: WordType) => item?.baseForm === word || item?.surfaceForm === word,
    );

    if (!isDuplicate) {
      const wordData = await getTranslationData({
        word,
        language,
        context,
        contextSentence,
        isGoogle,
      });
      const cleanedArray = filterOutNestedNulls(wordSnapShotArr);
      await db.ref(refPath).set([
        ...cleanedArray,
        {
          ...wordData,
          definition: meaning
            ? `${meaning}; ${wordData.definition}`
            : wordData.definition,
          reviewData,
        },
      ]);
      return wordData;
    } else {
      throw new Error(`${word} already exists in ${language} word back`);
    }
  } catch (error) {
    throw new Error(error || 'Error trying to add word into DB');
  }
};

export { addWordLogic };
