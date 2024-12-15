import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import chatGptTextAPI from '../chat-gpt';
import { wordCombinationPrompt } from './prompt';
import { tokenizeSentence } from '../../language-script-helpers/kanji-to-hiragana';

const combineWords = async (req: Request, res: Response) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  const inputWords = req.body.inputWords;
  const language = req.body.language;
  const sentence = wordCombinationPrompt(inputWords, language);
  try {
    const resultContent = await chatGptTextAPI({
      sentence,
      model: 'gpt-4',
      openAIKey,
    });

    const combinedWordsWithIdAndTokenised = await Promise.all(
      resultContent.map(async (sentence) => {
        return {
          id: uuidv4(),
          ...sentence,
          tokenised: await tokenizeSentence({ sentence: sentence.targetLang }),
        };
      }),
    );

    console.log('## /combine-words success', combinedWordsWithIdAndTokenised);
    res.status(200).json(combinedWordsWithIdAndTokenised);
  } catch (error) {
    console.log('## /combine-words error', error);
    res.status(500).json({ error });
  }
};

export { combineWords };
