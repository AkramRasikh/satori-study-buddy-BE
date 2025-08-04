import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { deepSeekChatAPI } from '../chat-gpt';
import { combineWordsPrompt } from './prompt';
import {
  addSentencesBulkToDb,
  updateWordContext,
} from '../../firebase/add-word-context/route';
import { getInitSentenceCard } from '../../../create-card';
import googleTextToSpeechAPI from '../google-text-to-speech';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';
import { words } from '../../firebase/refs';
import { db } from '../../firebase/init';

const isDueCheck = (sentence, todayDateObj) => {
  return (
    (sentence?.nextReview && sentence.nextReview < todayDateObj) ||
    new Date(sentence?.reviewData?.due) < todayDateObj
  );
};

const combineWords = async (req: Request, res: Response) => {
  const deepseekKey = process.env.OPENAI_API_KEY;
  const inputWords = req.body.inputWords;
  const language = req.body.language;
  const myCombinedSentence = req.body?.myCombinedSentence;

  const getDueItems = (items) => {
    const now = new Date();
    const dueItems = [];

    for (let i = 0; i < items.length && dueItems.length < 5; i++) {
      const item = items[i];
      if (isDueCheck(item, now)) {
        dueItems.push({
          id: item.id,
          word: item.baseForm,
          definition: item.definition,
        });
      }
    }

    return dueItems;
  };
  const wordsArray = await getContentTypeSnapshot({
    ref: words,
    language,
    db,
  });

  const first25 = getDueItems(wordsArray);
  const sentencePrompt = combineWordsPrompt({
    words: inputWords,
    targetLanguage: language,
    bonusWords: first25,
    myCombinedSentence,
  });

  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'gpt-4o-mini',
      openAIKey: deepseekKey,
    });
    const sentencesFromResult = resultContent?.sentence;

    const sentencesWithIds = [sentencesFromResult].map((sentence) => ({
      id: uuidv4(),
      topic: 'sentence-helper',
      hasAudio: true,
      ...sentence,
      reviewData: getInitSentenceCard(),
    }));
    const sentencesToAddFromDB = await addSentencesBulkToDb({
      language,
      sentencesBulk: sentencesWithIds,
    });

    await Promise.all(
      sentencesWithIds.map(async (item) => {
        const id = item.id;
        const text = item.targetLang;

        return await googleTextToSpeechAPI({
          id,
          text,
          language,
        });
      }),
    );

    await Promise.all(
      sentencesToAddFromDB.map(async (sentence) => {
        const sentenceId = sentence.id;
        const matchedWordsId = sentence.matchedWordsId;

        return await Promise.all(
          matchedWordsId.map(async (matchedWordId) => {
            const result = await updateWordContext({
              wordId: matchedWordId,
              sentenceId,
              language,
            });

            return result;
          }),
        );
      }),
    );

    res.status(200).json(sentencesToAddFromDB);
  } catch (error) {
    console.log('## /combine-words error', error);
    res.status(500).json({ error });
  }
};

export { combineWords };
