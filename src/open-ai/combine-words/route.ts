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

const combineWords = async (req: Request, res: Response) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;
  const inputWords = req.body.inputWords;
  const language = req.body.language;

  const getDueItems = (items) => {
    const now = new Date(); // Current time

    return items
      .filter((item) => {
        // Check if reviewData exists and has a due date
        if (!item.reviewData || !item.reviewData.due) return false;

        // Convert due date string to Date object
        const dueDate = new Date(item.reviewData.due);

        // Return true if the due date is in the past (or now)
        return dueDate <= now;
      })
      .slice(0, 25); // Take first 25 due items
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
  });
  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'deepseek-chat',
      openAIKey: deepseekKey,
    });
    console.log('## resultContent', resultContent);
    const sentencesFromResult = resultContent.sentences;

    const sentencesWithIds = sentencesFromResult.map((sentence) => ({
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
