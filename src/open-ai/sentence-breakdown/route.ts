import { Request, Response } from 'express';

import { updateSentenceInContent } from '../../firebase/update-sentence/update-sentence-logic';
import chatGptTextAPI from '../chat-gpt';

const sentenceStructure =
  'sentenceStructure: A string that represents the sentence structure, maintaining the original word order but adding inline English meanings. For example: Format Example: word (meaning) + word (meaning) + word (meaning) Example Output for a sentence like "すでに長刀(薙刀)の稽古に励んでいます": "すでに (already) + 長刀(薙刀)の稽古 (naginata practice) + に励んでいます (is diligently practicing)"';

export const breakdownSentence = async (req: Request, res: Response) => {
  const { id, language, targetLang, title } = req.body;

  const openAIKey = process.env.OPENAI_API_KEY;
  const prompt = `Break down the following Japanese sentence into JSON format with the following structure: vocab: An array of objects where each object contains: surfaceForm: The word or phrase as it appears in the sentence. meaning: A brief explanation of its meaning in English. ${sentenceStructure}. meaning: A string giving a natural translation or explanation of the full sentence in English. Sentence to analyze: ${targetLang}`;

  try {
    const breakdown = await chatGptTextAPI({
      sentence: prompt,
      model: 'gpt-4',
      openAIKey,
    });

    if (breakdown) {
      await updateSentenceInContent({
        id,
        language,
        title,
        fieldToUpdate: breakdown,
      });
      res.status(200).json(breakdown);
    } else {
      res.status(400).json({ error: 'No breakdown?' });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};
