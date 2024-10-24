import { v4 as uuidv4 } from 'uuid';
import { chatGPTTranslator } from '../../open-ai/translator';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { getRefPath } from '../../utils/get-ref-path';
import { db } from '../init';
import { words } from '../refs';
import { FirebaseCoreQueryParams, WordType } from '../types';
import { languageKey } from '../../eligible-languages';
import { japaneseformatTranslationPrompt } from '../../open-ai/open-ai-translate-prompts/japanese';
import { chineseformatTranslationPrompt } from '../../open-ai/open-ai-translate-prompts/chinese';

interface AddWordLogicType {
  word: string;
  language: FirebaseCoreQueryParams['language'];
  context: string;
  contextSentence: string;
}

interface GetThisLanguagePromptTypes {
  word: string;
  language: FirebaseCoreQueryParams['language'];
  context: string;
}

const getThisLanguagePrompt = ({
  word,
  language,
  context,
}: GetThisLanguagePromptTypes) => {
  if (language === languageKey.japanese) {
    return japaneseformatTranslationPrompt(word, context);
  } else if (language === languageKey.chinese) {
    return chineseformatTranslationPrompt(word, context);
  }
  throw new Error('Error matching language keys for prompt');
};

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
      const formattedTranslationPrompt = getThisLanguagePrompt({
        word,
        language,
        context: contextSentence,
      });

      const chatGptRes = await chatGPTTranslator({
        model: 'gpt-4',
        prompt: formattedTranslationPrompt,
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
